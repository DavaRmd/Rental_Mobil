import { z } from 'zod';

export const AuditListQuerySchema = z.object({
  entity_type: z.string().optional(),
  entity_id: z.coerce.number().int().positive().optional(),
  user_id: z.coerce.number().int().positive().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(200),
  offset: z.coerce.number().int().min(0).default(0),
});

export type AuditListQuery = z.infer<typeof AuditListQuerySchema>;
