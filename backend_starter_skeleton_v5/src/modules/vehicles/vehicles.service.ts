import { withTransaction, pool } from '../../lib/db.js';
import { AppError } from '../../lib/errors.js';
import { insertAuditLog } from '../auditLogs/audit.repo.js';
import type { CreateVehicleInput, UpdateVehicleInput, VehicleListQuery, PatchVehicleStatusInput } from './vehicles.dto.js';
import { getVehicleById, insertVehicle, listVehicles, patchVehicleStatus, updateVehicle } from './vehicles.repo.js';

export async function getVehicles(q: VehicleListQuery) {
  const conn = await pool.getConnection();
  try {
    const data = await listVehicles(conn, q);
    return { data, limit: q.limit, offset: q.offset };
  } finally {
    conn.release();
  }
}

export async function getVehicle(id: number) {
  const conn = await pool.getConnection();
  try {
    const v = await getVehicleById(conn, id);
    if (!v) throw new AppError(404, 'NOT_FOUND', 'Kendaraan tidak ditemukan.', null);
    return v;
  } finally {
    conn.release();
  }
}

export async function createVehicle(userId: number, input: CreateVehicleInput) {
  return withTransaction(async (conn) => {
    const created = await insertVehicle(conn, input);
    await insertAuditLog(conn, { entity_type: 'vehicle', entity_id: created.id, action: 'CREATE', performed_by: userId, message: 'Vehicle created' });
    return { id: created.id };
  });
}

export async function updateVehicleById(userId: number, id: number, input: UpdateVehicleInput) {
  return withTransaction(async (conn) => {
    const existing = await getVehicleById(conn, id);
    if (!existing) throw new AppError(404, 'NOT_FOUND', 'Kendaraan tidak ditemukan.', null);
    const r = await updateVehicle(conn, id, input);
    if (r.affected === 0) throw new AppError(400, 'BAD_REQUEST', 'Tidak ada perubahan.', null);
    await insertAuditLog(conn, { entity_type: 'vehicle', entity_id: id, action: 'UPDATE', performed_by: userId, message: 'Vehicle updated' });
    return { ok: true };
  });
}

export async function patchVehicleById(userId: number, id: number, input: PatchVehicleStatusInput) {
  return withTransaction(async (conn) => {
    const existing = await getVehicleById(conn, id);
    if (!existing) throw new AppError(404, 'NOT_FOUND', 'Kendaraan tidak ditemukan.', null);
    const r = await patchVehicleStatus(conn, id, input);
    if (r.affected === 0) throw new AppError(400, 'BAD_REQUEST', 'Tidak ada perubahan.', null);
    await insertAuditLog(conn, { entity_type: 'vehicle', entity_id: id, action: 'UPDATE_STATUS', performed_by: userId, message: 'Vehicle status/is_active changed' });
    return { ok: true };
  });
}
