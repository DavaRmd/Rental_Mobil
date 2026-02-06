import type { FastifyInstance } from 'fastify';
import crypto from 'node:crypto';

export function registerRequestId(app: FastifyInstance) {
  app.addHook('onRequest', async (req, reply) => {
    const header = req.headers['x-request-id'];
    const requestId = typeof header === 'string' && header.length ? header : crypto.randomUUID();
    (req as any).requestId = requestId;
    reply.header('x-request-id', requestId);
  });
}

declare module 'fastify' {
  interface FastifyRequest {
    requestId?: string;
  }
}
