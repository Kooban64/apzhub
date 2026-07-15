# APZ TCMS — Developer Guide

**Milestone:** APZTCMS-010 (extends 002–009)

---

## Quick start

```bash
pnpm --filter @apzhub/testing-contracts typecheck
pnpm --filter @apzhub/testing-persistence typecheck
pnpm --filter @apzhub/testing-services typecheck
pnpm exec vitest run packages/testing-contracts packages/testing-persistence packages/testing-foundation packages/testing-services --reporter=dot
```

### Testing workbench UI (APZTCMS-010)

```bash
pnpm exec vitest run apps/web/lib/testing apps/web/components/testing --reporter=dot
```

---

## Packages

| Package | Version |
| --- | --- |
| `@apzhub/testing-contracts` | **0.6.0** |
| `@apzhub/testing-persistence` | **0.7.0** (through migration `0028`) |
| `@apzhub/testing-services` | **0.5.0** |

Domain package versions are **unchanged** by APZTCMS-010.

---

## Certification engine

```ts
import { createCertificationEngineServices, createTestingDomainServices } from "@apzhub/testing-services";

const cert = createCertificationEngineServices({ persistence });
const record = await cert.records.create(ctx, { key: "REL-1", name: "Release 1" });
await cert.workflow.transition(ctx, record.id, "preparing");
await cert.gates.evaluateAll(ctx, record.id);
const advice = await cert.recommendations.recommend(ctx, record.id); // advisory
// Final approve requires human with certification.approve — never automatic

const all = createTestingDomainServices({ persistence });
// all.certification.*
```

Apply migrations `0016`–`0028`. Set `app.tenant_id` under RLS.

---

## APZTCMS-010 — Testing workbench UI

Presentation-only workbench under `apps/web`. **No** imports of `@apzhub/testing-services` or persistence from UI code.

### Layout

| Path | Role |
| ---- | ---- |
| `apps/web/lib/testing/` | Typed client, mock transport, routes, permissions, commands, types |
| `apps/web/components/testing/` | View components, router, shared UI, commands panel |
| `services/testing/manifests/` | Parent `testing` + 15 child module manifests (enabled) |

### Data boundary

```ts
// Views and commands use testing-api only:
import { getDashboard, createPlan } from "@/lib/testing/testing-api";
import { executeTestingCommand } from "@/lib/testing/commands";

// Swap transport for tests or future HTTP:
import { setTestingClient, resetTestingClient } from "@/lib/testing/testing-api";
import { createMockTestingClient } from "@/lib/testing/mock-client";
```

`TestingClient` (`client.ts`) is the stable contract. Default transport is `createMockTestingClient()` — no REST in APZTCMS-010.

### Shell integration

`workbench-page.tsx` renders `TestingWorkspaceRouter` when `isTestingRoute(pathname)` is true. Routes base: `/workspace/testing`.

### Manifests

Parent manifest: `services/testing/manifests/testing/module.yaml` — Activity Bar, sidebar, palette commands, `status: enabled`.

Child manifests (sidebar): `testing-dashboard`, `testing-requirements`, `testing-plans`, `testing-suites`, `testing-cases`, `testing-executions`, `testing-automation`, `testing-evidence`, `testing-coverage`, `testing-defects`, `testing-quality`, `testing-certification`, `testing-release-readiness`, `testing-reports`, `testing-administration`.

### Tests

```bash
# Unit + component (117 tests)
pnpm exec vitest run apps/web/lib/testing apps/web/components/testing

# E2E (mock client — no live APIs)
pnpm exec playwright test testing/playwright/e2e/apztcms-010-testing-workbench.spec.ts
```

Boundary test: `apps/web/components/testing/testing-architecture-boundary.test.ts` — blocks domain/REST imports.

### Explicit UI exclusions

HTTP route handlers, domain service wiring, PostgreSQL, Event Bus, AI, binary evidence upload, reporting engine.

---

## Permissions

`certification.create|review|approve|reject|override|audit` (+ existing view/records/gates/admin).

UI helpers: `apps/web/lib/testing/permissions.ts` — server remains authoritative.

---

## Explicit exclusions

Domain milestones 002–009: HTTP, dashboards in domain layer, AI auto-approve, Event Bus, email, CI/CD.

APZTCMS-010 UI: live HTTP APIs, DB access, domain imports in components, AI, binary upload.

---

## Related

[Testing Workbench Architecture](./APZHUB-APZ-TCMS-Testing-Workbench-Architecture.md) · [Navigation Guide](./APZHUB-APZ-TCMS-Testing-Navigation-Guide.md) · [View Catalogue](./APZHUB-APZ-TCMS-Testing-View-Catalogue.md) · [Command Catalogue](./APZHUB-APZ-TCMS-Testing-Command-Catalogue.md) · [UX Guide](./APZHUB-APZ-TCMS-Testing-UX-Guide.md) · [Certification Engine Architecture](./APZHUB-APZ-TCMS-Certification-Engine-Architecture.md) · [APZTCMS-010 Completion Report](../sprint/APZTCMS-010-completion-report.md)
