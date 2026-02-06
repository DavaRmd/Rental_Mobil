import type { FastifyInstance } from 'fastify';
import { AppError, toErrorResponse } from '../../lib/errors.js';
import { CreateMaintenanceSchema, IdParamSchema, MaintenanceListQuerySchema } from './maintenance.dto.js';
import { completeMaintenanceById, createMaintenance, getMaintenance } from './maintenance.service.js';

export async function maintenanceRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (req) => (app as any).requireAuth(req));

  app.get('/', async (req, reply) => {
    const parsed = MaintenanceListQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      const err = new AppError(422, 'VALIDATION_ERROR', 'Validasi gagal.', parsed.error.flatten());
      return reply.status(422).send(toErrorResponse(err));
    }
    const result = await getMaintenance(parsed.data);
    return reply.send(result);
  });

  app.post('/', async (req, reply) => {
    const parsed = CreateMaintenanceSchema.safeParse(req.body);
    if (!parsed.success) {
      const err = new AppError(422, 'VALIDATION_ERROR', 'Validasi gagal.', parsed.error.flatten());
      return reply.status(422).send(toErrorResponse(err));
    }
    const created = await createMaintenance(req.user!.id, parsed.data);
    return reply.status(201).send(created);
  });

  app.post('/:id/complete', async (req, reply) => {
    const p = IdParamSchema.safeParse(req.params);
    if (!p.success) {
      const err = new AppError(422, 'VALIDATION_ERROR', 'Validasi gagal.', p.error.flatten());
      return reply.status(422).send(toErrorResponse(err));
    }
    const result = await completeMaintenanceById(req.user!.id, p.data.id);
    return reply.send(result);
  });
}
