# IoT Monitoring System

End-to-end IoT monitoring platform dengan MQTT-based communication, real-time web dashboard, dan REST API untuk data akses — capstone project.

---

## Overview

Sistem monitoring IoT yang menghubungkan sensor fisik (suhu, kelembapan, getaran, dll) ke web dashboard real-time. Sensor publish data lewat protokol MQTT, backend subscribe dan proses pesan, lalu expose ke dashboard React yang menampilkan visualisasi live dan historical.

## Problem & Motivation

Sistem monitoring industri tradisional sering pakai polling HTTP yang berat dan tidak real-time. MQTT sebagai protokol publish/subscribe lightweight lebih cocok untuk IoT: low bandwidth, low power, dan push-based. Project ini mengimplementasikan pola tersebut dari sensor sampai UI sebagai capstone untuk membuktikan integrasi full-stack IoT.

## Tech Stack

- **Communication:** MQTT (broker: Mosquitto)
- **Backend:** Node.js, Express.js, TypeScript
- **Frontend:** React.js
- **MQTT Client:** `mqtt.js` untuk subscribe di backend
- **Real-time Push:** WebSocket (Socket.IO) dari backend ke frontend
- **Persistence:** (prototype scope) in-memory + file-based log

## Key Features

- MQTT topic hierarchy per sensor type & device ID
- Backend service subscribe ke broker, parse payload, broadcast ke WebSocket client
- Real-time dashboard: grafik live untuk tiap sensor, status indicator, alert threshold
- REST API untuk historical data query & device management
- Multi-device support: satu backend handle banyak sensor concurrently
- Responsive UI: usable di desktop & tablet untuk monitoring di control room

## Architecture

```
┌─────────────┐  publish  ┌──────────────┐  subscribe ┌──────────────┐
│  IoT Sensor │ ────────▶ │ MQTT Broker  │ ◀──────── │  Backend     │
│  (ESP32)    │           │ (Mosquitto)  │           │  (Node.js)   │
└─────────────┘           └──────────────┘           └──────┬───────┘
                                                            │ WebSocket
                                                            ▼
                                                     ┌──────────────┐
                                                     │ React        │
                                                     │ Dashboard    │
                                                     └──────────────┘
                                                            │ REST
                                                            ▼
                                                     ┌──────────────┐
                                                     │ Data API     │
                                                     └──────────────┘
```

- **Sensor layer:** microcontroller publish JSON payload `{ deviceId, sensor, value, timestamp }` ke topic MQTT.
- **Broker layer:** Mosquitto handle fan-out ke multiple subscriber.
- **Backend layer:** subscribe ke topic, validate, transform, push ke WebSocket channel & simpan.
- **Frontend layer:** React connect WebSocket, render live chart dengan library chart.
- **API layer:** Express expose REST untuk historical / device list / config.

## Challenges & Solutions

- **QoS & message ordering:** MQTT QoS 0 bisa drop message. Solusi: pakai QoS 1 untuk data sensor kritis, dengan timestamp untuk handle ordering.
- **WebSocket scalability:** banyak client simultan. Solusi: connection pooling + broadcast per-room (subscribe ke sensor tertentu saja).
- **Schema drift:** payload format sensor bisa beda per device. Solusi: JSON Schema validation di backend dengan fallback reject payload invalid.
- **Time sync:** timestamp dari device vs server bisa beda. Solusi: pakai server timestamp saat message arrive, ignore device clock.

## Results

- 5 sensor simulasi (3 suhu, 1 kelembapan, 1 getaran) berhasil di-stream simultan tanpa drop.
- Dashboard update latency < 500 ms dari publish sampai render.
- API handle 100+ request/menit di load test lokal tanpa degradation.
- Capstone dipresentasikan ke panel & mendapat nilai A.
