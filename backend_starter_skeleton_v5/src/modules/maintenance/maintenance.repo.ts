import type mysql from 'mysql2/promise';

export type MaintenanceRow = {
  id: number;
  vehicle_id: number;
  description: string;
  start_at: string | null;
  end_at: string | null;
  status: 'ONGOING' | 'DONE';
  created_by: number;
  created_at: string;
  updated_at: string | null;
};

export async function listMaintenance(conn: mysql.PoolConnection, q: {
  status?: string;
  vehicle_id?: number;
  date_from?: string;
  date_to?: string;
  limit: number;
  offset: number;
}) {
  const where: string[] = [];
  const params: any[] = [];

  if (q.status) { where.push('status = ?'); params.push(q.status); }
  if (q.vehicle_id) { where.push('vehicle_id = ?'); params.push(q.vehicle_id); }
  if (q.date_from) { where.push('created_at >= ?'); params.push(q.date_from); }
  if (q.date_to) { where.push('created_at <= ?'); params.push(q.date_to); }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const sql = `SELECT id, vehicle_id, description, start_at, end_at, status, created_by, created_at, updated_at
               FROM maintenance_logs
               ${whereSql}
               ORDER BY created_at DESC
               LIMIT ? OFFSET ?`;
  params.push(q.limit, q.offset);

  const [rows] = await conn.query<any[]>(sql, params);
  return rows as MaintenanceRow[];
}

export async function insertMaintenance(conn: mysql.PoolConnection, data: {
  vehicle_id: number;
  description: string;
  start_at: string | null;
  end_at: string | null;
  created_by: number;
}) {
  const [res] = await conn.query<any>(
    `INSERT INTO maintenance_logs(vehicle_id, description, start_at, end_at, status, created_by)
     VALUES(?, ?, ?, ?, 'ONGOING', ?)`,
    [data.vehicle_id, data.description, data.start_at, data.end_at, data.created_by]
  );
  return { id: Number(res.insertId) };
}

export async function completeMaintenance(conn: mysql.PoolConnection, id: number) {
  const [res] = await conn.query<any>(
    `UPDATE maintenance_logs
     SET status='DONE', end_at = COALESCE(end_at, UTC_TIMESTAMP())
     WHERE id = ? AND status='ONGOING'`,
    [id]
  );
  return { affected: Number(res.affectedRows) };
}
