import type { FastifyInstance } from 'fastify';
import { AppError, toErrorResponse } from '../../lib/errors.js';
import { CreateVehicleSchema, IdParamSchema, PatchVehicleStatusSchema, UpdateVehicleSchema, VehicleListQuerySchema } from './vehicles.dto.js';
import { createVehicle, getVehicle, getVehicles, patchVehicleById, updateVehicleById } from './vehicles.service.js';

export async function vehiclesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (req) => (app as any).requireAuth(req));

  app.get('/', async (req, reply) => {
    const parsed = VehicleListQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      const err = new AppError(422, 'VALIDATION_ERROR', 'Validasi gagal.', parsed.error.flatten());
      return reply.status(422).send(toErrorResponse(err));
    }
    const result = await getVehicles(parsed.data);
    return reply.send(result);
  });

  app.post('/', async (req, reply) => {
    const parsed = CreateVehicleSchema.safeParse(req.body);
    if (!parsed.success) {
      const err = new AppError(422, 'VALIDATION_ERROR', 'Validasi gagal.', parsed.error.flatten());
      return reply.status(422).send(toErrorResponse(err));
    }
    const created = await createVehicle(req.user!.id, parsed.data);
    return reply.status(201).send(created);
  });

  app.get('/:id', async (req, reply) => {
    const p = IdParamSchema.safeParse(req.params);
    if (!p.success) {
      const err = new AppError(422, 'VALIDATION_ERROR', 'Validasi gagal.', p.error.flatten());
      return reply.status(422).send(toErrorResponse(err));
    }
    const v = await getVehicle(p.data.id);
    return reply.send(v);
  });

  app.put('/:id', async (req, reply) => {
    const p = IdParamSchema.safeParse(req.params);
    if (!p.success) {
      const err = new AppError(422, 'VALIDATION_ERROR', 'Validasi gagal.', p.error.flatten());
      return reply.status(422).send(toErrorResponse(err));
    }
    const parsed = UpdateVehicleSchema.safeParse(req.body);
    if (!parsed.success) {
      const err = new AppError(422, 'VALIDATION_ERROR', 'Validasi gagal.', parsed.error.flatten());
      return reply.status(422).send(toErrorResponse(err));
    }
    const result = await updateVehicleById(req.user!.id, p.data.id, parsed.data);
    return reply.send(result);
  });

  // Owner-only: manual patch status / is_active (optional feature but implemented)
  app.patch('/:id/status', { preHandler: async (req) => (app as any).requireRole('owner')(req) }, async (req, reply) => {
    const p = IdParamSchema.safeParse(req.params);
    if (!p.success) {
      const err = new AppError(422, 'VALIDATION_ERROR', 'Validasi gagal.', p.error.flatten());
      return reply.status(422).send(toErrorResponse(err));
    }
    const parsed = PatchVehicleStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      const err = new AppError(422, 'VALIDATION_ERROR', 'Validasi gagal.', parsed.error.flatten());
      return reply.status(422).send(toErrorResponse(err));
    }
    const result = await patchVehicleById(req.user!.id, p.data.id, parsed.data);
    return reply.send(result);
  });
}
