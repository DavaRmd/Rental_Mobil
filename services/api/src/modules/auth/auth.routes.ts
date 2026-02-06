import type { FastifyInstance } from 'fastify';
import { LoginSchema } from './auth.dto.js';
import { login } from './auth.service.js';
import { AppError, toErrorResponse } from '../../lib/errors.js';

export async function authRoutes(app: FastifyInstance) {
  app.post('/login', async (req, reply) => {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      const err = new AppError(422, 'VALIDATION_ERROR', 'Validasi gagal.', parsed.error.flatten());
      return reply.status(422).send(toErrorResponse(err));
    }
    const result = await login(app, parsed.data);
    return reply.send(result);
  });
}
