import { z } from 'zod';

export const MaintenanceStatusEnum = z.enum(['ONGOING', 'DONE']);

export const MaintenanceListQuerySchema = z.object({
  status: MaintenanceStatusEnum.optional(),
  vehicle_id: z.coerce.number().int().positive().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const CreateMaintenanceSchema = z.object({
  vehicle_id: z.coerce.number().int().positive(),
  description: z.string().min(2).max(255),
  start_at: z.string().datetime().optional(),
  end_at: z.string().datetime().optional(),
});

export const IdParamSchema = z.object({ id: z.coerce.number().int().positive() });

export type MaintenanceListQuery = z.infer<typeof MaintenanceListQuerySchema>;
export type CreateMaintenanceInput = z.infer<typeof CreateMaintenanceSchema>;
