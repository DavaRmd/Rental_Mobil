import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import helmet from '@fastify/helmet';
import fjwt from '@fastify/jwt';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { parseCorsOrigins } from './lib/cors.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { registerErrorHandler } from './middleware/error.middleware.js';
import { registerAuth } from './middleware/auth.middleware.js';
import { registerRequestId } from './middleware/requestId.middleware.js';
import { registerRoutes } from './routes/index.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger });

  await app.register(helmet);
  await app.register(cors, { origin: parseCorsOrigins() });

  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_TIME_WINDOW_SECONDS * 1000,
  });

  // Swagger: load OpenAPI file from api/openapi.yaml
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const openapiPath = path.resolve(__dirname, '../api/openapi.yaml');
  const openapi = fs.readFileSync(openapiPath, 'utf-8');
  await app.register(swagger, { mode: 'static', specification: { document: openapi as any } as any });
  await app.register(swaggerUI, { routePrefix: '/docs', uiConfig: { docExpansion: 'list' } });

  await app.register(fjwt, { secret: env.JWT_SECRET });
  registerRequestId(app);
  registerAuth(app);
  registerErrorHandler(app);

  await registerRoutes(app);

  app.get('/', async () => ({ status: 'ok', service: 'rental-mobil-backend' }));

  return app;
}
