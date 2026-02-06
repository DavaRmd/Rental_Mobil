import type mysql from 'mysql2/promise';

export type DbUser = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'owner';
  created_at: string;
};

export async function findUserByEmail(conn: mysql.PoolConnection, email: string): Promise<DbUser | null> {
  const [rows] = await conn.query<any[]>(
    'SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  return rows.length ? (rows[0] as DbUser) : null;
}
