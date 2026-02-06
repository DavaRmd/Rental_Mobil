import type { FastifyInstance, FastifyRequest } from 'fastify';
import { AppError } from '../lib/errors.js';

export type AuthUser = { id: number; role: 'admin' | 'owner' };

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

export function registerAuth(app: FastifyInstance) {
  app.decorate('requireAuth', async (req: FastifyRequest) => {
    try {
      const payload = await req.jwtVerify<{ sub: string; role: 'admin' | 'owner' }>();
      req.user = { id: Number(payload.sub), role: payload.role };
    } catch {
      throw new AppError(401, 'UNAUTHORIZED', 'Token tidak valid atau sudah expired.', null);
    }
  });

  app.decorate('requireRole', (role: 'owner' | 'admin') => async (req: FastifyRequest) => {
    await (app as any).requireAuth(req);
    if (req.user?.role !== role) {
      throw new AppError(403, 'FORBIDDEN', 'Anda tidak memiliki akses.', null);
    }
  });
}

declare module 'fastify' {
  interface FastifyInstance {
    requireAuth: (req: FastifyRequest) => Promise<void>;
    requireRole: (role: 'owner' | 'admin') => (req: FastifyRequest) => Promise<void>;
  }
}
