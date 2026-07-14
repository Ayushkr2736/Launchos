import { describe, expect, it } from 'vitest';

import { appConfig } from './config.js';

describe('appConfig', () => {
  it('exposes the service name', () => {
    expect(appConfig.serviceName).toBe('launchos-api');
  });

  it('parses API_PORT as a number', () => {
    expect(typeof appConfig.port).toBe('number');
    expect(Number.isFinite(appConfig.port)).toBe(true);
  });
});
