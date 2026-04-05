# Tutorial Deploy Portfolio ke VPS

## Ringkasan

Tutorial ini akan membantu Anda deploy aplikasi SvelteKit portfolio ke VPS dengan menggunakan **static files yang ringan** (hanya ~5.5MB) hasil build, bukan full project folder.

---

## Prasyarat

### Di Komputer Lokal:

- Node.js sudah terinstall
- Project portfolio sudah di-clone

### Di VPS:

- Akses SSH ke VPS
- Nginx sudah terinstall
- Domain/subdomain sudah diarahkan ke IP VPS (opsional)

---

## Metode 1: Deploy Manual dengan SCP/SFTP

### Step 1: Build Project di Lokal

```bash
# Di folder project lokal
cd /path/to/portofolio-website-iqbal

# Build project menjadi static files
npm run build

# Hasil build akan ada di folder 'build/' dengan ukuran ~5.5MB
```

### Step 2: Compress Build Folder

```bash
# Compress untuk mempercepat upload
tar -czf build.tar.gz build/

# Ukuran file compressed ~2-3MB
```

### Step 3: Upload ke VPS

**Menggunakan SCP:**

```bash
# Upload file compressed ke VPS
scp build.tar.gz user@ip-vps:/home/user/

# Contoh:
scp build.tar.gz root@151.240.0.97:/root/
```

**Atau menggunakan SFTP Client:**

- FileZilla
- WinSCP (Windows)
- Cyberduck (Mac/Windows)

Upload file `build.tar.gz` ke VPS Anda.

### Step 4: Extract di VPS

```bash
# SSH ke VPS
ssh user@ip-vps

# Buat folder untuk aplikasi
mkdir -p /var/www/portfolio

# Extract file
tar -xzf build.tar.gz -C /var/www/portfolio --strip-components=1

# Cek hasil extract
ls -la /var/www/portfolio/
# Seharusnya ada: index.html, _app/, favicon.png, dll
```

### Step 5: Konfigurasi Nginx

```bash
# Buat file konfigurasi nginx
sudo nano /etc/nginx/sites-available/portfolio
```

Copy konfigurasi berikut:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Ganti dengan domain Anda atau IP VPS

    root /var/www/portfolio;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_vary on;

    # Serve precompressed files
    gzip_static on;

    location / {
        try_files $uri $uri.html $uri/ /index.html =404;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Handle 404
    error_page 404 /404.html;
    location = /404.html {
        internal;
    }
}
```

Simpan file (Ctrl+O, Enter, Ctrl+X).

### Step 6: Aktifkan Konfigurasi

```bash
# Buat symbolic link
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/

# Test konfigurasi
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

### Step 7: Test Akses

Buka browser dan akses:

- `http://your-domain.com` atau
- `http://ip-vps-anda`

Portfolio Anda seharusnya sudah online!

---

## Metode 2: Deploy Otomatis dengan Script

Saya sudah buatkan script `deploy.sh` yang akan mengotomasi semua proses.

### Setup Awal:

```bash
# Di komputer lokal, edit file deploy.sh
nano deploy.sh

# Ubah variabel berikut sesuai VPS Anda:
VPS_USER="root"              # User VPS
VPS_HOST="151.240.0.97"     # IP VPS
VPS_PATH="/var/www/portfolio"  # Path di VPS
```

### Cara Menggunakan:

```bash
# Berikan permission execute
chmod +x deploy.sh

# Jalankan deploy
./deploy.sh
```

Script akan otomatis:

1. Build project
2. Compress hasil build
3. Upload ke VPS
4. Extract di VPS
5. Restart Nginx

---

## Metode 3: Deploy dengan Git + Post-Receive Hook

### Step 1: Setup Git di VPS

```bash
# SSH ke VPS
ssh user@ip-vps

# Buat bare repository
mkdir -p /var/repo/portfolio.git
cd /var/repo/portfolio.git
git init --bare

# Buat hook post-receive
nano hooks/post-receive
```

Copy script berikut:

```bash
#!/bin/bash
GIT_WORK_TREE=/var/www/portfolio
export GIT_WORK_TREE

git checkout -f

# Restart nginx jika perlu
systemctl restart nginx
```

Berikan permission:

```bash
chmod +x hooks/post-receive
```

### Step 2: Push dari Lokal

```bash
# Di komputer lokal
cd /path/to/portofolio-website-iqbal

# Build dulu
npm run build

# Tambahkan remote VPS
git remote add vps user@ip-vps:/var/repo/portfolio.git

# Push hanya folder build
# (Pastikan folder build tidak ada di .gitignore)
git add build/
git commit -m "Deploy to VPS"
git push vps main
```

---

## Setup HTTPS dengan Let's Encrypt (Opsional)

Jika Anda menggunakan domain, sebaiknya aktifkan HTTPS:

```bash
# Install certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# Generate SSL certificate
sudo certbot --nginx -d your-domain.com

# Certbot akan otomatis mengupdate konfigurasi nginx
# Certificate akan auto-renew
```

---

## Troubleshooting

### 1. Permission Denied

```bash
# Set permission yang benar
sudo chown -R www-data:www-data /var/www/portfolio
sudo chmod -R 755 /var/www/portfolio
```

### 2. Nginx Error

```bash
# Check error log
sudo tail -f /var/log/nginx/error.log

# Test konfigurasi
sudo nginx -t
```

### 3. 404 Not Found

Pastikan:

- File `index.html` ada di root folder
- Konfigurasi `try_files` benar
- Path di nginx config benar

### 4. CSS/JS Not Loading

```bash
# Pastikan file permission benar
find /var/www/portfolio -type f -exec chmod 644 {} \;
find /var/www/portfolio -type d -exec chmod 755 {} \;
```

---

## Update Aplikasi

Setiap kali ada perubahan:

```bash
# Di komputer lokal:
npm run build
./deploy.sh  # Jika pakai script otomatis

# Atau manual:
tar -czf build.tar.gz build/
scp build.tar.gz user@ip-vps:/tmp/
ssh user@ip-vps "tar -xzf /tmp/build.tar.gz -C /var/www/portfolio --strip-components=1"
```

---

## Monitoring & Maintenance

### Check Nginx Status

```bash
sudo systemctl status nginx
```

### Check Disk Usage

```bash
df -h
du -sh /var/www/portfolio
```

### View Access Logs

```bash
sudo tail -f /var/log/nginx/access.log
```

### View Error Logs

```bash
sudo tail -f /var/log/nginx/error.log
```

---

## Keuntungan Metode Static Files

✅ **Ringan**: Hanya ~5.5MB vs full project ~300MB+  
✅ **Cepat**: Tidak perlu Node.js di VPS  
✅ **Aman**: Tidak ada server-side code yang berjalan  
✅ **Murah**: Bisa pakai VPS spek rendah (512MB RAM cukup)  
✅ **Simple**: Cukup Nginx untuk serve static files

---

## Spesifikasi VPS Minimum

- **RAM**: 512MB (cukup)
- **Storage**: 10GB
- **OS**: Ubuntu 20.04/22.04 atau Debian
- **Software**: Nginx saja

---

## Penutup

Selamat! Portfolio Anda sekarang sudah online dan bisa diakses publik. 🎉

Untuk pertanyaan atau issue, silakan buat issue di repository GitHub.
