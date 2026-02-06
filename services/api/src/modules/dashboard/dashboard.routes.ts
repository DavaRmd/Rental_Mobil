import type { FastifyInstance } from 'fastify';
import { getDashboardSummary } from './dashboard.service.js';

export async function dashboardRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (req) => (app as any).requireAuth(req));
  app.get('/summary', async () => getDashboardSummary());
}
