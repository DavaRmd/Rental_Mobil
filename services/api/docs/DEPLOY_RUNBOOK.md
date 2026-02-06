# Deploy Runbook (MVP)

## 1) Environment Variables (Production)
Minimal:
- DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
- JWT_SECRET (min 16 chars), JWT_EXPIRES_IN_HOURS
- PORT
- CORS_ORIGINS (domain FE admin)
- RATE_LIMIT_MAX, RATE_LIMIT_TIME_WINDOW_SECONDS
- LOG_LEVEL

## 2) Probes
- Liveness: `GET /v1/health` (harus 200)
- Readiness: `GET /v1/ready` (200 jika DB ok, 503 jika DB down)

## 3) Migration Policy
- Jalankan migrations sebelum deploy versi baru.
- Pastikan triggers terpasang (V002__triggers.sql).
- Backup sebelum migration besar.

## 4) Smoke Test
- Login berhasil
- Create vehicle
- Create rental (sukses)
- Create rental overlap (409)
- Create maintenance conflict (409)
- Dashboard summary OK
- Audit logs bertambah

## 5) Rollback
- Jika migration incompatible, rollback perlu restore backup.
- Kalau hanya code change, rollback image/app version.
