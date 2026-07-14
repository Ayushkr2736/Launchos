import { buildApp } from './app.js';
import { appConfig } from './lib/config.js';

async function main(): Promise<void> {
  const app = await buildApp();

  try {
    await app.listen({
      host: appConfig.host,
      port: appConfig.port,
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void main();
