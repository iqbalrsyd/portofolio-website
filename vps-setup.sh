#!/bin/bash

# ============================================
# VPS Initial Setup Script
# ============================================
# Script untuk setup awal VPS untuk hosting portfolio
# Jalankan script ini di VPS Anda
# ============================================

# Warna
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  VPS Initial Setup for Portfolio${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# ============================================
# Step 1: Update System
# ============================================

echo -e "${GREEN}[1/6] Updating system...${NC}"
apt update && apt upgrade -y
echo -e "${GREEN}✓ System updated${NC}"
echo ""

# ============================================
# Step 2: Install Nginx
# ============================================

echo -e "${GREEN}[2/6] Installing Nginx...${NC}"
apt install nginx -y
systemctl start nginx
systemctl enable nginx
echo -e "${GREEN}✓ Nginx installed and started${NC}"
echo ""

# ============================================
# Step 3: Configure Firewall
# ============================================

echo -e "${GREEN}[3/6] Configuring firewall...${NC}"
ufw --force enable
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw reload
echo -e "${GREEN}✓ Firewall configured${NC}"
echo ""

# ============================================
# Step 4: Create Web Directory
# ============================================

echo -e "${GREEN}[4/6] Creating web directory...${NC}"
mkdir -p /var/www/portfolio
chown -R www-data:www-data /var/www/portfolio
chmod -R 755 /var/www/portfolio
echo -e "${GREEN}✓ Web directory created: /var/www/portfolio${NC}"
echo ""

# ============================================
# Step 5: Install Certbot (for HTTPS)
# ============================================

echo -e "${GREEN}[5/6] Installing Certbot (for SSL/HTTPS)...${NC}"
apt install certbot python3-certbot-nginx -y
echo -e "${GREEN}✓ Certbot installed${NC}"
echo ""

# ============================================
# Step 6: Basic Security
# ============================================

echo -e "${GREEN}[6/6] Applying basic security...${NC}"

# Disable directory listing in nginx
cat > /etc/nginx/conf.d/security.conf << 'EOF'
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;

# Disable directory listing
autoindex off;

# Hide nginx version
server_tokens off;
EOF

systemctl restart nginx

echo -e "${GREEN}✓ Security configured${NC}"
echo ""

# ============================================
# Summary
# ============================================

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ VPS Setup Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Next steps:"
echo ""
echo -e "${YELLOW}1. Upload your portfolio:${NC}"
echo -e "   From local: ./deploy.sh"
echo ""
echo -e "${YELLOW}2. Configure nginx:${NC}"
echo -e "   Upload nginx config and activate it"
echo ""
echo -e "${YELLOW}3. Setup HTTPS (if using domain):${NC}"
echo -e "   sudo certbot --nginx -d your-domain.com"
echo ""
echo -e "${YELLOW}4. Test your site:${NC}"
echo -e "   curl -I http://$(hostname -I | awk '{print $1}')"
echo ""
echo -e "Server IP: ${GREEN}$(hostname -I | awk '{print $1}')${NC}"
echo ""

# Create a simple test page
cat > /var/www/portfolio/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Portfolio - Setup Success</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            text-align: center;
            padding: 40px;
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        h1 { font-size: 3em; margin: 0; }
        p { font-size: 1.2em; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 VPS Setup Success!</h1>
        <p>Your server is ready for portfolio deployment</p>
        <small>Replace this page by deploying your portfolio</small>
    </div>
</body>
</html>
EOF

echo -e "${GREEN}Test page created. Visit http://$(hostname -I | awk '{print $1}') to verify!${NC}"
echo ""
