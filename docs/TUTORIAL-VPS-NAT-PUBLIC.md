# 🚀 Tutorial: Deploy Portfolio di VPS NAT + VPS Public IP Gateway

## 📊 Arsitektur Setup

```
Internet → VPS Public IP (Gateway) → VPS NAT (Aplikasi)
          (Nginx Reverse Proxy)      (Docker Portfolio)
```

### Keuntungan Setup Ini:
- ✅ Hemat biaya (VPS NAT lebih murah)
- ✅ Skalabilitas (bisa tambah VPS NAT lainnya)
- ✅ Keamanan (aplikasi tidak langsung terexpose)
- ✅ Load balancing (jika punya multiple VPS NAT)

## 🎯 Yang Anda Butuhkan

### VPS NAT (Backend - Aplikasi)
- IP Internal: `10.20.30.20` (contoh)
- Port: `3000` (aplikasi)
- Akses: SSH via jump host atau panel

### VPS Public IP (Gateway - Reverse Proxy)
- IP Public: `203.0.113.45` (contoh)
- Port: `80` (HTTP), `443` (HTTPS)
- Akses: SSH direct

### Koneksi Antar VPS
- VPN (Wireguard/Tailscale) **RECOMMENDED**
- Atau Private Network dari provider
- Atau SSH Tunnel

---

## 🔧 SETUP 1: VPS NAT (Backend - Aplikasi)

### 1.1. Login ke VPS NAT
```bash
# Via SSH (sesuaikan dengan akses Anda)
ssh -p YOUR_NAT_SSH_PORT root@YOUR_NAT_IP
```

### 1.2. Install Docker
```bash
apt update && apt upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
apt install docker-compose -y
```

### 1.3. Clone Project
```bash
cd ~
git clone https://github.com/iqbalrsyd/portofolio-website.git
cd portofolio-website
```

### 1.4. Modifikasi docker-compose.yml untuk NAT

Edit `docker-compose.yml`:
```bash
nano docker-compose.yml
```

**Ubah menjadi (hanya run aplikasi, tanpa nginx):**
```yaml
version: '3.8'

services:
  portfolio:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: portfolio-website
    restart: unless-stopped
    ports:
      - "3000:3000"  # Bind ke semua interface
    environment:
      - NODE_ENV=production
      - PORT=3000
    networks:
      - portfolio-network

networks:
  portfolio-network:
    driver: bridge
```

### 1.5. Build dan Run
```bash
docker-compose up -d --build

# Check status
docker-compose ps
docker-compose logs -f
```

### 1.6. Test Lokal
```bash
curl http://localhost:3000
# Harus return HTML content
```

### 1.7. Catat IP Internal VPS NAT
```bash
# Cek IP internal
ip addr show

# Atau
hostname -I

# Catat IP yang dimulai dengan 10.x.x.x atau 172.x.x.x atau 192.168.x.x
# Contoh: 10.20.30.20
```

---

## 🔧 SETUP 2: Koneksi Antar VPS

### Opsi A: Wireguard VPN (RECOMMENDED) ⭐

#### Di VPS Public IP (Server):
```bash
# Install Wireguard
apt update
apt install wireguard -y

# Generate keys
wg genkey | tee /etc/wireguard/server_private.key | wg pubkey > /etc/wireguard/server_public.key

# Setup wg0.conf
nano /etc/wireguard/wg0.conf
```

**Isi wg0.conf (VPS Public):**
```ini
[Interface]
PrivateKey = <server_private_key>
Address = 10.0.0.1/24
ListenPort = 51820

[Peer]
PublicKey = <nat_client_public_key>
AllowedIPs = 10.0.0.2/32
```

```bash
# Start Wireguard
systemctl enable wg-quick@wg0
systemctl start wg-quick@wg0

# Check status
wg show
```

#### Di VPS NAT (Client):
```bash
# Install Wireguard
apt update
apt install wireguard -y

# Generate keys
wg genkey | tee /etc/wireguard/client_private.key | wg pubkey > /etc/wireguard/client_public.key

# Setup wg0.conf
nano /etc/wireguard/wg0.conf
```

**Isi wg0.conf (VPS NAT):**
```ini
[Interface]
PrivateKey = <client_private_key>
Address = 10.0.0.2/24

[Peer]
PublicKey = <server_public_key>
Endpoint = <VPS_PUBLIC_IP>:51820
AllowedIPs = 10.0.0.0/24
PersistentKeepalive = 25
```

```bash
# Start Wireguard
systemctl enable wg-quick@wg0
systemctl start wg-quick@wg0

# Test koneksi
ping 10.0.0.1
```

**Setup Firewall di VPS Public:**
```bash
ufw allow 51820/udp
```

### Opsi B: SSH Tunnel (Simple tapi kurang reliable)

**Di VPS Public IP:**
```bash
# Buat tunnel dari VPS NAT ke VPS Public
ssh -N -L 0.0.0.0:8080:localhost:3000 root@VPS_NAT_IP -p NAT_SSH_PORT &

# Atau pakai autossh (auto-reconnect)
apt install autossh -y
autossh -M 0 -N -L 0.0.0.0:8080:localhost:3000 root@VPS_NAT_IP -p NAT_SSH_PORT &
```

### Opsi C: Private Network dari Provider

Jika provider VPS Anda support private network (DigitalOcean, Vultr, dll):
- Enable private networking di panel
- Gunakan IP private untuk komunikasi antar VPS

---

## 🔧 SETUP 3: VPS Public IP (Gateway - Nginx Reverse Proxy)

### 3.1. Login ke VPS Public IP
```bash
ssh root@YOUR_PUBLIC_IP
```

### 3.2. Install Nginx
```bash
apt update
apt install nginx -y
```

### 3.3. Setup Nginx sebagai Reverse Proxy

**Jika pakai Wireguard (IP VPS NAT di VPN: 10.0.0.2):**
```bash
nano /etc/nginx/sites-available/portfolio
```

**Isi config:**
```nginx
# HTTP Server
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;  # Ganti dengan domain Anda
    # Atau pakai IP: server_name YOUR_PUBLIC_IP;

    # Logging
    access_log /var/log/nginx/portfolio-access.log;
    error_log /var/log/nginx/portfolio-error.log;

    # Reverse Proxy ke VPS NAT via Wireguard
    location / {
        proxy_pass http://10.0.0.2:3000;  # IP Wireguard VPS NAT
        
        # Headers
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }
}
```

**Jika pakai SSH Tunnel (forward ke localhost:8080):**
```nginx
    location / {
        proxy_pass http://localhost:8080;  # SSH tunnel port
        # ... headers sama seperti di atas
    }
```

**Jika pakai Private Network (IP private VPS NAT):**
```nginx
    location / {
        proxy_pass http://10.20.30.20:3000;  # IP private VPS NAT
        # ... headers sama seperti di atas
    }
```

### 3.4. Enable Site dan Test Config
```bash
# Link ke sites-enabled
ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/

# Remove default site
rm /etc/nginx/sites-enabled/default

# Test config
nginx -t

# Reload nginx
systemctl reload nginx
systemctl status nginx
```

### 3.5. Setup Firewall
```bash
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw allow 51820/udp  # Wireguard (jika pakai)
ufw enable
ufw status
```

### 3.6. Test dari VPS Public
```bash
curl http://localhost
# Harus return HTML dari aplikasi di VPS NAT
```

---

## 🎯 SETUP 4: Domain dan DNS

### 4.1. Pointing Domain
Di DNS provider (Cloudflare, Namecheap, dll):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | YOUR_PUBLIC_VPS_IP | Auto/300 |
| A | www | YOUR_PUBLIC_VPS_IP | Auto/300 |

### 4.2. Test DNS
```bash
nslookup yourdomain.com
# Harus resolve ke IP Public VPS Anda
```

### 4.3. Update Nginx Server Name
```bash
nano /etc/nginx/sites-available/portfolio

# Ubah server_name dari IP ke domain
server_name yourdomain.com www.yourdomain.com;

# Reload
nginx -t
systemctl reload nginx
```

---

## 🔒 SETUP 5: SSL/HTTPS dengan Let's Encrypt

### 5.1. Install Certbot (di VPS Public IP)
```bash
apt install certbot python3-certbot-nginx -y
```

### 5.2. Generate Certificate
```bash
# Automatic (akan auto-configure nginx)
certbot --nginx -d yourdomain.com -d www.yourdomain.com --email your-email@example.com --agree-tos --non-interactive

# Atau manual
certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com
```

### 5.3. Update Nginx Config untuk HTTPS
Certbot akan otomatis update config. Hasil akhir akan seperti ini:

```bash
nano /etc/nginx/sites-available/portfolio
```

```nginx
# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Reverse Proxy
    location / {
        proxy_pass http://10.0.0.2:3000;  # Wireguard IP VPS NAT
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
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### 5.4. Reload Nginx
```bash
nginx -t
systemctl reload nginx
```

### 5.5. Setup Auto-Renewal
```bash
# Test renewal
certbot renew --dry-run

# Auto-renewal sudah dihandle oleh systemd timer
systemctl status certbot.timer
```

---

## 🛠️ Testing dan Verifikasi

### Test 1: Dari VPS NAT
```bash
# Di VPS NAT
curl http://localhost:3000
# Expected: HTML content
```

### Test 2: Koneksi VPN/Tunnel
```bash
# Di VPS Public
ping 10.0.0.2  # IP Wireguard VPS NAT
# Expected: Reply from 10.0.0.2
```

### Test 3: Nginx Reverse Proxy
```bash
# Di VPS Public
curl http://localhost
# Expected: HTML content dari VPS NAT
```

### Test 4: Public Access
```bash
# Dari komputer lokal/mana saja
curl http://YOUR_PUBLIC_IP
curl http://yourdomain.com
curl https://yourdomain.com
```

### Test 5: Browser
Buka browser:
- `http://YOUR_PUBLIC_IP` ✅
- `http://yourdomain.com` ✅
- `https://yourdomain.com` ✅

---

## 📊 Monitoring dan Maintenance

### Monitoring Logs

**Di VPS NAT (Aplikasi):**
```bash
cd ~/portofolio-website
docker-compose logs -f
```

**Di VPS Public (Nginx):**
```bash
# Nginx access logs
tail -f /var/log/nginx/portfolio-access.log

# Nginx error logs
tail -f /var/log/nginx/portfolio-error.log

# System logs
journalctl -u nginx -f
```

### Monitoring Koneksi

**Wireguard:**
```bash
# Di VPS Public dan NAT
wg show

# Check peers
watch -n 1 wg show
```

**SSH Tunnel:**
```bash
# Check process
ps aux | grep ssh

# Restart jika mati
autossh -M 0 -N -L 0.0.0.0:8080:localhost:3000 root@VPS_NAT_IP &
```

### Resource Monitoring

**Di VPS NAT:**
```bash
docker stats
htop
df -h
```

**Di VPS Public:**
```bash
htop
netstat -tulpn
```

---

## 🚨 Troubleshooting

### Problem: Tidak bisa akses dari browser

**Check 1: Aplikasi di VPS NAT**
```bash
# Di VPS NAT
docker-compose ps
curl http://localhost:3000
```

**Check 2: Koneksi VPN/Tunnel**
```bash
# Di VPS Public
ping 10.0.0.2

# Check wireguard
wg show
systemctl status wg-quick@wg0
```

**Check 3: Nginx di VPS Public**
```bash
# Test nginx config
nginx -t

# Check nginx status
systemctl status nginx

# Test reverse proxy
curl http://localhost
```

**Check 4: Firewall**
```bash
# Di VPS Public
ufw status

# Di VPS NAT (jika ada)
ufw status
```

### Problem: 502 Bad Gateway

**Penyebab:**
- VPS NAT aplikasi tidak running
- Koneksi VPN/tunnel putus
- Firewall blocking

**Solusi:**
```bash
# Check aplikasi di VPS NAT
docker-compose ps

# Restart aplikasi
docker-compose restart

# Check koneksi
ping 10.0.0.2

# Restart wireguard
systemctl restart wg-quick@wg0

# Check nginx logs
tail -f /var/log/nginx/portfolio-error.log
```

### Problem: 504 Gateway Timeout

**Solusi - Increase timeout di Nginx:**
```nginx
location / {
    proxy_pass http://10.0.0.2:3000;
    
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;
}
```

```bash
nginx -t
systemctl reload nginx
```

---

## 🎯 Best Practices

### 1. Security
- ✅ Gunakan Wireguard untuk komunikasi antar VPS
- ✅ Setup firewall di kedua VPS
- ✅ Gunakan SSH key authentication
- ✅ Disable password SSH
- ✅ Enable fail2ban
- ✅ Regular security updates

### 2. Performance
- ✅ Enable Nginx caching
- ✅ Enable gzip compression
- ✅ Use HTTP/2
- ✅ Optimize Docker images
- ✅ Monitor resource usage

### 3. Reliability
- ✅ Setup auto-restart untuk Docker
- ✅ Setup autossh untuk tunnel (jika pakai SSH)
- ✅ Monitor uptime dengan UptimeRobot
- ✅ Setup backup regular
- ✅ Document semua konfigurasi

### 4. Scaling
- ✅ Gunakan load balancer jika punya multiple VPS NAT
- ✅ Setup monitoring dengan Prometheus + Grafana
- ✅ Use CDN (Cloudflare) untuk static assets

---

## 📝 Diagram Lengkap

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTPS (443)
       │ HTTP (80)
       ▼
┌─────────────────────────┐
│   VPS Public IP         │
│   (Gateway)             │
│                         │
│   - Nginx Reverse Proxy │
│   - SSL Certificate     │
│   - Firewall           │
│   - Wireguard Server   │
│   IP: 203.0.113.45     │
└──────────┬──────────────┘
           │ Wireguard VPN (10.0.0.0/24)
           │ atau Private Network
           ▼
┌─────────────────────────┐
│   VPS NAT               │
│   (Backend)             │
│                         │
│   - Docker Portfolio    │
│   - Wireguard Client   │
│   - Internal IP        │
│   VPN IP: 10.0.0.2     │
│   Port: 3000           │
└─────────────────────────┘
```

---

## 🎉 Selesai!

Setup Anda sekarang:
- ✅ Aplikasi running di VPS NAT (aman, hemat)
- ✅ Gateway di VPS Public IP (akses dari internet)
- ✅ Koneksi aman via VPN/tunnel
- ✅ SSL/HTTPS aktif
- ✅ Scalable dan maintainable

### URL Akses Final:
- 🌐 **HTTP**: `http://yourdomain.com` → redirect ke HTTPS
- 🔒 **HTTPS**: `https://yourdomain.com` ✅
- 📱 **IP Direct**: `http://YOUR_PUBLIC_IP`

### Keuntungan Setup Ini:
- 💰 Hemat biaya (NAT VPS lebih murah)
- 🔒 Lebih aman (aplikasi tidak direct expose)
- 📈 Scalable (bisa tambah VPS NAT)
- 🚀 Flexible (bisa setup load balancing)

---

**Need Help?** Check logs:
- VPS NAT: `docker-compose logs -f`
- VPS Public: `tail -f /var/log/nginx/portfolio-error.log`
- Wireguard: `wg show`
