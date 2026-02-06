# Production Hardening (v4)

Checklist yang diterapkan di v4:
- CORS origin strict via `CORS_ORIGINS` (comma-separated) atau `*` untuk dev
- Rate limit global via `@fastify/rate-limit`
- Swagger UI tersedia di `/docs` untuk inspeksi OpenAPI
- Request ID (`x-request-id`) untuk tracing
- Error handler aman (detail internal hanya di log)
- Readiness probe `/v1/ready` (cek DB), health `/v1/health` (tanpa DB)

Rekomendasi deploy:
- Set `CORS_ORIGINS` ke domain FE admin.
- Gunakan reverse proxy (Nginx) + HTTPS.
- Set `LOG_LEVEL=info` atau `warn` di production.
- Putar `JWT_SECRET` via secret manager.
