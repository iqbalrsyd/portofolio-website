# Visitor Analytics & Interaction Tracking

## Goal

Menambahkan dashboard statistik untuk memahami bagian portfolio yang paling sering dilihat dan diklik, tanpa mengumpulkan data pribadi atau isi input pengunjung.

## Status

- [ ] Planned

## Statistik yang Ingin Dilihat

- Jumlah page view dan unique visitor.
- Halaman atau section yang paling sering dibuka.
- Negara, perangkat, browser, dan sumber traffic secara agregat.
- Project, experience, education, dan skill yang paling sering diklik.
- Jumlah klik tombol download/view resume.
- Jumlah klik tautan GitHub, LinkedIn, email, demo, dan repository project.
- Navigasi yang digunakan, termasuk navbar dan pencarian.
- Error halaman atau route yang tidak ditemukan bila didukung provider.

## Event Plan

| Event | Trigger | Data yang Dikirim |
| --- | --- | --- |
| `section_view` | Section utama masuk viewport | `section` |
| `nav_click` | Item navbar diklik | `destination` |
| `project_open` | Kartu project dibuka | `project_slug` |
| `project_link_click` | Demo/repository project diklik | `project_slug`, `link_type` |
| `experience_open` | Kartu experience dibuka | `experience_slug` |
| `education_open` | Kartu education dibuka | `education_slug` |
| `skill_open` | Skill dibuka | `skill_slug` |
| `resume_view` | Resume dibuka | `source` |
| `resume_download` | Resume diunduh | `source` |
| `social_click` | Tautan sosial diklik | `platform` |
| `search_use` | Pencarian digunakan | `result_count`; jangan kirim keyword mentah |

## Implementation Plan

- [ ] Pilih provider analytics: Vercel Analytics untuk statistik dasar, atau PostHog/Umami/Plausible jika membutuhkan custom event yang lebih lengkap.
- [ ] Tentukan satu environment variable untuk mengaktifkan analytics hanya di production.
- [ ] Buat helper tracking terpusat agar komponen tidak terikat langsung ke satu provider.
- [ ] Tambahkan page-view tracking pada perubahan route.
- [ ] Tambahkan event pada navbar, kartu, resume, tautan sosial, dan link project.
- [ ] Gunakan `IntersectionObserver` untuk `section_view` dan cegah event berulang dalam satu sesi halaman.
- [ ] Pastikan analytics tidak menghambat navigasi bila script provider gagal dimuat.
- [ ] Abaikan traffic localhost, preview internal, dan development.
- [ ] Verifikasi event pada dashboard provider sebelum production release.
- [ ] Dokumentasikan nama event agar tetap konsisten ketika komponen baru ditambahkan.

## Privacy Rules

- Jangan mengirim nama, email, alamat IP mentah, isi pencarian, atau data sensitif lain sebagai event property.
- Jangan merekam session replay, ketikan, atau isi resume pengunjung tanpa kebutuhan dan persetujuan yang jelas.
- Gunakan data agregat dan retensi sesingkat yang masih berguna.
- Perbarui privacy notice jika provider menggunakan cookie atau tracking lintas situs.
- Hormati Do Not Track atau consent requirement sesuai konfigurasi provider dan target pengunjung.

## Definition of Done

- Dashboard menampilkan page view, unique visitor, sumber traffic, dan event interaksi utama.
- Klik project, experience, resume, serta external link dapat dibedakan dengan jelas.
- Tidak ada event ganda dari satu interaksi.
- Tidak ada data pribadi atau keyword pencarian mentah yang terkirim.
- Build production berhasil dan analytics tidak aktif saat development.
