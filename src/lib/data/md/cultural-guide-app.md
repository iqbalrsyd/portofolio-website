# Cultural Guide — Prambanan Temple

Android application yang memandu wisatawan menjelajahi Candi Prambanan dengan interactive map, geofencing-based cultural content, dan dukungan offline access.

---

## Overview

Aplikasi mobile yang dirancang untuk meningkatkan pengalaman wisata di Candi Prambanan. User mendapat konten kontekstual (sejarah, deskripsi relief, info zona) secara otomatis ketika mereka mendekati titik-titik penting di kompleks candi, tanpa harus mencari info manual.

## Problem & Motivation

Wisatawan di situs heritage seperti Prambanan sering kehilangan konteks tentang apa yang mereka lihat. Papan informasi statis terbatas, audio guide rental mahal, dan koneksi internet di area candi sering tidak stabil. Solusi: app yang aktif push konten relevan berdasarkan lokasi, dan tetap usable walau offline.

## Tech Stack

- **Platform:** Android (Java)
- **Maps & Location:** Google Maps SDK, Google Play Services Location, Geofencing API
- **Backend & Auth:** Firebase Authentication, Cloud Firestore, Firebase Storage
- **Offline Support:** Local cache dengan sync strategy, Room untuk persistence
- **Image Loading:** Glide

## Key Features

- Interactive map Candi Prambanan dengan marker untuk setiap zona / candi perwara
- **Geofencing:** trigger konten budaya otomatis saat user masuk radius area (default 50 m)
- Multimedia content: foto relief, deskripsi, audio narasi
- Offline mode: data sudah pernah diakses tetap tersedia tanpa internet
- User authentication via Firebase (email / Google sign-in)
- Bookmark & favorites untuk tempat yang ingin dikunjungi lagi

## Architecture

```
┌──────────────────────┐
│  Android UI (Java)   │
│  - Maps Activity     │
│  - Detail Activity   │
│  - Bookmark Activity │
└──────────┬───────────┘
           │ Firebase SDK
┌──────────▼───────────────────────┐
│  Firebase Services               │
│  ┌──────────────┐  ┌──────────┐  │
│  │ Auth         │  │ Firestore│  │
│  └──────────────┘  └──────────┘  │
│  ┌──────────────┐  ┌──────────┐  │
│  │ Storage      │  │ Cloud    │  │
│  │ (images/audio)│ │ Messaging│  │
│  └──────────────┘  └──────────┘  │
└──────────┬───────────────────────┘
           │ Background sync
┌──────────▼───────────┐
│  Local Cache (Room)  │
│  Offline content     │
└──────────────────────┘
```

- **UI layer:** Activity-based dengan Google Maps integration.
- **Geofence manager:** register / monitor geofence circle around each POI, trigger broadcast ke detail activity.
- **Sync layer:** pull Firestore ke local Room DB; baca prioritas dari local dulu, fallback network.
- **Auth layer:** Firebase Auth dengan persistent session.

## Challenges & Solutions

- **Geofence limit Android:** maksimal 100 active geofence per app. Solusi: dynamic register/unregister berdasarkan viewport user di map.
- **Offline content size:** download semua multimedia makan storage. Solusi: lazy-load dengan LRU cache + hanya simpan yang pernah dibuka.
- **Akurasi GPS di area candi:** banyak canopy pohon mengganggu sinyal. Solusi: kombinasi GPS + network provider + geofence yang lebih besar dari radius ideal.

## Results

- Demoed di 20+ mahasiswa dan 5 tourist guide; feedback positif untuk trigger otomatis dan offline capability.
- 15 POI (3 candi utama + 12 perwara & zona) terkonten dengan deskripsi + foto.
- App size tetap < 50 MB meskipun multimedia, karena lazy loading strategy.
