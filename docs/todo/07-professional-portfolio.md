# Professional Portfolio & CV Improvements

## Goal

Membuat portfolio dan CV yang fokus, konsisten, mudah diverifikasi, serta mampu menunjukkan kontribusi dan hasil kerja secara profesional.

## Status

- [ ] Planned

## Phase 1 — Positioning & First Impression

- [ ] Tentukan target role utama, misalnya **Backend and DevOps Engineer**.
- [ ] Perbarui headline homepage agar target role langsung terlihat.
- [ ] Tulis ringkasan profesional singkat: spesialisasi, kekuatan utama, dan jenis sistem yang pernah dibangun.
- [ ] Tampilkan maksimal 5–8 skill utama yang relevan dengan target role sebelum daftar skill lengkap.
- [ ] Tambahkan status availability, lokasi, serta preferensi remote/on-site bila diperlukan.
- [ ] Pastikan tombol utama terlihat jelas: View Projects, Download Resume, GitHub, LinkedIn, dan Email.

## Phase 2 — Featured Projects

- [ ] Pilih 3 project unggulan yang paling relevan dengan target role.
- [ ] Tentukan satu flagship project; kandidat utama: adaptive DevSecOps thesis atau backend performance benchmark.
- [ ] Untuk setiap featured project, lengkapi:
  - [ ] Masalah dan tujuan project.
  - [ ] Peran serta kontribusi pribadi.
  - [ ] Fitur atau scope utama.
  - [ ] Arsitektur dan alur data.
  - [ ] Teknologi beserta alasan pemilihannya.
  - [ ] Tantangan teknis dan solusi.
  - [ ] Cara menjalankan atau menguji project.
  - [ ] Repository dan live demo jika aman dipublikasikan.
  - [ ] Minimal satu cover dan dua screenshot yang relevan.
  - [ ] Diagram arsitektur.
  - [ ] Hasil terukur atau hasil eksperimen yang dapat diverifikasi.
- [ ] Hindari angka yang tidak pernah diuji atau tidak dapat dibuktikan.
- [ ] Jika belum memiliki production metrics, buat benchmark lokal yang terdokumentasi.
- [ ] Tandai project yang masih prototype, academic project, atau production-ready secara jujur.

## Phase 3 — Project Evidence

- [ ] Buat skenario benchmark yang adil dan dapat diulang.
- [ ] Catat environment pengujian: CPU, RAM, OS, versi runtime, jumlah request, dan concurrency.
- [ ] Ukur metrik yang relevan: latency, throughput, error rate, resource usage, image size, atau deployment time.
- [ ] Simpan hasil mentah dan ringkasannya di repository project.
- [ ] Tambahkan grafik atau tabel perbandingan sebelum/sesudah bila relevan.
- [ ] Jelaskan keterbatasan eksperimen agar hasil tidak menyesatkan.
- [ ] Gunakan contoh hasil yang spesifik, misalnya ukuran image, jumlah data, response time, atau test coverage.

## Phase 4 — Professional Experience

- [ ] Perkuat deskripsi internship BRI Insurance dengan konteks produk dan kontribusi, tanpa membuka informasi rahasia.
- [ ] Tambahkan angka yang aman bila tersedia: jumlah endpoint, fitur, test case, anggota tim, atau waktu pengerjaan.
- [ ] Fokuskan bullet pada tindakan dan dampak, bukan hanya daftar teknologi.
- [ ] Tambahkan pengalaman mengajar bimbingan belajar.
- [ ] Untuk pengalaman mengajar, catat:
  - [ ] Nama lembaga atau gunakan “Private Tutor” jika independen.
  - [ ] Mata pelajaran dan jenjang siswa.
  - [ ] Periode dan frekuensi mengajar.
  - [ ] Jumlah siswa atau ukuran kelas.
  - [ ] Materi, metode, dan evaluasi yang dibuat.
  - [ ] Hasil belajar yang dapat dibuktikan bila ada.
- [ ] Periksa kembali tanggal dan durasi semua experience.

## Phase 5 — CV Alignment

- [ ] Pastikan nama role, perusahaan, periode, pendidikan, GPA, dan project konsisten dengan website.
- [ ] Ganti status semester yang cepat kedaluwarsa dengan expected graduation date.
- [ ] Batasi CV menjadi satu halaman jika pengalaman masih entry-level.
- [ ] Gunakan bullet yang diawali action verb dan menjelaskan kontribusi atau dampak.
- [ ] Prioritaskan skill yang didukung oleh project atau pengalaman nyata.
- [ ] Tambahkan tautan portfolio, GitHub, LinkedIn, dan email yang dapat diklik.
- [ ] Pastikan PDF memiliki nama profesional, misalnya `Iqbal-Hidayat-Rasyad-Resume.pdf`.
- [ ] Periksa ejaan, konsistensi bahasa, alignment, dan keterbacaan ATS.
- [ ] Pastikan versi PDF terbaru sudah digunakan oleh tombol resume di website.

## Phase 6 — GitHub Quality

- [ ] Pin 4–6 repository terbaik pada profil GitHub.
- [ ] Lengkapi README setiap repository unggulan dengan overview, arsitektur, setup, konfigurasi, dan screenshot.
- [ ] Tambahkan `.env.example` tanpa credential asli.
- [ ] Tambahkan contoh API request/response jika relevan.
- [ ] Pastikan langkah instalasi dapat dijalankan dari clone baru.
- [ ] Tambahkan automated build/test yang benar-benar berguna.
- [ ] Rapikan nama repository, deskripsi, topic, dan link demo.
- [ ] Periksa dan hapus secret, credential, data perusahaan, serta artefak yang tidak boleh dipublikasikan.

## Phase 7 — Portfolio UX & Trust

- [ ] Pastikan navigasi mobile dan desktop mudah digunakan.
- [ ] Tambahkan empty/loading/error state yang layak.
- [ ] Periksa seluruh link dan hindari placeholder atau link mati.
- [ ] Optimalkan ukuran logo, screenshot, dan gambar project.
- [ ] Tambahkan alt text yang deskriptif pada gambar.
- [ ] Periksa kontras warna dan penggunaan keyboard.
- [ ] Pastikan resume dapat dibuka dan diunduh pada mobile.
- [ ] Pastikan metadata title, description, favicon, dan social preview sudah profesional.
- [ ] Jalankan audit performance dan accessibility sebelum release.

## Phase 8 — Analytics

- [ ] Kerjakan setelah konten utama dan CTA stabil.
- [ ] Ikuti rencana pada [06-visitor-analytics.md](./06-visitor-analytics.md).
- [ ] Gunakan hasil analytics untuk memperbaiki susunan project dan CTA, bukan sekadar mengumpulkan angka.

## Phase 9 — Blog (Later)

- [ ] Mulai blog setelah tiga featured project dan CV selesai.
- [ ] Tulis 2–3 artikel berbasis pengalaman sendiri, bukan tutorial generik.
- [ ] Kandidat artikel:
  - [ ] Hasil benchmark gRPC vs REST.
  - [ ] Optimasi ukuran Docker image.
  - [ ] Desain event-driven system dengan Kafka.
  - [ ] Pelajaran dari adaptive DevSecOps pipeline.
- [ ] Sertakan diagram, metode eksperimen, hasil, dan repository terkait.

## Recommended Execution Order

1. Positioning dan homepage.
2. Tiga featured project dan satu flagship project.
3. Bukti hasil, benchmark, screenshot, dan diagram.
4. Experience BRI Insurance serta pengalaman mengajar.
5. CV dan konsistensi seluruh profil.
6. GitHub repository quality.
7. UX, accessibility, performance, dan metadata.
8. Analytics.
9. Blog.

## Definition of Done

- Target role dapat dipahami dalam beberapa detik dari homepage.
- Tiga project unggulan memiliki masalah, kontribusi, arsitektur, bukti visual, dan hasil terukur.
- Experience menjelaskan dampak dan tidak hanya menyebut teknologi.
- CV, portfolio, LinkedIn, dan GitHub menyampaikan informasi yang konsisten.
- Semua tautan utama berfungsi dan tidak ada placeholder.
- Website layak digunakan pada desktop dan mobile serta lolos build production.
- Tidak ada credential atau informasi rahasia yang dipublikasikan.
