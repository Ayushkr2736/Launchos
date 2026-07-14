import fp from 'fastify-plugin';

import { prisma } from '../lib/prisma.js';

import type { PrismaClient } from '@prisma/client';
import type { FastifyPluginAsync } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

const prismaPlugin: FastifyPluginAsync = async (app) => {
  app.decorate('prisma', prisma);

  app.addHook('onClose', async () => {
    await app.prisma.$disconnect();
  });
};

export default fp(prismaPlugin, {
  name: 'prisma',
});
