import { pool } from '../../lib/db.js';
import { getSummary } from './dashboard.repo.js';

export async function getDashboardSummary() {
  const conn = await pool.getConnection();
  try {
    return await getSummary(conn);
  } finally {
    conn.release();
  }
}
