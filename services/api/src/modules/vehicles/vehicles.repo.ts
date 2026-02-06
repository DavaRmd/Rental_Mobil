import type mysql from 'mysql2/promise';

export type VehicleRow = {
  id: number;
  name: string;
  plate_number: string;
  type: string;
  price_per_day: number;
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'INACTIVE';
  is_active: 0 | 1;
  created_at: string;
  updated_at: string | null;
};

export async function listVehicles(conn: mysql.PoolConnection, q: {
  status?: string;
  is_active?: boolean;
  query?: string;
  limit: number;
  offset: number;
}) {
  const where: string[] = [];
  const params: any[] = [];

  if (q.status) { where.push('status = ?'); params.push(q.status); }
  if (q.is_active !== undefined) { where.push('is_active = ?'); params
params.push(q.is_active ? 1 : 0); }
  if (q.query) { where.push('(name LIKE ? OR plate_number LIKE ?)'); params.push(`%${q.query}%`, `%${q.query}%`); }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const sql = `SELECT id, name, plate_number, type, price_per_day, status, is_active, created_at, updated_at
               FROM vehicles
               ${whereSql}
               ORDER BY id DESC
               LIMIT ? OFFSET ?`;
  params.push(q.limit, q.offset);

  const [rows] = await conn.query<any[]>(sql, params);
  return rows as VehicleRow[];
}

export async function getVehicleById(conn: mysql.PoolConnection, id: number): Promise<VehicleRow | null> {
  const [rows] = await conn.query<any[]>(
    `SELECT id, name, plate_number, type, price_per_day, status, is_active, created_at, updated_at
     FROM vehicles WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows.length ? (rows[0] as VehicleRow) : null;
}

export async function insertVehicle(conn: mysql.PoolConnection, data: {
  name: string; plate_number: string; type: string; price_per_day: number; is_active: boolean;
}) {
  const [res] = await conn.query<any>(
    `INSERT INTO vehicles(name, plate_number, type, price_per_day, status, is_active)
     VALUES(?, ?, ?, ?, 'AVAILABLE', ?)`,
    [data.name, data.plate_number, data.type, data.price_per_day, data.is_active ? 1 : 0]
  );
  return { id: Number(res.insertId) };
}

export async function updateVehicle(conn: mysql.PoolConnection, id: number, data: any) {
  const fields: string[] = [];
  const params: any[] = [];
  const allowed = ['name','plate_number','type','price_per_day','is_active'];

  for (const k of allowed) {
    if (data[k] !== undefined) {
      fields.push(`${k} = ?`);
      params.push(k === 'is_active' ? (data[k] ? 1 : 0) : data[k]);
    }
  }
  if (!fields.length) return { affected: 0 };

  params.push(id);
  const [res] = await conn.query<any>(`UPDATE vehicles SET ${fields.join(', ')} WHERE id = ?`, params);
  return { affected: Number(res.affectedRows) };
}

export async function patchVehicleStatus(conn: mysql.PoolConnection, id: number, data: { status?: string; is_active?: boolean }) {
  const fields: string[] = [];
  const params: any[] = [];
  if (data.status !== undefined) { fields.push('status = ?'); params.push(data.status); }
  if (data.is_active !== undefined) { fields.push('is_active = ?'); params.push(data.is_active ? 1 : 0); }
  if (!fields.length) return { affected: 0 };
  params.push(id);
  const [res] = await conn.query<any>(`UPDATE vehicles SET ${fields.join(', ')} WHERE id = ?`, params);
  return { affected: Number(res.affectedRows) };
}
