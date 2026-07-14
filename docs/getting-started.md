# Getting Started

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (PostgreSQL)
- Rust + system deps for Tauri ([Tauri prerequisites](https://v2.tauri.app/start/prerequisites/))

## Bootstrap

```bash
cp .env.example .env
pnpm install
pnpm docker:up
pnpm db:generate
pnpm db:push
```

## Development

```bash
# API only
pnpm dev:api

# Vite UI only (browser)
pnpm --filter @launchos/desktop dev

# Full native desktop shell
pnpm --filter @launchos/desktop tauri:dev
```

## Quality gates

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm format:check
```
