import healthRoutes from './health.js';

import type { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (app) => {
  await app.register(healthRoutes);
};

export default routes;
