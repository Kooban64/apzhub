# Getting started — APZHUB development

SPR-001 foundation setup for local development on the approved port map.

## Prerequisites

- Node.js 20+
- pnpm 10+
- Docker + Compose

## First-time setup

```bash
git clone <repo-url> apz-portal
cd apz-portal
cp .env.example .env
pnpm install
pnpm docker:up
pnpm db:migrate
pnpm db:seed
```

## Run the platform

```bash
pnpm dev
```

Open http://localhost:3300

- Register (development only): http://localhost:3300/register when `ALLOW_DEV_REGISTRATION=true`
- Default dev email: `dev@apzhub.local` (password of your choice, min 8 chars)

## Other commands

| Command            | Purpose                     |
| ------------------ | --------------------------- |
| `pnpm build`       | Production build            |
| `pnpm lint`        | ESLint                      |
| `pnpm typecheck`   | TypeScript                  |
| `pnpm test`        | Vitest unit/component tests |
| `pnpm test:e2e`    | Playwright acceptance tests |
| `pnpm storybook`   | UI catalogue on port 6006   |
| `pnpm docker:down` | Stop infrastructure         |

## Ports (SPR-001)

| Service          | Port        |
| ---------------- | ----------- |
| Web              | 3300        |
| Storybook        | 6006        |
| PostgreSQL       | 54334       |
| Redis            | 6380        |
| Caddy HTTP/HTTPS | 3080 / 3443 |

See [ENVIRONMENT.md](../../ENVIRONMENT.md) for coexistence with legacy `apz-stack`.

## Scope

SPR-001 delivers platform foundation only — no business modules or OSS engine integrations.

SPR-002 (complete) adds `@apzhub/platform-runtime` including the Runtime Health Manager — see [platform-runtime architecture](../architecture/platform-runtime.md) and [health-manager](../architecture/health-manager.md).

SPR-003 (complete) delivers the **Workbench Framework** — registry-driven navigation, session persistence, and Workbench API. See [workbench-framework](../architecture/workbench-framework.md).

SPR-004 (complete) delivers the **Action Framework** — Command Palette, shortcuts, context menu, toolbar, and unified action execution. See [command-framework](../architecture/command-framework.md) and [action-framework-onboarding](./action-framework-onboarding.md).

```typescript
import { Runtime } from "@apzhub/platform-runtime/server";
import { bootstrapActionRegistry } from "@apzhub/command-framework/server";

const bootstrap = await Runtime.bootstrap();
// Action registry populated at app hydration — see command-hydration.ts
```
