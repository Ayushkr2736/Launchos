import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { config as loadEnv } from 'dotenv';

const here = fileURLToPath(new URL('.', import.meta.url));
const candidates = [
  resolve(here, '../../../.env'),
  resolve(process.cwd(), '../../.env'),
  resolve(process.cwd(), '.env'),
];

for (const candidate of candidates) {
  if (existsSync(candidate)) {
    loadEnv({ path: candidate });
    break;
  }
}
