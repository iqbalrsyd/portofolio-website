#!/bin/bash

# ============================================
# Nginx Config Generator - Portfolio Website
# ============================================
# Script untuk generate konfigurasi nginx
# ============================================

# Warna untuk output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Nginx Configuration Generator${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Input dari user
read -p "Enter domain name (or IP address): " DOMAIN
read -p "Enter web root path [/var/www/portfolio]: " WEB_ROOT
WEB_ROOT=${WEB_ROOT:-/var/www/portfolio}

# Generate config
CONFIG_FILE="nginx-portfolio.conf"

cat > "$CONFIG_FILE" << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name DOMAIN_PLACEHOLDER;

    root WEB_ROOT_PLACEHOLDER;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 256;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/rss+xml
        application/atom+xml
        image/svg+xml
        text/x-component
        text/x-cross-domain-policy;

    # Serve precompressed files
    gzip_static on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Main location
    location / {
        try_files $uri $uri.html $uri/ /index.html =404;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Handle 404
    error_page 404 /404.html;
    location = /404.html {
        internal;
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Logs
    access_log /var/log/nginx/portfolio-access.log;
    error_log /var/log/nginx/portfolio-error.log;
}
EOF

# Replace placeholders
sed -i "s|DOMAIN_PLACEHOLDER|$DOMAIN|g" "$CONFIG_FILE"
sed -i "s|WEB_ROOT_PLACEHOLDER|$WEB_ROOT|g" "$CONFIG_FILE"

echo -e "${GREEN}✓ Configuration file generated: $CONFIG_FILE${NC}"
echo ""
echo -e "To use this configuration:"
echo -e "${YELLOW}1. Copy to nginx sites-available:${NC}"
echo -e "   sudo cp $CONFIG_FILE /etc/nginx/sites-available/portfolio"
echo ""
echo -e "${YELLOW}2. Create symbolic link:${NC}"
echo -e "   sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/"
echo ""
echo -e "${YELLOW}3. Test configuration:${NC}"
echo -e "   sudo nginx -t"
echo ""
echo -e "${YELLOW}4. Restart nginx:${NC}"
echo -e "   sudo systemctl restart nginx"
echo ""
echo -e "${YELLOW}5. For HTTPS (optional):${NC}"
echo -e "   sudo certbot --nginx -d $DOMAIN"
echo ""
