import type { FastifyInstance } from 'fastify';
import { AppError, toErrorResponse, parseTriggerMessage } from '../lib/errors.js';

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((err, _req, reply) => {
    // MySQL trigger errors: SQLSTATE 45000
    const anyErr = err as any;
    const sqlState = anyErr?.sqlState || anyErr?.code; // mysql2 varies
    const msg = anyErr?.message || 'Internal error';

    if (sqlState === '45000') {
      const parsed = parseTriggerMessage(msg);
      const appErr = new AppError(409, parsed.code, parsed.message, null);
      return reply.status(appErr.httpStatus).send(toErrorResponse(appErr));
    }

    if (err instanceof AppError) {
      return reply.status(err.httpStatus).send(toErrorResponse(err));
    }

    // fallback
    app.log.error({ err }, 'Unhandled error');
    const appErr = new AppError(500, 'INTERNAL_ERROR', 'Terjadi kesalahan pada server.', null);
    return reply.status(500).send(toErrorResponse(appErr));
  });
}
