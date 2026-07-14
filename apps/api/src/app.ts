import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import Fastify from 'fastify';

import { appConfig } from './lib/config.js';
import prismaPlugin from './plugins/prisma.js';
import routes from './routes/index.js';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: appConfig.nodeEnv === 'production' ? 'info' : 'debug',
    },
  });

  await app.register(helmet, {
    global: true,
  });

  await app.register(cors, {
    origin: appConfig.corsOrigin,
  });

  await app.register(sensible);
  await app.register(prismaPlugin);
  await app.register(routes);

  return app;
}
