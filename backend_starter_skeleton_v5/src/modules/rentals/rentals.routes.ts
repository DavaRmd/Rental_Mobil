import type { FastifyInstance } from 'fastify';
import { AppError, toErrorResponse } from '../../lib/errors.js';
import { CreateRentalSchema, IdParamSchema, ListRentalsQuerySchema } from './rentals.dto.js';
import { createRental, completeRental, cancelRental, listRentals } from './rentals.service.js';

export async function rentalsRoutes(app: FastifyInstance) {
  // Auth required for all rentals routes
  app.addHook('preHandler', async (req) => (app as any).requireAuth(req));

  app.get('/', async (req, reply) => {
    const q = ListRentalsQuerySchema.safeParse(req.query);
    if (!q.success) {
      const err = new AppError(422, 'VALIDATION_ERROR', 'Validasi gagal.', q.error.flatten());
      return reply.status(422).send(toErrorResponse(err));
    }
    const result = await listRentals(q.data as any);
    return reply.send(result);
  });

  app.post('/', async (req, reply) => {
    const parsed = CreateRentalSchema.safeParse(req.body);
    if (!parsed.success) {
      const err = new AppError(422, 'VALIDATION_ERROR', 'Validasi gagal.', parsed.error.flatten());
      return reply.status(422).send(toErrorResponse(err));
    }
    const result = await createRental(req.user!.id, parsed.data);
    return reply.status(201).send(result);
  });

  app.post('/:id/complete', async (req, reply) => {
    const p = IdParamSchema.safeParse(req.params);
    if (!p.success) {
      const err = new AppError(422, 'VALIDATION_ERROR', 'Validasi gagal.', p.error.flatten());
      return reply.status(422).send(toErrorResponse(err));
    }
    const result = await completeRental(req.user!.id, p.data.id);
    return reply.send(result);
  });

  app.post('/:id/cancel', async (req, reply) => {
    const p = IdParamSchema.safeParse(req.params);
    if (!p.success) {
      const err = new AppError(422, 'VALIDATION_ERROR', 'Validasi gagal.', p.error.flatten());
      return reply.status(422).send(toErrorResponse(err));
    }
    const result = await cancelRental(req.user!.id, p.data.id);
    return reply.send(result);
  });
}
