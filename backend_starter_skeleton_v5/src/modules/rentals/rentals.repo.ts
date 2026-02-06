import type mysql from 'mysql2/promise';

export async function lockVehicleForUpdate(conn: mysql.PoolConnection, vehicleId: number) {
  const [rows] = await conn.query<any[]>(
    'SELECT id, status FROM vehicles WHERE id = ? FOR UPDATE',
    [vehicleId]
  );
  return rows.length ? rows[0] : null;
}

export async function insertRental(conn: mysql.PoolConnection, data: {
  vehicle_id: number;
  customer_name: string;
  start_at: string;
  end_at: string;
  created_by: number;
}) {
  const [res] = await conn.query<any>(
    `INSERT INTO rentals(vehicle_id, customer_name, start_at, end_at, status, created_by)
     VALUES(?, ?, ?, ?, 'ACTIVE', ?)`,
    [data.vehicle_id, data.customer_name, data.start_at, data.end_at, data.created_by]
  );
  return { id: Number(res.insertId) };
}

export async function updateRentalStatus(conn: mysql.PoolConnection, id: number, status: 'COMPLETED' | 'CANCELED') {
  const [res] = await conn.query<any>(
    'UPDATE rentals SET status=? WHERE id=? AND status="ACTIVE"',
    [status, id]
  );
  return { affected: Number(res.affectedRows) };
}


export async function listRentals(conn: mysql.PoolConnection | mysql.Pool, params: {
  status?: 'ACTIVE' | 'COMPLETED' | 'CANCELED';
  vehicle_id?: number;
  query?: string;
  start_from?: string;
  start_to?: string;
  limit: number;
  offset: number;
}) {
  const where: string[] = [];
  const values: any[] = [];

  if (params.status) {
    where.push('r.status = ?');
    values.push(params.status);
  }
  if (params.vehicle_id) {
    where.push('r.vehicle_id = ?');
    values.push(params.vehicle_id);
  }
  if (params.query) {
    where.push('(r.customer_name LIKE ? OR v.name LIKE ? OR v.plate_number LIKE ?)');
    const q = `%${params.query}%`;
    values.push(q, q, q);
  }
  if (params.start_from) {
    where.push('r.start_at >= ?');
    values.push(params.start_from);
  }
  if (params.start_to) {
    where.push('r.start_at <= ?');
    values.push(params.start_to);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const sql = `
    SELECT
      r.id,
      r.vehicle_id,
      v.name AS vehicle_name,
      v.plate_number,
      r.customer_name,
      r.start_at,
      r.end_at,
      r.status
    FROM rentals r
    JOIN vehicles v ON v.id = r.vehicle_id
    ${whereSql}
    ORDER BY r.start_at DESC, r.id DESC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await (conn as any).query<any[]>(sql, [...values, params.limit, params.offset]);
  return rows;
}

export async function countRentals(conn: mysql.PoolConnection | mysql.Pool, params: {
  status?: 'ACTIVE' | 'COMPLETED' | 'CANCELED';
  vehicle_id?: number;
  query?: string;
  start_from?: string;
  start_to?: string;
}) {
  const where: string[] = [];
  const values: any[] = [];

  if (params.status) { where.push('r.status = ?'); values.push(params.status); }
  if (params.vehicle_id) { where.push('r.vehicle_id = ?'); values.push(params.vehicle_id); }
  if (params.query) {
    where.push('(r.customer_name LIKE ? OR v.name LIKE ? OR v.plate_number LIKE ?)');
    const q = `%${params.query}%`;
    values.push(q, q, q);
  }
  if (params.start_from) { where.push('r.start_at >= ?'); values.push(params.start_from); }
  if (params.start_to) { where.push('r.start_at <= ?'); values.push(params.start_to); }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const sql = `
    SELECT COUNT(*) AS total
    FROM rentals r
    JOIN vehicles v ON v.id = r.vehicle_id
    ${whereSql}
  `;
  const [rows] = await (conn as any).query<any[]>(sql, values);
  return Number(rows[0]?.total ?? 0);
}
