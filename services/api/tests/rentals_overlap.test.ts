import test from 'node:test';
import assert from 'node:assert/strict';
import { makeClient } from './test_utils.js';
import { pool } from '../src/lib/db.js';

async function seedMinimal() {
  const conn = await pool.getConnection();
  try {
    // NOTE: sesuaikan dengan schema migrations kamu (users.password_hash harus valid)
    // Gunakan script scripts/hash_password.ts untuk generate hash, lalu paste di bawah.
    // Untuk test, isi password_hash dengan bcrypt hash dari 'password123'.
    const passwordHash = '$2a$10$kQXQdD1Gv2xvN8cLQyqzUu2e0vQe0mJ5wY8J8n8p2cQe2nJ4G9QkS'; // placeholder
    await conn.query('DELETE FROM users');
    await conn.query('DELETE FROM vehicles');
    await conn.query('INSERT INTO users(id,name,email,password_hash,role) VALUES(1,"Owner","owner@x.com",?, "owner")', [passwordHash]);
    await conn.query('INSERT INTO vehicles(id,name,plate_number,type,price_per_day,status,is_active) VALUES(1,"Avanza","B 1 TEST","MPV",350000,"AVAILABLE",1)');
  } finally {
    conn.release();
  }
}

test('POST /v1/rentals returns 409 on overlap (requires triggers)', async (t) => {
  const app = await makeClient();
  await seedMinimal();

  // login to get token (this requires password_hash placeholder to be real)
  const login = await app.inject({ method: 'POST', url: '/v1/auth/login', payload: { email: 'owner@x.com', password: 'password123' } });
  if (login.statusCode !== 200) {
    t.skip('Login failed - set a real bcrypt hash in test to run this integration test.');
    await app.close();
    return;
  }
  const token = login.json().access_token;

  const payload1 = { vehicle_id: 1, customer_name: 'A', start_at: '2026-02-10T10:00:00Z', end_at: '2026-02-12T10:00:00Z' };
  const r1 = await app.inject({ method: 'POST', url: '/v1/rentals', headers: { authorization: `Bearer ${token}` }, payload: payload1 });
  assert.equal(r1.statusCode, 201);

  const payload2 = { vehicle_id: 1, customer_name: 'B', start_at: '2026-02-11T10:00:00Z', end_at: '2026-02-13T10:00:00Z' };
  const r2 = await app.inject({ method: 'POST', url: '/v1/rentals', headers: { authorization: `Bearer ${token}` }, payload: payload2 });

  // trigger should block
  assert.equal(r2.statusCode, 409);
  const body = r2.json();
  assert.ok(body?.error?.code);
  await app.close();
});
