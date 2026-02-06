# OpenAPI Sync Note
Endpoint yang diimplementasikan perlu disinkronkan dengan file `api/openapi.yaml` dari Production Pack.

Checklist:
- Schema request/response sesuai OpenAPI (fields, types, required).
- Error responses (401/403/404/409/422/500/503) tercantum + example.
- Pagination response konsisten: `{ data, limit, offset }`.
- Timestamp selalu ISO-8601 UTC (suffix Z).
