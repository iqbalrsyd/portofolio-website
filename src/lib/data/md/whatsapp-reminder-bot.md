# WhatsApp Reminder Chatbot

Chatbot service in Go yang mengirim pengingat terjadwal lewat WhatsApp dan Telegram, dirancang untuk automasi personal dan task scheduling.

---

## Overview

Dibangun sebagai backend automation service untuk mengirim reminder ke user melalui platform messaging yang paling sering dipakai. Service berjalan sebagai long-running process yang mengelola jadwal pengingat, mengeksekusi delivery pada waktu yang ditentukan, dan menangani retry ketika pengiriman gagal.

## Problem & Motivation

Sebagian besar task reminder app masih bergantung pada notifikasi native OS yang mudah di-ignore atau di-mute. Messaging platforms seperti WhatsApp & Telegram punya engagement rate yang jauh lebih tinggi karena user sudah terbiasa membuka app-nya sepanjang hari. Goal project ini: bikin service ringan yang bisa di-schedule dari mana aja, dan user menerima reminder di channel yang kemungkinan besar dibuka.

## Tech Stack

- **Language:** Go
- **Messaging Gateway:** WAHA (WhatsApp HTTP API) untuk integrasi WhatsApp
- **Scheduler:** Cron-based job runner
- **HTTP Client:** Native `net/http` untuk call ke WAHA & Telegram Bot API
- **Storage:** File-based JSON store (sederhana, single-user scope)

## Key Features

- Scheduled reminder via cron expression (flexible waktu pengingat)
- Multi-channel delivery: WhatsApp & Telegram
- Automatic retry dengan exponential backoff saat pengiriman gagal
- REST API untuk create / list / cancel reminder
- Graceful shutdown agar tidak ada job yang terputus di tengah jalan
- Logging terstruktur untuk audit trail

## Architecture

```
┌────────────┐   HTTP    ┌─────────────────┐   HTTP   ┌─────────┐
│  Client /  │ ────────▶ │  Go Reminder    │ ───────▶ │  WAHA   │ ─▶ WhatsApp
│   CLI      │           │  Service        │          └─────────┘
└────────────┘           │  ┌────────────┐ │   HTTP   ┌─────────┐
                         │  │ Cron       │ │ ───────▶ │ Telegram│ ─▶ Telegram
                         │  │ Scheduler  │ │          │  Bot API│
                         │  └────────────┘ │          └─────────┘
                         │  ┌────────────┐ │
                         │  │ JSON Store │ │
                         │  └────────────┘ │
                         └─────────────────┘
```

- **API layer:** handle incoming request (create / read / delete reminder).
- **Scheduler layer:** tick setiap menit, cari job yang due, push ke worker queue.
- **Worker layer:** call WAHA / Telegram API dengan retry logic.
- **Store layer:** persist reminder metadata ke JSON file.

## Challenges & Solutions

- **WhatsApp session stability:** WAHA kadang drop session. Solusi: health-check berkala dan re-attach session otomatis saat restart.
- **Timezone handling:** user bisa beda timezone. Solusi: simpan timezone per reminder dan evaluasi cron dalam zona tersebut, bukan UTC.
- **Idempotent delivery:** kalau service restart pas reminder due, jangan kirim 2x. Solusi: track state `pending / sent / failed` di store sebelum & sesudah call API.

## Results

- Berhasil mengirim 50+ reminder per hari pada testing pribadi tanpa miss.
- Retry logic mengurangi failed delivery sampai < 2% pada kondisi network normal.
- Memory footprint < 30 MB untuk ribuan scheduled reminder karena pakai file-based store.
