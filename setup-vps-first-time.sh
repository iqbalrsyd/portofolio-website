#!/bin/bash

# ============================================
# First Time VPS Setup Script
# ============================================
# Script untuk setup VPS pertama kali:
# - Install Nginx
# - Setup folder structure
# - Deploy website
# ============================================

# Warna untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Konfigurasi VPS (EDIT SESUAI VPS ANDA)
VPS_USER="root"
VPS_HOST="151.240.0.97"
VPS_PORT="22"
VPS_PATH="/var/www/portfolio"
DOMAIN_OR_IP="151.240.0.97"  # Ganti dengan domain jika ada: iqbalhidayatrasyad.blog

# ============================================
# Functions
# ============================================

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  $1${NC}"
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
    echo -e "${YELLOW}⚠ $1${NC}"
}

# ============================================
# Main Script
# ============================================

print_header "First Time VPS Setup"

echo ""
echo "VPS Configuration:"
echo "  Host: $VPS_HOST"
echo "  User: $VPS_USER"
echo "  Domain/IP: $DOMAIN_OR_IP"
echo ""

read -p "Apakah konfigurasi sudah benar? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Edit file ini dan sesuaikan konfigurasi VPS di bagian atas"
    exit 1
fi

# ============================================
# STEP 1: Install Nginx di VPS
# ============================================

print_step "Step 1: Installing Nginx on VPS..."

ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << 'ENDSSH'
    echo "Updating system..."
    apt update -qq
    
    echo "Installing Nginx..."
    apt install -y nginx
    
    echo "Starting Nginx..."
    systemctl enable nginx
    systemctl start nginx
    
    echo "Installing UFW (firewall)..."
    apt install -y ufw
    
    echo "Configuring firewall..."
    ufw allow 22/tcp   # SSH
    ufw allow 80/tcp   # HTTP
    ufw allow 443/tcp  # HTTPS
    echo "y" | ufw enable
    
    echo "Nginx installation completed!"
ENDSSH

if [ $? -ne 0 ]; then
    print_error "Nginx installation gagal"
    exit 1
fi

print_success "Nginx installed successfully"

# ============================================
# STEP 2: Create Folder Structure
# ============================================

print_step "Step 2: Creating folder structure on VPS..."

ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << ENDSSH
    mkdir -p $VPS_PATH
    chown -R www-data:www-data $VPS_PATH
    echo "Folder structure created!"
ENDSSH

if [ $? -ne 0 ]; then
    print_error "Folder creation gagal"
    exit 1
fi

print_success "Folder structure created"

# ============================================
# STEP 3: Upload Nginx Config
# ============================================

print_step "Step 3: Uploading Nginx configuration..."

# Generate nginx config jika belum ada
if [ ! -f "nginx-portfolio.conf" ]; then
    print_warning "nginx-portfolio.conf tidak ditemukan, generating..."
    
    cat > nginx-portfolio.conf << EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN_OR_IP;

    root $VPS_PATH;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }

    # Custom error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /index.html;

    # Logs
    access_log /var/log/nginx/portfolio_access.log;
    error_log /var/log/nginx/portfolio_error.log;
}
EOF
    print_success "Generated nginx-portfolio.conf"
fi

# Upload nginx config
scp -P $VPS_PORT nginx-portfolio.conf $VPS_USER@$VPS_HOST:/tmp/

if [ $? -ne 0 ]; then
    print_error "Upload nginx config gagal"
    exit 1
fi

# Setup nginx config on VPS
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << 'ENDSSH'
    # Copy config
    cp /tmp/nginx-portfolio.conf /etc/nginx/sites-available/portfolio
    
    # Remove default if exists
    rm -f /etc/nginx/sites-enabled/default
    
    # Create symlink
    ln -sf /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/portfolio
    
    # Test config
    nginx -t
    
    if [ $? -eq 0 ]; then
        # Restart nginx
        systemctl restart nginx
        echo "Nginx configured successfully!"
    else
        echo "Nginx config test failed!"
        exit 1
    fi
ENDSSH

if [ $? -ne 0 ]; then
    print_error "Nginx configuration gagal"
    exit 1
fi

print_success "Nginx configured successfully"

# ============================================
# STEP 4: Build Project
# ============================================

print_step "Step 4: Building project locally..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "Installing dependencies..."
    npm install
fi

# Build
npm run build

if [ $? -ne 0 ]; then
    print_error "Build gagal"
    exit 1
fi

print_success "Build completed"

# ============================================
# STEP 5: Deploy Build to VPS
# ============================================

print_step "Step 5: Deploying build to VPS..."

# Compress build
tar -czf build.tar.gz build/

# Upload
scp -P $VPS_PORT build.tar.gz $VPS_USER@$VPS_HOST:/tmp/

if [ $? -ne 0 ]; then
    print_error "Upload gagal"
    rm -f build.tar.gz
    exit 1
fi

# Extract on VPS
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << ENDSSH
    # Extract
    tar -xzf /tmp/build.tar.gz -C $VPS_PATH --strip-components=1
    
    # Set permissions
    chown -R www-data:www-data $VPS_PATH
    find $VPS_PATH -type f -exec chmod 644 {} \;
    find $VPS_PATH -type d -exec chmod 755 {} \;
    
    # Clean up
    rm /tmp/build.tar.gz
    
    # Restart nginx
    systemctl restart nginx
    
    echo "Deployment completed!"
ENDSSH

if [ $? -ne 0 ]; then
    print_error "Deploy gagal"
    rm -f build.tar.gz
    exit 1
fi

# Clean up local
rm -f build.tar.gz

print_success "Deploy completed"

# ============================================
# STEP 6: Verify Deployment
# ============================================

print_step "Step 6: Verifying deployment..."

# Test from VPS
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << 'ENDSSH'
    echo "Testing nginx..."
    curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost
    
    echo ""
    echo "Nginx status:"
    systemctl status nginx --no-pager -l
ENDSSH

# ============================================
# Summary
# ============================================

echo ""
print_header "Setup Completed Successfully!"
echo ""
echo -e "${GREEN}✓ Nginx installed and configured${NC}"
echo -e "${GREEN}✓ Website deployed${NC}"
echo -e "${GREEN}✓ Firewall configured${NC}"
echo ""
echo -e "Your portfolio is now live at:"
echo -e "${YELLOW}  → http://$DOMAIN_OR_IP${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Buka browser dan akses: http://$DOMAIN_OR_IP"
echo "  2. Untuk update website di masa depan, gunakan: ./deploy.sh"
echo "  3. Untuk setup HTTPS/SSL, lihat: TUTORIAL-VPS-PUBLIC-IP.md"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo "  • Check nginx status: ssh $VPS_USER@$VPS_HOST 'systemctl status nginx'"
echo "  • View error logs: ssh $VPS_USER@$VPS_HOST 'tail -f /var/log/nginx/portfolio_error.log'"
echo "  • View access logs: ssh $VPS_USER@$VPS_HOST 'tail -f /var/log/nginx/portfolio_access.log'"
echo ""

exit 0
