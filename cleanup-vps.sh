#!/bin/bash

# ============================================
# VPS Cleanup Script
# ============================================
# Script untuk bersihkan deployment lama
# dan persiapan untuk deployment baru
# ============================================

# Warna untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Konfigurasi VPS
VPS_USER="root"
VPS_HOST="151.240.0.97"
VPS_PORT="22"

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
    echo -e "${YELLOW}⚠ Warning: $1${NC}"
}

# ============================================
# Main Script
# ============================================

print_header "VPS Cleanup - Remove Old Deployment"

echo ""
echo -e "${YELLOW}PERINGATAN:${NC}"
echo "Script ini akan menghapus:"
echo "  - Docker containers yang berjalan"
echo "  - Docker images"
echo "  - Folder ~/portofolio-website"
echo "  - Folder /var/www/portfolio (jika ada)"
echo ""
echo "VPS Target: $VPS_HOST"
echo ""

read -p "Apakah Anda yakin ingin melanjutkan? (ketik 'yes' untuk lanjut): " -r
echo

if [[ ! $REPLY == "yes" ]]; then
    echo "Cleanup dibatalkan"
    exit 0
fi

# ============================================
# STEP 1: Stop dan Remove Docker Containers
# ============================================

print_step "Step 1: Stopping Docker containers..."

ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << 'ENDSSH'
    echo "Checking for running Docker containers..."
    
    # Stop all running containers
    if [ "$(docker ps -q)" ]; then
        echo "Stopping containers..."
        docker stop $(docker ps -q)
    else
        echo "No running containers found"
    fi
    
    # Remove all containers
    if [ "$(docker ps -aq)" ]; then
        echo "Removing containers..."
        docker rm $(docker ps -aq)
    else
        echo "No containers to remove"
    fi
    
    # Remove all images
    if [ "$(docker images -q)" ]; then
        echo "Removing images..."
        docker rmi $(docker images -q) -f 2>/dev/null || true
    else
        echo "No images to remove"
    fi
    
    # Prune system
    echo "Cleaning up Docker system..."
    docker system prune -af --volumes 2>/dev/null || true
    
    echo "Docker cleanup completed!"
ENDSSH

if [ $? -eq 0 ]; then
    print_success "Docker containers removed"
else
    print_warning "Docker cleanup selesai dengan warning (mungkin Docker tidak terinstall)"
fi

# ============================================
# STEP 2: Remove Old Folders
# ============================================

print_step "Step 2: Removing old deployment folders..."

ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << 'ENDSSH'
    echo "Removing ~/portofolio-website..."
    rm -rf ~/portofolio-website
    
    echo "Removing /var/www/portfolio..."
    rm -rf /var/www/portfolio
    
    echo "Removing /var/www/html (default nginx folder)..."
    rm -rf /var/www/html/*
    
    echo "Old folders removed!"
ENDSSH

if [ $? -ne 0 ]; then
    print_error "Folder removal gagal"
    exit 1
fi

print_success "Old folders removed"

# ============================================
# STEP 3: Clean Nginx Configs
# ============================================

print_step "Step 3: Cleaning old Nginx configs..."

ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << 'ENDSSH'
    echo "Removing old nginx configs..."
    
    # Remove old site configs
    rm -f /etc/nginx/sites-enabled/*
    rm -f /etc/nginx/sites-available/portfolio
    rm -f /etc/nginx/sites-available/default
    
    # Stop nginx if running
    systemctl stop nginx 2>/dev/null || true
    
    echo "Nginx configs cleaned!"
ENDSSH

if [ $? -ne 0 ]; then
    print_error "Nginx cleanup gagal"
    exit 1
fi

print_success "Nginx configs cleaned"

# ============================================
# STEP 4: Create Fresh Directory Structure
# ============================================

print_step "Step 4: Creating fresh directory structure..."

ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << 'ENDSSH'
    echo "Creating /var/www/portfolio..."
    mkdir -p /var/www/portfolio
    
    echo "Setting permissions..."
    chown -R www-data:www-data /var/www/portfolio
    chmod -R 755 /var/www/portfolio
    
    echo "Fresh directory structure created!"
ENDSSH

if [ $? -ne 0 ]; then
    print_error "Directory creation gagal"
    exit 1
fi

print_success "Fresh directory structure created"

# ============================================
# STEP 5: Verify Cleanup
# ============================================

print_step "Step 5: Verifying cleanup..."

echo ""
echo "VPS Status:"
echo "==========================================="

ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << 'ENDSSH'
    echo ""
    echo "Docker containers:"
    docker ps -a 2>/dev/null || echo "  (Docker not running or not installed)"
    
    echo ""
    echo "Folders:"
    echo "  ~/portofolio-website: $([ -d ~/portofolio-website ] && echo 'EXISTS' || echo 'REMOVED ✓')"
    echo "  /var/www/portfolio: $([ -d /var/www/portfolio ] && echo 'EXISTS ✓' || echo 'NOT FOUND')"
    
    echo ""
    echo "Nginx status:"
    systemctl status nginx --no-pager -l | head -3
    
    echo ""
    echo "Disk usage:"
    df -h / | tail -1
ENDSSH

echo "==========================================="

# ============================================
# Summary
# ============================================

echo ""
print_header "Cleanup Completed Successfully!"
echo ""
echo -e "${GREEN}✓ Docker containers removed${NC}"
echo -e "${GREEN}✓ Old deployment folders removed${NC}"
echo -e "${GREEN}✓ Nginx configs cleaned${NC}"
echo -e "${GREEN}✓ Fresh directory structure created${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Jalankan setup deployment baru:"
echo -e "     ${YELLOW}./setup-vps-first-time.sh${NC}"
echo ""
echo "  2. Atau jika Nginx sudah terinstall, langsung deploy:"
echo -e "     ${YELLOW}./deploy.sh${NC}"
echo ""

exit 0
