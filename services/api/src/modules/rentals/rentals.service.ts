import { pool, withTransaction } from '../../lib/db.js';
import { AppError } from '../../lib/errors.js';
import { CreateRentalInput } from './rentals.dto.js';
import { insertRental, lockVehicleForUpdate, updateRentalStatus, listRentals as repoListRentals, countRentals } from './rentals.repo.js';

export async function createRental(userId: number, input: CreateRentalInput) {
  if (input.end_at <= input.start_at) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Validasi gagal.', { field: 'end_at', reason: 'must be after start_at' });
  }

  return withTransaction(async (conn) => {
    const v = await lockVehicleForUpdate(conn, input.vehicle_id);
    if (!v) throw new AppError(404, 'NOT_FOUND', 'Kendaraan tidak ditemukan.', null);

    // Optional fast UX validation (trigger is source of truth)
    if (v.status !== 'AVAILABLE') {
      throw new AppError(409, 'VEHICLE_NOT_AVAILABLE', 'Status kendaraan tidak AVAILABLE.', null);
    }

    const created = await insertRental(conn, { ...input, created_by: userId });
    return { id: created.id };
  });
}

export async function completeRental(userId: number, id: number) {
  // userId kept for future audit, triggers already log status change using created_by in schema,
  // for MVP we keep semantics simple.
  return withTransaction(async (conn) => {
    const r = await updateRentalStatus(conn, id, 'COMPLETED');
    if (r.affected === 0) throw new AppError(404, 'NOT_FOUND', 'Rental tidak ditemukan atau tidak ACTIVE.', null);
    return { ok: true };
  });
}

export async function cancelRental(userId: number, id: number) {
  return withTransaction(async (conn) => {
    const r = await updateRentalStatus(conn, id, 'CANCELED');
    if (r.affected === 0) throw new AppError(404, 'NOT_FOUND', 'Rental tidak ditemukan atau tidak ACTIVE.', null);
    return { ok: true };
  });
}


export async function listRentals(input: {
  status?: 'ACTIVE' | 'COMPLETED' | 'CANCELED';
  vehicle_id?: number;
  query?: string;
  start_from?: string;
  start_to?: string;
  limit: number;
  offset: number;
}) {
  const [data, total] = await Promise.all([
    repoListRentals(pool as any, input),
    countRentals(pool as any, input),
  ]);
  return { data, total, limit: input.limit, offset: input.offset };
}
