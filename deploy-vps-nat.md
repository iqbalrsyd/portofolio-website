# 🚀 Deploy ke VPS NAT - Panduan Khusus

## 📋 Info VPS NAT Anda
- **IP VPS**: 51.68.52.220
- **SSH Port**: 40570
- **Internal IP**: 10.20.30.20

## 🔧 Port Forwarding yang Diperlukan

Setup di panel VPS NAT Anda:

| Service | Internal Port | Public Port | Protocol | Status |
|---------|---------------|-------------|----------|--------|
| SSH | 22 | 40570 | TCP | ✅ Ada |
| HTTP | 80 | 32021 | TCP | ✅ Ada |
| HTTPS | 443 | **32022** | TCP | ⚠️ **TAMBAHKAN INI** |
| App (optional) | 3000 | 32023 | TCP | 🔧 Optional |

**PENTING:** Tambahkan port forwarding untuk HTTPS (443 → 32022) di panel VPS!

## 🚀 Step-by-Step Deployment

### 1. Connect ke VPS
```bash
ssh -p 40570 root@51.68.52.220
```

### 2. Update System & Install Docker
```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Verify installation
docker --version
docker-compose --version
```

### 3. Clone Repository
```bash
# Clone repo
git clone https://github.com/iqbalrsyd/portofolio-website.git
cd portofolio-website
```

### 4. Setup Domain DNS

Di DNS provider (Cloudflare, Namecheap, etc), tambahkan A Record:

```
Type    Name    Value           TTL
A       @       51.68.52.220    Auto/300
A       www     51.68.52.220    Auto/300
```

### 5. Edit Nginx Config untuk NAT

Edit `nginx.conf` dan ganti `yourdomain.com` dengan domain Anda:
```bash
nano nginx.conf
```

Cari dan ganti:
```nginx
server_name yourdomain.com www.yourdomain.com;
```

Dengan domain Anda, misalnya:
```nginx
server_name iqbalrasyad.com www.iqbalrasyad.com;
```

### 6. Deploy Aplikasi

#### Opsi A: Tanpa SSL (HTTP only - untuk testing)
```bash
# Build dan run
docker-compose up -d --build

# Check logs
docker-compose logs -f

# Test akses
curl http://localhost:80
```

**Akses di browser:**
- HTTP: `http://yourdomain.com:32021`
- Direct app: `http://51.68.52.220:32023` (jika port 3000 di-forward)

#### Opsi B: Dengan SSL (Production - RECOMMENDED)

**Step 1:** Setup Cloudflare (RECOMMENDED untuk NAT VPS)

Karena VPS NAT dengan port non-standard, **pakai Cloudflare lebih mudah**:

1. **Point domain ke Cloudflare nameservers**
2. **Setup Cloudflare Tunnel atau pakai Flexible SSL**

Dengan Cloudflare:
- Users akses: `https://yourdomain.com` (port 443 standard)
- Cloudflare forward ke: `http://51.68.52.220:32021`
- No need certbot, SSL otomatis dari Cloudflare

**Setup Cloudflare:**
```bash
# Di Cloudflare Dashboard:
# 1. SSL/TLS > Overview > Set to "Flexible"
# 2. DNS > Add A record: 51.68.52.220
# 3. Enable "Proxied" (orange cloud)
# 4. SSL/TLS > Edge Certificates > Always Use HTTPS: ON
```

**Step 2:** Deploy dengan Docker
```bash
# Untuk Cloudflare, pakai HTTP only di backend
docker-compose up -d --build

# Check status
docker ps

# Check logs
docker-compose logs -f nginx
```

### 7. Verifikasi Deployment

```bash
# Check containers running
docker ps

# Check application logs
docker-compose logs portfolio

# Check nginx logs
docker-compose logs nginx

# Test dari dalam VPS
curl http://localhost:80

# Check resource usage
docker stats
```

### 8. Setup Firewall

```bash
# Install UFW
apt install ufw -y

# Allow SSH (IMPORTANT!)
ufw allow 40570/tcp

# Allow HTTP & HTTPS internal
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp

# Enable firewall
ufw enable

# Check status
ufw status
```

## 🔄 Update & Maintenance

### Update kode
```bash
cd portofolio-website
git pull
docker-compose down
docker-compose up -d --build
```

### View logs
```bash
docker-compose logs -f
docker-compose logs -f portfolio
docker-compose logs -f nginx
```

### Restart services
```bash
docker-compose restart
docker-compose restart portfolio
docker-compose restart nginx
```

### Clean up
```bash
docker system prune -a
```

## 🌐 Cara Akses Website

### Dengan Domain + Cloudflare (RECOMMENDED)
```
https://yourdomain.com          → Clean URL, SSL otomatis
```

### Tanpa Cloudflare (Port non-standard)
```
http://yourdomain.com:32021     → HTTP
https://yourdomain.com:32022    → HTTPS (perlu setup SSL manual)
```

### Direct IP
```
http://51.68.52.220:32021       → HTTP
http://51.68.52.220:32023       → Direct app (bypass nginx)
```

## ⚡ Rekomendasi untuk VPS NAT

**SANGAT DISARANKAN pakai Cloudflare karena:**
- ✅ Hide port non-standard (32021 → 443 standard)
- ✅ SSL gratis tanpa ribet setup Let's Encrypt
- ✅ CDN gratis untuk load cepat
- ✅ DDoS protection
- ✅ URL bersih tanpa port (https://domain.com)

**Cloudflare Free Plan sudah cukup!**

## 🐛 Troubleshooting

### Port sudah digunakan
```bash
netstat -tulpn | grep :80
kill -9 [PID]
```

### Docker tidak jalan
```bash
systemctl status docker
systemctl restart docker
```

### Check NAT forwarding
```bash
# Test dari luar VPS
curl http://51.68.52.220:32021

# Test dari dalam VPS
curl http://localhost:80
```

### Container error
```bash
docker-compose down
docker system prune -a
docker-compose up -d --build
```

## 📝 Catatan Penting

1. **Port non-standard**: Karena NAT, user harus akses dengan port (contoh: `:32021`)
   - **Solusi**: Pakai Cloudflare untuk hide port
   
2. **SSL Certificate**: Let's Encrypt susah di setup untuk NAT VPS
   - **Solusi**: Pakai Cloudflare Flexible SSL (gratis)

3. **Monitoring**: Setup uptime monitoring (UptimeRobot, Better Uptime)

4. **Backup**: 
```bash
# Backup docker volumes
docker-compose down
tar -czf backup.tar.gz .
```

## ✅ Quick Deploy Checklist

- [ ] Port forwarding 443→32022 sudah ditambah di panel VPS
- [ ] Docker & Docker Compose terinstall
- [ ] Repository sudah di-clone
- [ ] Domain sudah pointing ke IP VPS (51.68.52.220)
- [ ] Cloudflare sudah di-setup (recommended)
- [ ] nginx.conf sudah di-edit dengan domain yang benar
- [ ] Docker containers running (`docker ps`)
- [ ] Firewall configured
- [ ] Website accessible dari browser

## 🆘 Need Help?

Cek logs untuk debug:
```bash
# All logs
docker-compose logs -f

# Specific service
docker-compose logs -f portfolio
docker-compose logs -f nginx

# System logs
journalctl -xe
```
