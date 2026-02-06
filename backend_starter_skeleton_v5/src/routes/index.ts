import type { FastifyInstance } from 'fastify';
import { opsRoutes } from '../modules/ops/ops.routes.js';
import { authRoutes } from '../modules/auth/auth.routes.js';
import { rentalsRoutes } from '../modules/rentals/rentals.routes.js';
import { vehiclesRoutes } from '../modules/vehicles/vehicles.routes.js';
import { maintenanceRoutes } from '../modules/maintenance/maintenance.routes.js';
import { dashboardRoutes } from '../modules/dashboard/dashboard.routes.js';
import { auditRoutes } from '../modules/auditLogs/audit.routes.js';

export async function registerRoutes(app: FastifyInstance) {
  await app.register(opsRoutes, { prefix: '/v1' });
  await app.register(authRoutes, { prefix: '/v1/auth' });
  await app.register(rentalsRoutes, { prefix: '/v1/rentals' });
  await app.register(vehiclesRoutes, { prefix: '/v1/vehicles' });
  await app.register(maintenanceRoutes, { prefix: '/v1/maintenance' });
  await app.register(dashboardRoutes, { prefix: '/v1/dashboard' });
  await app.register(auditRoutes, { prefix: '/v1/audit-logs' });
}
