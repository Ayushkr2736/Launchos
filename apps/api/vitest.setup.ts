process.env['DATABASE_URL'] ??=
  'postgresql://launchos:launchos@localhost:5432/launchos?schema=public';
process.env['API_PORT'] ??= '3001';
process.env['NODE_ENV'] ??= 'test';
