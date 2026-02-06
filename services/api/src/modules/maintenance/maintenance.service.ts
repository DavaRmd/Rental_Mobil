import { pool, withTransaction } from '../../lib/db.js';
import { AppError } from '../../lib/errors.js';
import { insertAuditLog } from '../auditLogs/audit.repo.js';
import type { CreateMaintenanceInput, MaintenanceListQuery } from './maintenance.dto.js';
import { completeMaintenance, insertMaintenance, listMaintenance } from './maintenance.repo.js';

export async function getMaintenance(q: MaintenanceListQuery) {
  const conn = await pool.getConnection();
  try {
    const data = await listMaintenance(conn, q);
    return { data, limit: q.limit, offset: q.offset };
  } finally {
    conn.release();
  }
}

export async function createMaintenance(userId: number, input: CreateMaintenanceInput) {
  return withTransaction(async (conn) => {
    const created = await insertMaintenance(conn, {
      vehicle_id: input.vehicle_id,
      description: input.description,
      start_at: input.start_at ?? null,
      end_at: input.end_at ?? null,
      created_by: userId,
    });
    await insertAuditLog(conn, { entity_type: 'maintenance', entity_id: created.id, action: 'CREATE', performed_by: userId, message: 'Maintenance created' });
    return { id: created.id };
  });
}

export async function completeMaintenanceById(userId: number, id: number) {
  return withTransaction(async (conn) => {
    const r = await completeMaintenance(conn, id);
    if (r.affected === 0) throw new AppError(404, 'NOT_FOUND', 'Maintenance tidak ditemukan atau tidak ONGOING.', null);
    await insertAuditLog(conn, { entity_type: 'maintenance', entity_id: id, action: 'COMPLETE', performed_by: userId, message: 'Maintenance completed' });
    return { ok: true };
  });
}
