export function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function env(name: string, fallback: string): string {
  const value = process.env[name];
  if (value === undefined || value.length === 0) {
    return fallback;
  }
  return value;
}
