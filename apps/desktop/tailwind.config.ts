import sharedConfig from '@launchos/tailwind-config';
import type { Config } from 'tailwindcss';

const config: Config = {
  ...sharedConfig,
  content: ['./index.html', './src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  plugins: [...(sharedConfig.plugins ?? [])],
};

export default config;
