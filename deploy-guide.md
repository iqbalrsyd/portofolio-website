# 🚀 Panduan Deploy Portfolio ke VPS dengan Docker

## 📋 Prerequisites
- VPS (DigitalOcean, AWS, Vultr, etc.)
- Domain sudah terdaftar
- SSH access ke VPS
- Docker & Docker Compose terinstall di VPS

## 🔧 Setup di VPS

### 1. Install Docker di VPS (Ubuntu/Debian)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Add user to docker group (agar tidak perlu sudo)
sudo usermod -aG docker $USER

# Restart session
newgrp docker
```

### 2. Clone Repository di VPS
```bash
# Clone repository
git clone https://github.com/iqbalrsyd/portofolio-website.git
cd portofolio-website
```

### 3. Setup Domain

#### A. Pointing Domain ke VPS
Di DNS provider (Namecheap, GoDaddy, Cloudflare, dll):
```
Type    Name    Value               TTL
A       @       [IP_VPS_ANDA]       300
A       www     [IP_VPS_ANDA]       300
```

#### B. Update nginx.conf
Edit file `nginx.conf`, ganti `yourdomain.com` dengan domain Anda:
```bash
nano nginx.conf
# Ubah: server_name yourdomain.com www.yourdomain.com;
```

### 4. Build dan Run dengan Docker

#### Opsi 1: Tanpa Nginx (Simple)
```bash
# Build image
docker build -t portfolio-website .

# Run container
docker run -d -p 80:3000 --name portfolio --restart unless-stopped portfolio-website

# Akses di: http://yourdomain.com
```

#### Opsi 2: Dengan Nginx Reverse Proxy (Recommended)
```bash
# Create SSL directory
mkdir -p ssl

# Build and run
docker-compose up -d --build

# Check logs
docker-compose logs -f
```

### 5. Setup SSL Certificate (HTTPS) dengan Let's Encrypt

#### A. Update docker-compose.yml untuk Certbot
Tambahkan service certbot di `docker-compose.yml`:
```yaml
  certbot:
    image: certbot/certbot
    container_name: portfolio-certbot
    volumes:
      - ./ssl:/etc/letsencrypt
      - ./certbot-webroot:/var/www/certbot
    command: certonly --webroot --webroot-path=/var/www/certbot --email your-email@example.com --agree-tos --no-eff-email -d yourdomain.com -d www.yourdomain.com
```

#### B. Generate SSL Certificate
```bash
# Stop nginx temporarily
docker-compose stop nginx

# Run certbot
docker-compose run --rm certbot

# Update nginx.conf (uncomment SSL lines)
# Restart nginx
docker-compose up -d nginx
```

#### C. Auto-renewal SSL
Buat cronjob:
```bash
crontab -e

# Add this line (renew every day at 2am)
0 2 * * * docker-compose run --rm certbot renew && docker-compose restart nginx
```

## 🔄 Update & Redeploy

Setiap kali ada update kode:
```bash
# Di local machine
git add .
git commit -m "Update portfolio"
git push

# Di VPS
cd portofolio-website
git pull
docker-compose down
docker-compose up -d --build
```

## 📊 Monitoring & Maintenance

### Check Status
```bash
# Check running containers
docker ps

# Check logs
docker-compose logs -f portfolio

# Check nginx logs
docker-compose logs -f nginx
```

### Useful Commands
```bash
# Stop all containers
docker-compose down

# Restart specific service
docker-compose restart portfolio

# Remove unused images
docker system prune -a

# View resource usage
docker stats
```

## 🔒 Security Tips

1. **Firewall**: Setup UFW
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

2. **SSH Security**: Disable password auth, use SSH keys
```bash
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
sudo systemctl restart sshd
```

3. **Auto-updates**: Install unattended-upgrades
```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

## 🌐 Alternative: Deploy Tanpa Docker

Jika tidak mau pakai Docker:
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Clone & build
git clone https://github.com/iqbalrsyd/portofolio-website.git
cd portofolio-website
npm install
npm run build

# Run with PM2
npm install -g pm2
pm2 start build/index.js --name portfolio
pm2 startup
pm2 save
```

## 📝 Troubleshooting

### Port sudah digunakan
```bash
sudo lsof -i :80
sudo kill -9 [PID]
```

### Docker permission denied
```bash
sudo usermod -aG docker $USER
newgrp docker
```

### SSL tidak work
```bash
# Check certificate
docker-compose exec nginx nginx -t

# Check certbot logs
docker-compose logs certbot
```

## 🎯 Production Checklist

- [ ] Domain sudah pointing ke VPS
- [ ] SSL certificate terinstall
- [ ] Firewall sudah dikonfigurasi
- [ ] Auto-restart container enabled
- [ ] Monitoring setup (optional: Grafana, Prometheus)
- [ ] Backup strategy (database jika ada)
- [ ] Environment variables configured
- [ ] .env file tidak ter-commit ke Git
