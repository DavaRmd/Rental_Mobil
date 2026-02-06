import type mysql from 'mysql2/promise';

export async function getSummary(conn: mysql.PoolConnection) {
  const [rows] = await conn.query<any[]>(
    `SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status='AVAILABLE' THEN 1 ELSE 0 END) AS available,
      SUM(CASE WHEN status='RENTED' THEN 1 ELSE 0 END) AS rented,
      SUM(CASE WHEN status='MAINTENANCE' THEN 1 ELSE 0 END) AS maintenance
     FROM vehicles`
  );
  const r = rows[0] || { total: 0, available: 0, rented: 0, maintenance: 0 };
  return {
    total: Number(r.total) || 0,
    available: Number(r.available) || 0,
    rented: Number(r.rented) || 0,
    maintenance: Number(r.maintenance) || 0,
  };
}
