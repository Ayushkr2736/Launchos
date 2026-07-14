# LaunchOS

Production foundation for a desktop AI operating system — extensible multi-agent shell, Fastify control plane, and shared design system.

## Stack

| Concern       | Choice                                       |
| ------------- | -------------------------------------------- |
| Monorepo      | Turborepo + pnpm                             |
| Desktop       | Tauri 2 + React + Vite                       |
| API           | Node.js + Fastify                            |
| Database      | PostgreSQL + Prisma                          |
| State         | Zustand                                      |
| Data fetching | TanStack Query                               |
| UI            | Tailwind CSS + shadcn/ui                     |
| Quality       | ESLint, Prettier, Husky, lint-staged, Vitest |

## Quick start

```bash
cp .env.example .env
pnpm install
pnpm docker:up
pnpm db:generate
pnpm db:push
pnpm dev:api
```

Desktop (requires [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)):

```bash
pnpm --filter @launchos/desktop tauri:dev
```

## Workspace layout

```text
apps/
  desktop/     Tauri + React shell
  api/         Fastify + Prisma API
packages/
  ui/          shadcn/ui component library
  types/       Shared domain & API contracts
  config/      ESLint, TypeScript, Tailwind presets
  utils/       Shared pure utilities
services/      Future agent runtimes & workers
docs/          Architecture & onboarding
docker/        Compose + API image
```

## Scripts

| Command            | Description                     |
| ------------------ | ------------------------------- |
| `pnpm dev`         | Run all `dev` tasks via Turbo   |
| `pnpm dev:api`     | API only                        |
| `pnpm dev:desktop` | Vite UI only                    |
| `pnpm build`       | Build all packages/apps         |
| `pnpm lint`        | ESLint across the workspace     |
| `pnpm typecheck`   | Strict TypeScript checks        |
| `pnpm test`        | Vitest across the workspace     |
| `pnpm format`      | Prettier write                  |
| `pnpm docker:up`   | Start Postgres (+ optional API) |
| `pnpm db:generate` | Prisma client generate          |
| `pnpm db:push`     | Push Prisma schema to DB        |
| `pnpm db:migrate`  | Run Prisma migrations           |
| `pnpm db:studio`   | Open Prisma Studio              |

## Documentation

- [Getting started](docs/getting-started.md)
- [Architecture](docs/architecture.md)

## License

UNLICENSED — private project.
