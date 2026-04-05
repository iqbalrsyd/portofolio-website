# 🚀 Deploy ke VPS - Cara Paling Mudah

## ⚠️ PENTING: Jika VPS Sudah Ada Deployment Lama

**Jika VPS Anda masih punya deployment lama (Docker, folder portofolio-website, dll), jalankan cleanup dulu:**

```bash
./cleanup-vps.sh
```

Script akan otomatis:

- ✅ Stop dan hapus Docker containers
- ✅ Hapus folder lama (`~/portofolio-website`, `/var/www/portfolio`)
- ✅ Bersihkan nginx config lama
- ✅ Siapkan struktur folder baru

**Setelah cleanup selesai, lanjut ke step berikutnya.**

---

## ✅ Untuk Deploy PERTAMA KALI

Gunakan script yang sudah otomatis setup semuanya:

### 1️⃣ Edit Konfigurasi (Jika Perlu)

```bash
nano setup-vps-first-time.sh
```

Edit bagian ini sesuai VPS Anda:

```bash
VPS_USER="root"
VPS_HOST="151.240.0.97"
VPS_PORT="22"
VPS_PATH="/var/www/portfolio"
DOMAIN_OR_IP="151.240.0.97"  # Ganti dengan domain: iqbalhidayatrasyad.blog
```

### 2️⃣ Jalankan Script Setup

```bash
./setup-vps-first-time.sh
```

Script akan otomatis:

- ✅ Install Nginx di VPS
- ✅ Setup firewall (UFW)
- ✅ Buat folder structure
- ✅ Generate dan upload nginx config
- ✅ Build project Anda
- ✅ Deploy ke VPS
- ✅ Test deployment

### 3️⃣ Selesai!

Buka browser dan akses:

```
http://151.240.0.97
```

---

## 🔄 Untuk UPDATE Website (Setelah Deploy Pertama)

Setelah pertama kali setup, untuk update website cukup:

```bash
./deploy.sh
```

Script akan otomatis:

- Build ulang
- Upload ke VPS
- Restart Nginx

---

## 🔍 Troubleshooting

### Script Gagal di Tahap Install Nginx

**Penyebab:** Koneksi SSH bermasalah atau VPS belum siap

**Solusi:**

```bash
# Test koneksi SSH dulu
ssh root@151.240.0.97

# Jika berhasil login, install nginx manual:
apt update
apt install -y nginx
systemctl start nginx

# Lalu jalankan script lagi
exit
./setup-vps-first-time.sh
```

---

### Error: "Permission denied"

**Penyebab:** Script belum executable

**Solusi:**

```bash
chmod +x setup-vps-first-time.sh
chmod +x deploy.sh
```

---

### Error: "Connection refused"

**Penyebab:**

1. VPS belum allow port 22 (SSH)
2. IP VPS salah
3. Firewall block

**Solusi:**

```bash
# Login ke VPS via web console (dari dashboard provider)
# Lalu jalankan:
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

---

### Website Tidak Muncul Setelah Deploy

**Cek 1: Status Nginx**

```bash
ssh root@151.240.0.97 'systemctl status nginx'
```

**Cek 2: Error Log**

```bash
ssh root@151.240.0.97 'tail -30 /var/log/nginx/portfolio_error.log'
```

**Cek 3: Test dari VPS**

```bash
ssh root@151.240.0.97 'curl http://localhost'
```

**Cek 4: Firewall**

```bash
ssh root@151.240.0.97 'ufw status'
# Pastikan port 80 dan 443 ALLOW
```

**Cek 5: File Ada atau Tidak**

```bash
ssh root@151.240.0.97 'ls -la /var/www/portfolio'
# Harus ada file index.html
```

---

### Error: "nginx: [emerg] bind() to 0.0.0.0:80 failed (98: Address already in use)"

**Penyebab:** Port 80 sudah dipakai service lain (biasanya Apache)

**Solusi:**

```bash
ssh root@151.240.0.97

# Check apa yang pakai port 80
netstat -tulpn | grep :80

# Jika Apache, stop dan disable
systemctl stop apache2
systemctl disable apache2

# Restart nginx
systemctl restart nginx
```

---

## 🌐 Setup Domain (Opsional)

Jika Anda punya domain `iqbalhidayatrasyad.blog`:

### 1. Pointing Domain ke VPS

Di DNS provider (Cloudflare, Namecheap, dll):

| Type | Name | Value        | TTL  |
| ---- | ---- | ------------ | ---- |
| A    | @    | 151.240.0.97 | Auto |
| A    | www  | 151.240.0.97 | Auto |

### 2. Update Script

Edit `setup-vps-first-time.sh`:

```bash
DOMAIN_OR_IP="iqbalhidayatrasyad.blog"
```

### 3. Jalankan Ulang

```bash
./setup-vps-first-time.sh
```

### 4. Test

Tunggu 5-10 menit, lalu buka:

```
http://iqbalhidayatrasyad.blog
```

---

## 🔒 Setup HTTPS/SSL (Recommended)

Setelah domain sudah pointing:

```bash
ssh root@151.240.0.97

# Install certbot
apt install -y certbot python3-certbot-nginx

# Generate SSL certificate (otomatis setup nginx)
certbot --nginx -d iqbalhidayatrasyad.blog -d www.iqbalhidayatrasyad.blog

# Follow prompts:
# - Enter email: your-email@example.com
# - Agree to terms: Y
# - Share email: N (optional)
# - Redirect HTTP to HTTPS: 2 (Yes)

# Test auto-renewal
certbot renew --dry-run
```

Selesai! Website Anda sekarang pakai HTTPS:

```
https://iqbalhidayatrasyad.blog
```

---

## 📊 Command Berguna

### Check Status

```bash
# Status nginx
ssh root@151.240.0.97 'systemctl status nginx'

# Status firewall
ssh root@151.240.0.97 'ufw status'

# Disk usage
ssh root@151.240.0.97 'df -h'

# Memory usage
ssh root@151.240.0.97 'free -h'
```

### View Logs

```bash
# Error log (last 50 lines)
ssh root@151.240.0.97 'tail -50 /var/log/nginx/portfolio_error.log'

# Access log (last 50 lines)
ssh root@151.240.0.97 'tail -50 /var/log/nginx/portfolio_access.log'

# Real-time log monitoring
ssh root@151.240.0.97 'tail -f /var/log/nginx/portfolio_access.log'
```

### Restart Services

```bash
# Restart nginx
ssh root@151.240.0.97 'systemctl restart nginx'

# Reload nginx config (tanpa downtime)
ssh root@151.240.0.97 'systemctl reload nginx'

# Test nginx config
ssh root@151.240.0.97 'nginx -t'
```

---

## 🎯 Quick Reference

| Task                | Command                                                              |
| ------------------- | -------------------------------------------------------------------- |
| Deploy pertama kali | `./setup-vps-first-time.sh`                                          |
| Update website      | `./deploy.sh`                                                        |
| Check status        | `ssh root@151.240.0.97 'systemctl status nginx'`                     |
| View logs           | `ssh root@151.240.0.97 'tail -f /var/log/nginx/portfolio_error.log'` |
| Restart nginx       | `ssh root@151.240.0.97 'systemctl restart nginx'`                    |
| Setup SSL           | `ssh root@151.240.0.97 'certbot --nginx -d domain.com'`              |

---

## 💡 Tips

1. **Backup Regular**: Setup cron job untuk backup otomatis
2. **Monitor Uptime**: Gunakan UptimeRobot (gratis) untuk monitoring
3. **Enable Cloudflare**: Gratis CDN dan DDoS protection
4. **Update System**: Rutin update VPS dengan `apt update && apt upgrade`
5. **Security**: Ubah SSH port default, disable password login, gunakan SSH key

---

## 📚 Dokumentasi Lengkap

- Setup HTTPS/SSL lengkap: `TUTORIAL-VPS-PUBLIC-IP.md`
- Manual deployment: `DEPLOY-QUICK-GUIDE.md`
- Troubleshooting detail: `TUTORIAL-DEPLOY-VPS.md`

---

**Butuh bantuan?** Cek error log terlebih dahulu:

```bash
ssh root@151.240.0.97 'tail -50 /var/log/nginx/portfolio_error.log'
```
