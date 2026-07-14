import sharedConfig from '@launchos/tailwind-config';
import type { Config } from 'tailwindcss';

const config: Config = {
  ...sharedConfig,
  content: ['./src/**/*.{ts,tsx}'],
  plugins: [...(sharedConfig.plugins ?? [])],
};

export default config;
