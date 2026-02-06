import type mysql from 'mysql2/promise';

export type AuditLogRow = {
  id: number;
  entity_type: string;
  entity_id: number;
  action: string;
  performed_by: number;
  message: string;
  created_at: string;
};

export async function insertAuditLog(conn: mysql.PoolConnection, data: {
  entity_type: string;
  entity_id: number;
  action: string;
  performed_by: number;
  message: string;
}) {
  await conn.query(
    `INSERT INTO audit_logs(entity_type, entity_id, action, performed_by, message)
     VALUES(?, ?, ?, ?, ?)`,
    [data.entity_type, data.entity_id, data.action, data.performed_by, data.message]
  );
}

export async function listAuditLogs(conn: mysql.PoolConnection, q: {
  entity_type?: string;
  entity_id?: number;
  user_id?: number;
  date_from?: string;
  date_to?: string;
  limit: number;
  offset: number;
}) {
  const where: string[] = [];
  const params: any[] = [];

  if (q.entity_type) { where.push('entity_type = ?'); params.push(q.entity_type); }
  if (q.entity_id) { where.push('entity_id = ?'); params.push(q.entity_id); }
  if (q.user_id) { where.push('performed_by = ?'); params.push(q.user_id); }
  if (q.date_from) { where.push('created_at >= ?'); params.push(q.date_from); }
  if (q.date_to) { where.push('created_at <= ?'); params.push(q.date_to); }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const sql = `SELECT id, entity_type, entity_id, action, performed_by, message, created_at
               FROM audit_logs
               ${whereSql}
               ORDER BY created_at DESC
               LIMIT ? OFFSET ?`;
  params.push(q.limit, q.offset);

  const [rows] = await conn.query<any[]>(sql, params);
  return rows as AuditLogRow[];
}
