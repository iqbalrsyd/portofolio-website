# Vercel Web Analytics — Simple Implementation Plan

## Goal

Menambahkan statistik dasar pengunjung portfolio melalui Vercel Web Analytics tanpa membuat backend, database, atau dashboard sendiri.

## Decision

Gunakan Vercel Web Analytics pada plan Hobby terlebih dahulu.

- Gratis hingga 50.000 analytics events per bulan.
- Reporting window satu bulan.
- Jika batas Hobby tercapai, pengumpulan data dijeda dan tidak otomatis ditagihkan.
- Custom Events seperti klik tombol dan kartu tidak termasuk pada Hobby.

Untuk tahap awal, page view dan visitor analytics sudah cukup. Tracking klik dapat dipertimbangkan kembali setelah portfolio memiliki traffic yang cukup atau akun berpindah ke plan yang mendukung Custom Events.

## Status

- [x] Package dan integrasi website selesai.
- [x] Production build berhasil.
- [ ] Enable Web Analytics pada dashboard Vercel.
- [ ] Deploy ke production dan verifikasi data masuk.

## Data yang Akan Tersedia

- Page views.
- Unique visitors.
- Halaman yang paling sering dibuka.
- Referrer atau asal traffic.
- Negara pengunjung secara agregat.
- Device, browser, dan operating system.

## Changes Required

Hanya ada tiga perubahan utama.

### 1. Enable Analytics di Vercel

- Buka project portfolio yang digunakan sebagai production di Vercel.
- Masuk ke menu **Analytics**.
- Pilih **Enable Web Analytics**.
- Pastikan hanya satu project Vercel yang menjadi deployment production agar data tidak terpisah.

Tidak ada file repository yang berubah pada langkah ini.

### 2. Install Package

Jalankan:

```bash
npm install @vercel/analytics
```

File yang berubah:

```text
package.json
package-lock.json
```

`package-lock.json` harus ikut di-commit agar dependency yang digunakan pada lokal dan Vercel konsisten.

### 3. Integrate with Root Layout

Tambahkan integrasi analytics pada:

```text
src/routes/+layout.svelte
```

Draft perubahan:

```svelte
<script lang="ts">
	import { dev } from '$app/environment';
	import { inject } from '@vercel/analytics';

	inject({ mode: dev ? 'development' : 'production' });
</script>
```

Import tersebut digabungkan dengan `<script>` yang sudah ada. Jangan membuat script block kedua.

## Files Expected to Change

```text
package.json
package-lock.json
src/routes/+layout.svelte
```

Tidak perlu mengubah:

```text
vercel.json
svelte.config.js
src/routes/+page.svelte
project/experience/education components
```

## Implementation Checklist

- [ ] Pastikan project Vercel production yang benar sudah dipilih.
- [ ] Enable Web Analytics dari dashboard Vercel.
- [x] Install `@vercel/analytics` menggunakan npm.
- [x] Tambahkan `inject()` pada root layout.
- [x] Jalankan `npm run build`.
- [x] Pastikan tidak ada runtime/build error dari integrasi analytics.
- [ ] Commit ketiga file yang berubah.
- [ ] Push ke `main` agar Vercel membuat deployment baru.
- [ ] Buka production website setelah deployment selesai.
- [ ] Periksa request analytics melalui browser Network tab.
- [ ] Periksa data pada menu Analytics di Vercel setelah data mulai masuk.

## Verification

### Local

- `npm run build` berhasil.
- Website dapat dibuka seperti biasa.
- Navigasi dan halaman resume tetap berfungsi.
- Tidak ada error analytics di browser console.

### Production

- Deployment Vercel berhasil.
- Homepage dan beberapa detail page dapat dibuka.
- Browser mengirim request analytics ke endpoint Vercel insights.
- Page view muncul pada dashboard Vercel.
- Data berasal dari project production yang benar, bukan project duplikat.

## Out of Scope

Hal berikut tidak dikerjakan pada implementasi awal:

- Tracking klik project, experience, education, skill, dan resume.
- Custom event schema.
- Backend analytics sendiri.
- Database analytics.
- Dashboard admin buatan sendiri.
- Session replay dan heatmap.
- Search keyword tracking.
- A/B testing.
- Speed Insights.

## Future Option

Evaluasi custom click tracking hanya jika:

- Portfolio sudah memiliki cukup traffic.
- Ada keputusan nyata yang ingin dibuat dari statistik klik.
- Plan Vercel sudah mendukung Custom Events atau ada alasan kuat memilih provider lain.

Jika tahap tersebut dibutuhkan, buat planning terpisah agar implementasi Web Analytics dasar tetap sederhana.

## Definition of Done

- Vercel Web Analytics aktif pada satu project production.
- Package analytics terpasang dan tercatat dalam npm lockfile.
- Integrasi hanya berada di root layout.
- Production build dan deployment berhasil.
- Page views dan visitors muncul pada dashboard Vercel.
- Tidak ada backend, database, atau custom event tambahan.

## Suggested Commit

```text
feat: add Vercel Web Analytics
```

## References

- [Vercel Web Analytics pricing](https://vercel.com/docs/analytics/limits-and-pricing)
- [Vercel Web Analytics quickstart](https://vercel.com/docs/analytics/quickstart)
- [Vercel Analytics for SvelteKit](https://vercel.com/docs/frameworks/full-stack/sveltekit#web-analytics)
