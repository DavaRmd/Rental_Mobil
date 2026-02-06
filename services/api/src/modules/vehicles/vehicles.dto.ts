import { z } from 'zod';

export const VehicleStatusEnum = z.enum(['AVAILABLE', 'RENTED', 'MAINTENANCE', 'INACTIVE']);

export const VehicleListQuerySchema = z.object({
  status: VehicleStatusEnum.optional(),
  is_active: z.coerce.boolean().optional(),
  query: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const CreateVehicleSchema = z.object({
  name: z.string().min(2).max(120),
  plate_number: z.string().min(3).max(32),
  type: z.string().min(2).max(60),
  price_per_day: z.coerce.number().int().min(0),
  is_active: z.coerce.boolean().default(true),
});

export const UpdateVehicleSchema = CreateVehicleSchema.partial().refine((v) => Object.keys(v).length > 0, {
  message: 'At least one field required',
});

export const PatchVehicleStatusSchema = z.object({
  status: VehicleStatusEnum.optional(),
  is_active: z.coerce.boolean().optional(),
}).refine((v) => v.status !== undefined || v.is_active !== undefined, { message: 'status or is_active required' });

export const IdParamSchema = z.object({ id: z.coerce.number().int().positive() });

export type VehicleListQuery = z.infer<typeof VehicleListQuerySchema>;
export type CreateVehicleInput = z.infer<typeof CreateVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof UpdateVehicleSchema>;
export type PatchVehicleStatusInput = z.infer<typeof PatchVehicleStatusSchema>;
