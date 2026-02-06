import { env } from '../config/env.js';

export function parseCorsOrigins(): string[] | true {
  const raw = env.CORS_ORIGINS.trim();
  if (raw === '*' || raw.length === 0) return true;
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}
