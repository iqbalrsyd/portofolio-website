# ☁️ Setup Cloudflare untuk VPS NAT - Panduan Lengkap

## 🎯 Tujuan
Menggunakan Cloudflare untuk:
- ✅ Hide port non-standard (32021 → 443 standard)
- ✅ SSL/HTTPS gratis otomatis
- ✅ CDN untuk loading cepat
- ✅ URL bersih: `https://iqbalhidayatrasyad.blog` (tanpa port)

## 📋 Prerequisites
- Domain: `iqbalhidayatrasyad.blog`
- VPS IP: `51.68.52.220`
- Port: `32021` (HTTP internal)
- Email untuk akun Cloudflare

---

## 🚀 Step-by-Step Setup

### **STEP 1: Buat Akun Cloudflare**

1. Buka https://dash.cloudflare.com/sign-up
2. Daftar dengan email
3. Verifikasi email
4. Login ke dashboard

---

### **STEP 2: Tambahkan Domain ke Cloudflare**

1. **Di Cloudflare Dashboard:**
   - Klik **"Add a Site"** atau **"+ Add Site"**
   
2. **Masukkan domain:**
   ```
   iqbalhidayatrasyad.blog
   ```
   - Klik **"Add site"**

3. **Pilih Plan:**
   - Pilih **"Free"** ($0/month)
   - Klik **"Continue"**

4. **Tunggu Cloudflare scan DNS:**
   - Cloudflare akan scan DNS record yang ada
   - Klik **"Continue"**

---

### **STEP 3: Setup DNS Records**

Di halaman DNS Records:

**Hapus semua record lama**, lalu tambah 2 record ini:

#### **Record 1: Root Domain**
```
Type:     A
Name:     @
Content:  51.68.52.220
Proxy:    ✅ Proxied (Orange Cloud)
TTL:      Auto
```

#### **Record 2: WWW Subdomain**
```
Type:     A
Name:     www
Content:  51.68.52.220
Proxy:    ✅ Proxied (Orange Cloud)
TTL:      Auto
```

⚠️ **PENTING:** Pastikan **Proxied** (awan orange) AKTIF, bukan DNS Only!

Klik **"Continue"** setelah selesai.

---

### **STEP 4: Update Nameservers di Domain Provider**

Cloudflare akan kasih 2 nameservers, contoh:
```
amin.ns.cloudflare.com
kiki.ns.cloudflare.com
```

**Di panel domain Anda (tempat beli domain):**

1. Masuk ke pengaturan domain `iqbalhidayatrasyad.blog`
2. Cari menu **"Nameservers"** atau **"DNS Settings"**
3. Ganti nameservers dari yang lama ke nameservers Cloudflare
4. Simpan perubahan

⏰ **Tunggu propagasi:** 5 menit - 24 jam (biasanya cepat, ~15 menit)

Klik **"Done, check nameservers"** di Cloudflare.

---

### **STEP 5: Setup SSL/TLS**

Di Cloudflare Dashboard:

1. **Klik domain Anda** → Pilih **"SSL/TLS"** di sidebar

2. **Overview:**
   ```
   Encryption mode: Flexible
   ```
   - Pilih **"Flexible"**
   
3. **Edge Certificates:**
   - Scroll ke bawah
   - **Always Use HTTPS:** Toggle **ON** ✅
   - **Automatic HTTPS Rewrites:** Toggle **ON** ✅
   - **Minimum TLS Version:** TLS 1.2 (default)

---

### **STEP 6: Setup Page Rules (untuk hide port)**

Ini yang **PENTING** untuk NAT VPS!

1. **Di Cloudflare Dashboard:**
   - Sidebar → Klik **"Rules"** → **"Page Rules"**
   
2. **Create Page Rule #1: Redirect Root to Port**
   ```
   If the URL matches: iqbalhidayatrasyad.blog/*
   
   Then the settings are:
   - Forwarding URL: 301 - Permanent Redirect
   - Destination URL: http://51.68.52.220:32021/$1
   ```
   
   ❌ **TUNGGU!** Cara ini tidak optimal untuk production.

---

### **STEP 6 (ALTERNATIF): Setup Cloudflare Tunnel - RECOMMENDED ⭐**
    
Ini cara TERBAIK untuk VPS NAT dengan port non-standard!

#### **A. Install Cloudflared di VPS**

SSH ke VPS:
```bash
ssh -p 40570 root@51.68.52.220
```

Install cloudflared:
```bash
# Download cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb

# Install
dpkg -i cloudflared-linux-amd64.deb

# Verify
cloudflared --version
```

#### **B. Login Cloudflared**
```bash
cloudflared tunnel login
```
- Browser akan terbuka
- Login ke Cloudflare
- Pilih domain `iqbalhidayatrasyad.blog`
- Authorize

#### **C. Create Tunnel**
```bash
# Create tunnel
cloudflared tunnel create portfolio-tunnel

# Akan generate tunnel ID, catat ID-nya
# Misal: a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

#### **D. Create Config File**
```bash
nano ~/.cloudflared/config.yml
```

Paste config ini (ganti TUNNEL-ID dengan ID Anda):
```yaml
tunnel: portfolio-tunnel
credentials-file: /root/.cloudflared/TUNNEL-ID.json

ingress:
  # Route root domain to local port 80
  - hostname: iqbalhidayatrasyad.blog
    service: http://localhost:80
  
  # Route www subdomain
  - hostname: www.iqbalhidayatrasyad.blog
    service: http://localhost:80
  
  # Catch-all rule (required)
  - service: http_status:404
```

Save (Ctrl+X, Y, Enter)

#### **E. Route DNS ke Tunnel**
```bash
# Route root domain
cloudflared tunnel route dns portfolio-tunnel iqbalhidayatrasyad.blog

# Route www subdomain
cloudflared tunnel route dns portfolio-tunnel www.iqbalhidayatrasyad.blog
```

#### **F. Run Tunnel**

Test dulu:
```bash
cloudflared tunnel run portfolio-tunnel
```

Jika berhasil, stop (Ctrl+C), lalu install as service:
```bash
# Install service
cloudflared service install

# Start service
systemctl start cloudflared

# Enable auto-start
systemctl enable cloudflared

# Check status
systemctl status cloudflared
```

---

### **STEP 7: Verifikasi**

#### **A. Check DNS Propagation**
```bash
# Check dari terminal lokal
nslookup iqbalhidayatrasyad.blog
```

Harusnya resolve ke IP Cloudflare, bukan IP VPS langsung.

#### **B. Test Akses Website**

Buka browser:
```
https://iqbalhidayatrasyad.blog
https://www.iqbalhidayatrasyad.blog
```

**✅ Harusnya:**
- SSL hijau (HTTPS)
- Tanpa port di URL
- Website loading

#### **C. Check dari Terminal**
```bash
curl -I https://iqbalhidayatrasyad.blog
```

Harusnya response 200 OK dengan header Cloudflare.

---

## 🎯 **Ringkasan Setup (Tanpa Tunnel - Metode Simple)**

Jika tidak mau pakai Tunnel, setup minimal:

1. ✅ Add domain ke Cloudflare
2. ✅ Setup DNS A record (proxied)
3. ✅ Update nameservers di domain provider
4. ✅ SSL/TLS: Flexible mode
5. ✅ Always Use HTTPS: ON

**Akses:**
```
https://iqbalhidayatrasyad.blog:32021    (dengan port)
```

⚠️ **Catatan:** Tanpa Tunnel, user tetap harus ketik port `:32021`

---

## 🎯 **Ringkasan Setup (Dengan Tunnel - RECOMMENDED ⭐)**

1. ✅ Add domain ke Cloudflare
2. ✅ Update nameservers
3. ✅ Install cloudflared di VPS
4. ✅ Create tunnel
5. ✅ Setup config routing ke localhost:80
6. ✅ Route DNS ke tunnel

**Akses:**
```
https://iqbalhidayatrasyad.blog          (clean URL!)
```

---

## 📊 Perbandingan Metode

| Fitur | Tanpa Cloudflare | Cloudflare (No Tunnel) | Cloudflare Tunnel ⭐ |
|-------|------------------|------------------------|---------------------|
| URL | `http://domain:32021` | `https://domain:32021` | `https://domain` |
| SSL | ❌ | ✅ | ✅ |
| Hide Port | ❌ | ❌ | ✅ |
| DDoS Protection | ❌ | ✅ | ✅ |
| CDN | ❌ | ✅ | ✅ |
| Setup | Simple | Easy | Medium |

---

## ⚙️ Maintenance

### Restart Cloudflare Tunnel
```bash
systemctl restart cloudflared
```

### Check Tunnel Status
```bash
systemctl status cloudflared
cloudflared tunnel info portfolio-tunnel
```

### View Tunnel Logs
```bash
journalctl -u cloudflared -f
```

### Update Cloudflared
```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
dpkg -i cloudflared-linux-amd64.deb
systemctl restart cloudflared
```

---

## 🐛 Troubleshooting

### Domain tidak resolve
```bash
# Check nameservers
dig NS iqbalhidayatrasyad.blog

# Harusnya nunjuk ke Cloudflare nameservers
```

### SSL Error
- Di Cloudflare: SSL/TLS → Set to **Flexible**
- Tunggu 5-10 menit

### Tunnel tidak connect
```bash
# Check service
systemctl status cloudflared

# Check logs
journalctl -u cloudflared -n 50

# Restart
systemctl restart cloudflared
```

### Website masih pakai port
- Pastikan Cloudflare Tunnel running
- Check config.yml benar
- Restart cloudflared service

---

## ✅ Checklist Setup

- [ ] Akun Cloudflare sudah dibuat
- [ ] Domain ditambahkan ke Cloudflare
- [ ] DNS A records sudah disetup (proxied)
- [ ] Nameservers sudah diupdate di domain provider
- [ ] SSL/TLS mode: Flexible
- [ ] Always Use HTTPS: ON
- [ ] Cloudflared terinstall di VPS (jika pakai Tunnel)
- [ ] Tunnel sudah dibuat dan running (jika pakai Tunnel)
- [ ] Website accessible via `https://domain.com`

---

## 📚 Resources

- [Cloudflare Dashboard](https://dash.cloudflare.com)
- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Cloudflared Download](https://github.com/cloudflare/cloudflared/releases)

---

## 💰 Biaya

**Gratis!** Semua fitur yang dipakai ada di Cloudflare Free Plan.

- ✅ SSL Certificate: Gratis
- ✅ CDN: Gratis
- ✅ DDoS Protection: Gratis  
- ✅ Cloudflare Tunnel: Gratis
- ✅ Bandwidth: Unlimited (Free)
