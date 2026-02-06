import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { pool } from '../../lib/db.js';
import { AppError } from '../../lib/errors.js';
import { LoginInput } from './auth.dto.js';
import { findUserByEmail } from './auth.repo.js';
import { env } from '../../config/env.js';

export async function login(app: FastifyInstance, input: LoginInput) {
  const conn = await pool.getConnection();
  try {
    const user = await findUserByEmail(conn, input.email);
    if (!user) throw new AppError(401, 'UNAUTHORIZED', 'Email atau password salah.', null);

    const ok = await bcrypt.compare(input.password, user.password_hash);
    if (!ok) throw new AppError(401, 'UNAUTHORIZED', 'Email atau password salah.', null);

    const token = app.jwt.sign(
      { role: user.role },
      { subject: String(user.id), expiresIn: `${env.JWT_EXPIRES_IN_HOURS}h` }
    );

    return {
      access_token: token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, created_at: user.created_at },
    };
  } finally {
    conn.release();
  }
}
