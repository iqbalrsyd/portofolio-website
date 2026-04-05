# Deploy Portfolio ke VPS - Quick Guide

## 🚀 Cara Tercepat (3 Langkah)

### 1. Edit Konfigurasi Deploy

```bash
nano deploy.sh

# Edit baris ini:
VPS_USER="root"              # User VPS Anda
VPS_HOST="151.240.0.97"     # IP VPS Anda
VPS_PATH="/var/www/portfolio"
```

### 2. Setup Nginx di VPS (Satu Kali)

```bash
# Generate config nginx
./generate-nginx-config.sh

# Copy ke VPS (sesuaikan dengan IP/domain Anda)
scp nginx-portfolio.conf root@151.240.0.97:/etc/nginx/sites-available/portfolio

# SSH ke VPS dan aktifkan
ssh root@151.240.0.97
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Atau jika menggunakan domain
# Edit nginx.conf dan ganti server_name dengan domain Anda:
# server_name iqbalhidayatrasyad.blog www.iqbalhidayatrasyad.blog;
```

### 3. Deploy!

```bash
./deploy.sh
```

**Done!** Website Anda sudah online 🎉

---

## 📦 Apa yang Di-Upload?

Hanya folder `build/` (~5.5MB) yang berisi:

- HTML files (pre-rendered)
- JavaScript bundles (optimized & minified)
- CSS files (minified)
- Assets (images, fonts, dll)

**TIDAK termasuk:**

- node_modules (~300MB+)
- Source code (.ts, .svelte files)
- Development dependencies

---

## 🔄 Update Website

Setiap kali ada perubahan:

```bash
./deploy.sh
```

Script akan otomatis:

1. Build ulang
2. Upload ke VPS
3. Restart Nginx

---

## 📚 Dokumentasi Lengkap

Lihat [TUTORIAL-DEPLOY-VPS.md](TUTORIAL-DEPLOY-VPS.md) untuk:

- Penjelasan detail setiap step
- Troubleshooting
- Setup HTTPS
- Monitoring & maintenance

---

## 🛠 Manual Deployment (Tanpa Script)

Jika ingin manual:

```bash
# 1. Build
npm run build

# 2. Compress
tar -czf build.tar.gz build/

# 3. Upload
scp build.tar.gz root@IP-VPS:/tmp/

# 4. Extract di VPS
ssh root@IP-VPS
tar -xzf /tmp/build.tar.gz -C /var/www/portfolio --strip-components=1
systemctl restart nginx
```

---

## 💡 Tips

- **First deploy?** Ikuti tutorial lengkap di [TUTORIAL-DEPLOY-VPS.md](TUTORIAL-DEPLOY-VPS.md)
- **Update regular?** Pakai `./deploy.sh` untuk otomasi
- **Production?** Setup HTTPS dengan Let's Encrypt (gratis)

---

## 🆘 Troubleshooting

### Deploy Error

```bash
# Cek koneksi SSH
ssh root@IP-VPS

# Cek nginx status
ssh root@IP-VPS 'systemctl status nginx'
```

### Website Not Loading

```bash
# Cek error log
ssh root@IP-VPS 'tail -f /var/log/nginx/error.log'
```

### Permission Issues

```bash
ssh root@IP-VPS 'chown -R www-data:www-data /var/www/portfolio'
```

---

## 📋 Requirements

**Lokal:**

- Node.js
- SSH access ke VPS

**VPS:**

- Ubuntu/Debian
- Nginx installed
- Minimal 512MB RAM
- 10GB Storage

---

## 🌐 Access

Setelah deploy, akses website di:

- `http://151.240.0.97` (via IP)
- `http://iqbalhidayatrasyad.blog` atau `http://www.iqbalhidayatrasyad.blog` (via domain)
- `https://iqbalhidayatrasyad.blog` (jika sudah setup SSL - lihat TUTORIAL-VPS-PUBLIC-IP.md)

Happy deploying! 🚀
