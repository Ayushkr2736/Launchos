import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig, type ServerOptions } from 'vite';

const host = process.env['TAURI_DEV_HOST'];

const server: ServerOptions = {
  port: 1420,
  strictPort: true,
  host: host ?? false,
  watch: {
    ignored: ['**/src-tauri/**'],
  },
};

if (host) {
  server.hmr = {
    protocol: 'ws',
    host,
    port: 1421,
  };
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      {
        find: /^@launchos\/ui$/,
        replacement: path.resolve(__dirname, '../../packages/ui/src/index.ts'),
      },
      {
        find: /^@launchos\/types$/,
        replacement: path.resolve(__dirname, '../../packages/types/src/index.ts'),
      },
      {
        find: /^@launchos\/utils$/,
        replacement: path.resolve(__dirname, '../../packages/utils/src/index.ts'),
      },
    ],
  },
  clearScreen: false,
  server,
  envPrefix: ['VITE_', 'TAURI_'],
  optimizeDeps: {
    include: ['monaco-editor', '@monaco-editor/react'],
  },
  worker: {
    format: 'es',
  },
  build: {
    target: process.env['TAURI_ENV_PLATFORM'] === 'windows' ? 'chrome105' : 'safari13',
    minify: !process.env['TAURI_ENV_DEBUG'] ? 'esbuild' : false,
    sourcemap: Boolean(process.env['TAURI_ENV_DEBUG']),
  },
});
