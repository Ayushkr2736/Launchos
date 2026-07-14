import { appConfig } from '../lib/config.js';

import type { HealthStatus } from '@launchos/types';
import type { FastifyPluginAsync } from 'fastify';

const startedAt = Date.now();

const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async (_request, reply) => {
    let database: 'ok' | 'fail' = 'ok';

    try {
      await app.prisma.$queryRaw`SELECT 1`;
    } catch {
      database = 'fail';
    }

    const status: HealthStatus['status'] = database === 'ok' ? 'ok' : 'degraded';

    const body: HealthStatus = {
      status,
      service: appConfig.serviceName,
      version: appConfig.version,
      uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
      timestamp: new Date().toISOString(),
      checks: {
        database,
      },
    };

    const code = status === 'ok' ? 200 : 503;
    return reply.code(code).send(body);
  });
};

export default healthRoutes;
