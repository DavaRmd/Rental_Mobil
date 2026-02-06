# Rental Mobil Admin (Minimal UI)

Tujuan: UI admin minimal untuk demo ke atasan, mengikuti batasan backend yang sudah ada.

## Requirements
- Node.js 18+
- Backend API running (default): http://localhost:8080/v1

## Setup
```bash
cp .env.example .env
npm install
npm run dev
```
Buka: http://localhost:3000

## Notes
- UI sengaja sederhana (tanpa styling fancy).
- Rentals: hanya create (list rentals belum disediakan di backend skeleton ini).
- Timestamp input untuk rentals menggunakan ISO-8601 UTC (contoh: 2026-02-10T10:00:00Z).


## Demo helper
- Di halaman Dashboard ada tombol **Seed Demo Data** untuk membuat data dummy otomatis (vehicles + contoh rental/maintenance jika memungkinkan).

- Rentals page sekarang menampilkan list via `GET /v1/rentals`.

- Rentals list mendukung aksi **Complete/Cancel** (untuk status ACTIVE) via `POST /v1/rentals/:id/complete` dan `POST /v1/rentals/:id/cancel`.
