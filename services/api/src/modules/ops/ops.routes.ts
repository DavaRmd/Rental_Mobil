import type { FastifyInstance } from 'fastify';
import { pool } from '../../lib/db.js';
import { AppError, toErrorResponse } from '../../lib/errors.js';

export async function opsRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({ status: 'ok' }));

  app.get('/ready', async (_req, reply) => {
    try {
      const conn = await pool.getConnection();
      try {
        await conn.query('SELECT 1 AS ok');
      } finally {
        conn.release();
      }
      return { status: 'ok', db: 'ok' };
    } catch {
      const err = new AppError(503, 'SERVICE_UNAVAILABLE', 'Service belum siap (DB tidak dapat diakses).', null);
      return reply.status(503).send(toErrorResponse(err));
    }
  });
}
