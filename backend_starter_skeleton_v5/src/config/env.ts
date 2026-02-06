import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  APP_ENV: z.string().default('dev'),
  PORT: z.coerce.number().default(8080),

  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().default(3306),
  DB_NAME: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),

  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN_HOURS: z.coerce.number().default(12),
  LOG_LEVEL: z.string().default('info'),

  CORS_ORIGINS: z.string().default('*'),
  RATE_LIMIT_MAX: z.coerce.number().default(200),
  RATE_LIMIT_TIME_WINDOW_SECONDS: z.coerce.number().default(60),
});

export const env = EnvSchema.parse(process.env);
