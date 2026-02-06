import type { FastifyInstance } from 'fastify';
import { AppError, toErrorResponse } from '../../lib/errors.js';
import { AuditListQuerySchema } from './audit.dto.js';
import { getAuditLogs } from './audit.service.js';

export async function auditRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (req) => (app as any).requireAuth(req));

  app.get('/', async (req, reply) => {
    const parsed = AuditListQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      const err = new AppError(422, 'VALIDATION_ERROR', 'Validasi gagal.', parsed.error.flatten());
      return reply.status(422).send(toErrorResponse(err));
    }
    const result = await getAuditLogs(parsed.data);
    return reply.send(result);
  });
}
