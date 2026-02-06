# Rental Mobil Backend (Starter Skeleton)

Stack: **Node.js + TypeScript + Fastify + MySQL (mysql2/promise)**

## Tujuan
Starter ini dibuat untuk implementasi backend MVP dengan prinsip:
- Contract-first (OpenAPI)
- Error contract standar `{ error: { code, message, details } }`
- Transaksi aman untuk create rental (`SELECT ... FOR UPDATE`)
- Mapping error DB trigger (SQLSTATE 45000) → HTTP 409

## Quick Start
1) Install dependencies
```bash
npm install
cp .env.example .env
```

2) Siapkan database + jalankan migrations (gunakan file dari Production Pack)
```bash
mysql -u <user> -p <db> < db/migrations/V001__tables.sql
mysql -u <user> -p <db> < db/migrations/V002__triggers.sql
# dev only
mysql -u <user> -p <db> < db/seeds/DEV__seed_dummy.sql
```

3) Run server
```bash
npm run dev
```

## Endpoints yang sudah disiapkan (MVP baseline)
- GET /v1/health
- GET /v1/ready
- POST /v1/auth/login

### Vehicles
- GET /v1/vehicles
- POST /v1/vehicles
- GET /v1/vehicles/:id
- PUT /v1/vehicles/:id
- PATCH /v1/vehicles/:id/status (owner-only)

### Rentals
- POST /v1/rentals (locking + trigger mapping)
- POST /v1/rentals/:id/complete
- POST /v1/rentals/:id/cancel

### Maintenance
- GET /v1/maintenance
- POST /v1/maintenance
- POST /v1/maintenance/:id/complete

### Dashboard
- GET /v1/dashboard/summary

### Audit Logs
- GET /v1/audit-logs

## Catatan Penting
- Semua waktu diproses UTC (ISO-8601).
- Jangan jalankan DEV seed di production.


## API Docs (Swagger)
Jalankan server lalu buka `/docs` untuk Swagger UI.


## Demo polish
- Added: `GET /v1/rentals` (pagination + minimal filters) to support FE list.
