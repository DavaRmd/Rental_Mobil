import { pool } from '../../lib/db.js';
import { listAuditLogs } from './audit.repo.js';
import type { AuditListQuery } from './audit.dto.js';

export async function getAuditLogs(q: AuditListQuery) {
  const conn = await pool.getConnection();
  try {
    const data = await listAuditLogs(conn, q);
    return { data, limit: q.limit, offset: q.offset };
  } finally {
    conn.release();
  }
}
