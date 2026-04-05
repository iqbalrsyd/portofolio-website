#!/bin/bash

# ============================================
# Deploy Script - Portfolio Website
# ============================================
# Script untuk deploy static files ke VPS
# ============================================

# Warna untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Konfigurasi VPS (EDIT SESUAI VPS ANDA)
VPS_USER="root"                    # User VPS Anda
VPS_HOST="151.240.0.97"           # IP VPS Anda
VPS_PORT="22"                      # SSH Port (default 22)
VPS_PATH="/var/www/portfolio"      # Path di VPS untuk aplikasi
SSH_KEY=""                         # Path ke SSH key (kosongkan jika pakai password)

# Konfigurasi Build
BUILD_DIR="build"
TEMP_FILE="build.tar.gz"

# ============================================
# Functions
# ============================================

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Deploy Portfolio to VPS${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_step() {
    echo -e "${GREEN}▶ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ Error: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ Warning: $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# ============================================
# Pre-checks
# ============================================

print_header

# Check if npm is installed
if ! command_exists npm; then
    print_error "npm tidak ditemukan. Install Node.js terlebih dahulu."
    exit 1
fi

# Check if tar is installed
if ! command_exists tar; then
    print_error "tar tidak ditemukan. Install tar terlebih dahulu."
    exit 1
fi

# Check if ssh is installed
if ! command_exists ssh; then
    print_error "ssh tidak ditemukan. Install openssh-client terlebih dahulu."
    exit 1
fi

# ============================================
# Build Process
# ============================================

print_step "Step 1: Building project..."

# Install dependencies jika belum
if [ ! -d "node_modules" ]; then
    print_warning "node_modules tidak ditemukan. Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        print_error "npm install gagal"
        exit 1
    fi
fi

# Build project
npm run build
if [ $? -ne 0 ]; then
    print_error "Build gagal"
    exit 1
fi

print_success "Build berhasil"

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    print_error "Folder build tidak ditemukan"
    exit 1
fi

# ============================================
# Compress Build
# ============================================

print_step "Step 2: Compressing build files..."

# Remove old compressed file if exists
if [ -f "$TEMP_FILE" ]; then
    rm "$TEMP_FILE"
fi

# Compress build directory
tar -czf "$TEMP_FILE" "$BUILD_DIR/"
if [ $? -ne 0 ]; then
    print_error "Compression gagal"
    exit 1
fi

# Get file size
FILE_SIZE=$(du -h "$TEMP_FILE" | cut -f1)
print_success "Build compressed: $FILE_SIZE"

# ============================================
# Upload to VPS
# ============================================

print_step "Step 3: Uploading to VPS..."

# Build SSH command with optional key
SSH_CMD="ssh"
SCP_CMD="scp"
if [ -n "$SSH_KEY" ]; then
    SSH_CMD="$SSH_CMD -i $SSH_KEY"
    SCP_CMD="$SCP_CMD -i $SSH_KEY"
fi
SSH_CMD="$SSH_CMD -p $VPS_PORT"
SCP_CMD="$SCP_CMD -P $VPS_PORT"

# Upload file
$SCP_CMD "$TEMP_FILE" "$VPS_USER@$VPS_HOST:/tmp/"
if [ $? -ne 0 ]; then
    print_error "Upload gagal. Cek koneksi SSH dan kredensial VPS"
    rm "$TEMP_FILE"
    exit 1
fi

print_success "Upload berhasil"

# ============================================
# Extract and Deploy on VPS
# ============================================

print_step "Step 4: Deploying on VPS..."

# Execute commands on VPS
$SSH_CMD "$VPS_USER@$VPS_HOST" << EOF
    # Create directory if not exists
    mkdir -p $VPS_PATH

    # Backup old version (optional)
    if [ -d "$VPS_PATH" ] && [ "\$(ls -A $VPS_PATH)" ]; then
        echo "Backing up old version..."
        tar -czf $VPS_PATH-backup-\$(date +%Y%m%d-%H%M%S).tar.gz $VPS_PATH/ 2>/dev/null || true
    fi

    # Extract new version
    echo "Extracting files..."
    tar -xzf /tmp/$TEMP_FILE -C $VPS_PATH --strip-components=1

    # Set permissions
    echo "Setting permissions..."
    chown -R www-data:www-data $VPS_PATH 2>/dev/null || chown -R nginx:nginx $VPS_PATH 2>/dev/null || true
    find $VPS_PATH -type f -exec chmod 644 {} \;
    find $VPS_PATH -type d -exec chmod 755 {} \;

    # Clean up
    rm /tmp/$TEMP_FILE

    # Restart nginx
    echo "Restarting nginx..."
    systemctl restart nginx 2>/dev/null || service nginx restart 2>/dev/null || /etc/init.d/nginx restart 2>/dev/null || true

    echo "Deploy completed!"
EOF

if [ $? -ne 0 ]; then
    print_error "Deploy gagal"
    rm "$TEMP_FILE"
    exit 1
fi

print_success "Deploy berhasil di VPS"

# ============================================
# Cleanup
# ============================================

print_step "Step 5: Cleaning up..."

# Remove local compressed file
rm "$TEMP_FILE"

print_success "Cleanup completed"

# ============================================
# Summary
# ============================================

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Deployment Success!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Your portfolio is now live at:"
echo -e "${YELLOW}http://$VPS_HOST${NC}"
echo ""
echo -e "Tips:"
echo -e "  • Check logs: ${YELLOW}ssh $VPS_USER@$VPS_HOST 'tail -f /var/log/nginx/error.log'${NC}"
echo -e "  • Test site: ${YELLOW}curl -I http://$VPS_HOST${NC}"
echo ""

exit 0
