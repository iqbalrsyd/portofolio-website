# 🚀 Tutorial Deploy Portfolio ke VPS dengan IP Public

## 📋 Yang Anda Butuhkan

- ✅ VPS dengan IP Public (DigitalOcean, AWS EC2, Vultr, dll)
- ✅ Domain (opsional, bisa pakai IP langsung)
- ✅ Akses SSH ke VPS
- ✅ Port 80 dan 443 terbuka di firewall VPS

## 🎯 Langkah 1: Persiapan VPS

### 1.1. Login ke VPS

```bash
ssh root@YOUR_VPS_IP
# Contoh: ssh root@203.0.113.45
```

### 1.2. Update System

```bash
apt update && apt upgrade -y
```

### 1.3. Install Docker & Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Verifikasi instalasi
docker --version
docker-compose --version
```

### 1.4. Setup Firewall (UFW)

```bash
# Install UFW jika belum ada
apt install ufw -y

# Allow SSH (PENTING! Jangan sampai ter-lock dari VPS)
ufw allow 22/tcp
# Atau jika SSH port custom: ufw allow YOUR_SSH_PORT/tcp

# Allow HTTP dan HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw enable

# Check status
ufw status
```

## 🎯 Langkah 2: Clone dan Setup Project

### 2.1. Clone Repository

```bash
# Pindah ke direktori home
cd ~

# Clone project (ganti dengan URL repo Anda)
git clone https://github.com/YOUR_USERNAME/portofolio-website-iqbal.git
cd portofolio-website-iqbal

# Atau jika sudah punya project di local, upload dengan rsync:
# rsync -avz -e ssh /path/to/local/project root@YOUR_VPS_IP:~/portofolio-website-iqbal
```

### 2.2. Setup Environment Variables (jika diperlukan)

```bash
# Jika ada file .env, buat dan edit
nano .env

# Isi dengan konfigurasi yang diperlukan
# PORT=3000
# NODE_ENV=production
```

## 🎯 Langkah 3: Deploy dengan Docker

### 3.1. Build dan Run Container

```bash
# Build dan jalankan semua services
docker-compose up -d --build

# Lihat status container
docker-compose ps

# Lihat logs
docker-compose logs -f

# Untuk stop logs, tekan Ctrl+C
```

### 3.2. Verifikasi Deployment

```bash
# Test dari dalam VPS
curl http://localhost:80

# Jika sukses, akan muncul HTML content
```

### 3.3. Test dari Browser

Buka browser dan akses:

```
http://YOUR_VPS_IP
```

Contoh: `http://203.0.113.45`

## 🎯 Langkah 4: Setup Domain (Opsional)

### 4.1. Pointing Domain ke VPS

Masuk ke DNS provider Anda (Cloudflare, Namecheap, GoDaddy, dll) dan tambahkan A Record:

| Type | Name | Value       | TTL           |
| ---- | ---- | ----------- | ------------- |
| A    | @    | YOUR_VPS_IP | 300 atau Auto |
| A    | www  | YOUR_VPS_IP | 300 atau Auto |

**Contoh:**

- Name: `@` → Value: `203.0.113.45`
- Name: `www` → Value: `203.0.113.45`

### 4.2. Update Nginx Config

```bash
# Edit nginx.conf
nano nginx.conf
```

Cari baris ini:

```nginx
server_name yourdomain.com www.yourdomain.com;
```

Ganti dengan domain Anda:

```nginx
server_name iqbalhidayatrasyad.blog www.iqbalhidayatrasyad.blog;
```

### 4.3. Restart Nginx

```bash
docker-compose restart nginx
```

### 4.4. Test Domain

Tunggu 5-10 menit untuk DNS propagasi, lalu akses:

```
http://yourdomain.com
http://www.yourdomain.com
```

## 🔒 Langkah 5: Setup SSL/HTTPS (Gratis dengan Let's Encrypt)

### 5.1. Pastikan Domain Sudah Pointing ke VPS

```bash
# Verifikasi DNS
nslookup yourdomain.com
# Atau
dig yourdomain.com
```

### 5.2. Install Certbot

```bash
apt install certbot python3-certbot-nginx -y
```

### 5.3. Generate SSL Certificate

#### Cara 1: Otomatis dengan Nginx Plugin (Paling Mudah)

```bash
# Stop nginx container dulu
docker-compose stop nginx

# Install certbot dengan standalone mode
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com --email your-email@example.com --agree-tos --non-interactive

# Certificates akan disimpan di:
# /etc/letsencrypt/live/yourdomain.com/
```

#### Cara 2: Manual dengan Webroot

```bash
# Buat direktori untuk certbot
mkdir -p certbot-webroot

# Run certbot
certbot certonly --webroot \
  -w ./certbot-webroot \
  -d yourdomain.com \
  -d www.yourdomain.com \
  --email your-email@example.com \
  --agree-tos \
  --non-interactive
```

### 5.4. Copy SSL Certificates

```bash
# Buat direktori ssl jika belum ada
mkdir -p ssl

# Copy certificates ke project folder
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/
```

### 5.5. Update Nginx Config untuk SSL

```bash
nano nginx.conf
```

Tambahkan konfigurasi SSL (biasanya sudah ada template, uncomment saja):

```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name iqbalhidayatrasyad.blog www.iqbalhidayatrasyad.blog;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';

    location / {
        proxy_pass http://portfolio:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name iqbalhidayatrasyad.blog www.iqbalhidayatrasyad.blog;
    return 301 https://$server_name$request_uri;
}
```

### 5.6. Restart Container

```bash
# Restart untuk apply perubahan
docker-compose restart nginx

# Atau rebuild semuanya
docker-compose down
docker-compose up -d --build
```

### 5.7. Test HTTPS

Buka browser dan akses:

```
https://yourdomain.com
```

### 5.8. Setup Auto-Renewal SSL

```bash
# Test renewal
certbot renew --dry-run

# Setup cron job untuk auto-renewal
crontab -e

# Tambahkan line ini (check renewal setiap hari jam 2 pagi):
0 2 * * * certbot renew --quiet --post-hook "cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /root/portofolio-website-iqbal/ssl/ && cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /root/portofolio-website-iqbal/ssl/ && cd /root/portofolio-website-iqbal && docker-compose restart nginx"
```

## 🛠️ Perintah-Perintah Berguna

### Melihat Status Container

```bash
docker-compose ps
```

### Melihat Logs

```bash
# Semua logs
docker-compose logs -f

# Logs specific service
docker-compose logs -f nginx
docker-compose logs -f portfolio
```

### Restart Services

```bash
# Restart semua
docker-compose restart

# Restart specific service
docker-compose restart nginx
docker-compose restart portfolio
```

### Stop dan Start

```bash
# Stop semua
docker-compose stop

# Start semua
docker-compose start

# Stop dan remove containers
docker-compose down

# Rebuild dari scratch
docker-compose down
docker-compose up -d --build
```

### Update Project

```bash
# Pull changes dari git
git pull origin main

# Rebuild dan restart
docker-compose down
docker-compose up -d --build
```

### Monitor Resource Usage

```bash
# Lihat resource usage
docker stats

# Lihat disk usage
docker system df

# Clean unused images/containers
docker system prune -a
```

## 🚨 Troubleshooting

### Port Sudah Dipakai

```bash
# Check port 80 dan 443
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Jika ada service lain (misal Apache), stop dulu
sudo systemctl stop apache2
sudo systemctl disable apache2
```

### Container Tidak Bisa Start

```bash
# Check logs
docker-compose logs

# Check status
docker-compose ps

# Rebuild dari scratch
docker-compose down
docker volume prune
docker-compose up -d --build
```

### Website Tidak Bisa Diakses

```bash
# 1. Check container status
docker-compose ps

# 2. Check firewall
ufw status

# 3. Check nginx config
docker exec portfolio-nginx nginx -t

# 4. Check dari dalam VPS
curl http://localhost:80

# 5. Check port binding
netstat -tulpn | grep :80
```

### DNS Tidak Resolve

```bash
# Test DNS
nslookup yourdomain.com
dig yourdomain.com

# Flush DNS di local (jika dari komputer lokal)
# Windows: ipconfig /flushdns
# Mac/Linux: sudo systemd-resolve --flush-caches
```

### SSL Certificate Error

```bash
# Check certificate files
ls -la ssl/

# Re-generate certificates
certbot renew --force-renewal

# Copy ulang certificates
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/

# Restart nginx
docker-compose restart nginx
```

## 📊 Monitoring dan Maintenance

### Setup Log Rotation

```bash
# Buat file config log rotation
nano /etc/logrotate.d/docker-compose

# Isi dengan:
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=10M
    missingok
    delaycompress
    copytruncate
}
```

### Backup Regular

```bash
# Backup script
nano backup.sh

# Isi dengan:
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/portfolio_$DATE.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    /root/portofolio-website-iqbal

# Keep only last 7 backups
cd $BACKUP_DIR
ls -t | tail -n +8 | xargs rm -f

# Make executable
chmod +x backup.sh

# Add to crontab (backup setiap minggu)
crontab -e
# Add: 0 3 * * 0 /root/backup.sh
```

## 🎉 Selesai!

Website Anda sekarang sudah online di VPS dengan IP public!

### Checklist

- [ ] Website bisa diakses via HTTP (http://YOUR_VPS_IP)
- [ ] Domain sudah pointing (opsional)
- [ ] SSL/HTTPS aktif (opsional tapi recommended)
- [ ] Auto-renewal SSL sudah diset
- [ ] Monitoring dan backup sudah diset

### URL Akses

- HTTP: `http://151.240.0.97` atau `http://iqbalhidayatrasyad.blog`
- HTTPS: `https://iqbalhidayatrasyad.blog` (jika sudah setup SSL)

### Performa Tips

- Enable Cloudflare untuk CDN gratis dan DDoS protection
- Setup Gzip compression di Nginx (sudah default di config)
- Enable browser caching
- Optimize images
- Monitor dengan tools seperti Uptime Robot atau StatusCake

---

**Butuh bantuan?** Check logs dengan `docker-compose logs -f`
