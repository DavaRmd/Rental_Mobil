import { z } from 'zod';

export const CreateRentalSchema = z.object({
  vehicle_id: z.coerce.number().int().positive(),
  customer_name: z.string().min(2).max(120),
  start_at: z.string().datetime(),
  end_at: z.string().datetime(),
});

export type CreateRentalInput = z.infer<typeof CreateRentalSchema>;

export const IdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});


export const RentalStatusEnum = z.enum(['ACTIVE', 'COMPLETED', 'CANCELED']);

export const ListRentalsQuerySchema = z.object({
  status: RentalStatusEnum.optional(),
  vehicle_id: z.coerce.number().int().positive().optional(),
  query: z.string().min(1).max(100).optional(),
  start_from: z.string().datetime().optional(),
  start_to: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type ListRentalsQuery = z.infer<typeof ListRentalsQuerySchema>;
