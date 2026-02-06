import test from 'node:test';
import assert from 'node:assert/strict';
import { makeClient } from './test_utils.js';

test('POST /v1/auth/login validates body', async () => {
  const app = await makeClient();
  const res = await app.inject({
    method: 'POST',
    url: '/v1/auth/login',
    payload: { email: 'not-email', password: '' },
  });
  assert.equal(res.statusCode, 422);
  const body = res.json();
  assert.equal(body?.error?.code, 'VALIDATION_ERROR');
  await app.close();
});
