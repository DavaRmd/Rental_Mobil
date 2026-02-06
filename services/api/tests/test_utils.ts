import { buildApp } from '../src/app.js';

export async function makeClient() {
  const app = await buildApp();
  await app.ready();
  return app;
}
