import './load-env.js';

import { env, requireEnv } from '@launchos/utils';

export const appConfig = {
  nodeEnv: env('NODE_ENV', 'development'),
  host: env('API_HOST', '0.0.0.0'),
  port: Number(env('API_PORT', '3001')),
  corsOrigin: env('API_CORS_ORIGIN', 'http://localhost:1420'),
  databaseUrl: requireEnv('DATABASE_URL'),
  version: env('npm_package_version', '0.1.0'),
  serviceName: 'launchos-api',
} as const;

export type AppConfig = typeof appConfig;
