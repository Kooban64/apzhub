# APZ TCMS — Testing Workbench Architecture

**Product:** APZ TCMS  
**Module:** Testing (`testing`)  
**Milestone:** APZTCMS-010 (UI) · APZTCMS-011 (platform layer) · APZTCMS-012 (HTTP client)  
**Status:** **Implemented** — workbench UI with production HTTP client outside tests  
**Authority:** [005](../005-desktop-environment-framework-shell-architecture.md) · [016](../016-desktop-shell-architecture-user-experience-framework.md) · [017](../017-navigation-framework-workspace-navigation-architecture.md) · [UI Architecture](./APZHUB-APZ-TCMS-UI-Architecture.md) · [ADR-0059](../adr/ADR-0059-apz-tcms-native-product-architecture.md)

---

## Executive summary

APZTCMS-010 delivered the **Testing workbench** as a presentation-only layer inside the APZHUB desktop shell. APZTCMS-012 keeps the same typed client boundary (`TestingClient`) and uses `createHttpTestingClient()` outside tests. Domain packages (`@apzhub/testing-services`, `@apzhub/testing-persistence`) are **not** imported by UI code. Tests retain the in-process mock client. No database access from UI, no Event Bus, no AI, no binary upload, and no reporting engine.

---

## Layered request path

```text
Shell (Activity Bar / Sidebar / Workspace)
        ↓
TestingWorkspaceRouter (route resolution)
        ↓
View components (apps/web/components/testing/*)
        ↓
testing-api.ts (thin wrappers)
        ↓
TestingClient interface (apps/web/lib/testing/client.ts)
        ↓
HttpTestingClient → /api/v1/testing/** (default outside NODE_ENV=test)
        ↓
MockTestingClient (NODE_ENV=test only)
        ↓
[APZTCMS-011] PlatformServiceGateway.testing.* → RequestPipeline → Platform Impls → Domain Services → Persistence
```

| Layer | Responsibility | APZTCMS-010 |
| ----- | -------------- | ------------- |
| **Presentation** | Render view models; permission-gated controls | ✅ Implemented |
| **Typed client** | Stable UI contract; transport swappable | ✅ `TestingClient` + HTTP default; mock in tests |
| **Platform gateway** | Pipeline, authz, error translation | ✅ Wired through `/api/v1/testing/**` |
| **Domain services** | Business rules, state machines, audit | ✅ Via platform layer only |
| **Persistence** | PostgreSQL SoR | ✅ Via platform layer — ❌ not accessed from UI |

---

## Code layout

| Path | Role |
| ---- | ---- |
| `apps/web/lib/testing/` | Typed client, mock transport, routes, permissions, commands, query keys, view-model types |
| `apps/web/components/testing/` | View components, shared UI primitives, workspace router, commands panel |
| `services/testing/manifests/` | Parent `testing` module + 15 child sidebar manifests (all **enabled**) |
| `apps/web/components/workbench-page.tsx` | Shell wiring — `TestingWorkspaceRouter` when pathname matches `/workspace/testing` |

### `apps/web/lib/testing/` modules

| File | Purpose |
| ---- | ------- |
| `client.ts` | `TestingClient` interface — sole data boundary for views |
| `http-client.ts` | Production HTTP transport scoped to `/api/v1/testing/**` |
| `mock-client.ts` | In-memory implementation with fixture seed data |
| `testing-api.ts` | Module-level accessor (`getTestingClient`, `setTestingClient`) |
| `commands.ts` | Permission-gated command executor delegating to `testing-api` |
| `routes.ts` | Route helpers and section resolution |
| `permissions.ts` | UI-only permission helpers (server remains authoritative) |
| `types.ts` | Presentation view models (not domain entities) |
| `query-keys.ts` | TanStack Query key factory |
| `errors.ts` | `TestingClientError` + user-safe messages |
| `format.ts` | Status labels, dates, byte formatting |
| `local-state.ts` | Ephemeral UI state helpers |

---

## Manifest registration

The Testing module is **enabled** under `services/testing/manifests/`:

| Manifest | ID | Route |
| -------- | -- | ----- |
| Parent | `testing` | `/workspace/testing` |
| Child | `testing-dashboard` | `/workspace/testing` |
| Child | `testing-requirements` | `/workspace/testing/requirements` |
| Child | `testing-plans` | `/workspace/testing/plans` |
| Child | `testing-suites` | `/workspace/testing/suites` |
| Child | `testing-cases` | `/workspace/testing/cases` |
| Child | `testing-executions` | `/workspace/testing/executions` |
| Child | `testing-automation` | `/workspace/testing/automation` |
| Child | `testing-evidence` | `/workspace/testing/evidence` |
| Child | `testing-coverage` | `/workspace/testing/coverage` |
| Child | `testing-defects` | `/workspace/testing/defects` |
| Child | `testing-quality` | `/workspace/testing/quality` |
| Child | `testing-certification` | `/workspace/testing/certification` |
| Child | `testing-release-readiness` | `/workspace/testing/release-readiness` |
| Child | `testing-reports` | `/workspace/testing/reports` |
| Child | `testing-administration` | `/workspace/testing/administration` |

Parent manifest declares Activity Bar entry, sidebar navigation, palette commands, and workbench wiring. Child manifests declare sidebar-level workbench navigation entries.

---

## Shell wiring

`workbench-page.tsx` detects Testing routes via `isTestingRoute(pathname)` and renders `TestingWorkspaceRouter` inside the fixed DEF shell regions. No isolated page layouts — Testing views occupy the **Workspace** region only.

```text
Header / Activity Bar / Sidebar  ← manifest-driven (testing enabled)
        ↓
Workspace                        ← TestingWorkspaceRouter
        ↓
Status Bar                       ← standard platform status
```

---

## Boundary rules (mandatory)

Enforced by `testing-architecture-boundary.test.ts`:

| Rule | Detail |
| ---- | ------ |
| No domain imports | Components and `lib/testing` must not import `@apzhub/testing-services`, `testing-persistence`, repositories, or Drizzle |
| No REST in UI components | Components do not call `fetch`; only `http-client.ts` may call `/api/v1/testing/**` |
| No business logic in views | State transitions and validation belong in domain services (future HTTP layer) |
| Typed client only | Views call `testing-api` / `executeTestingCommand` — never domain services directly |
| Presentation view models | `types.ts` defines UI shapes; domain DTOs never reach components |
| Certification advisory | Recommendations displayed with explicit advisory-only labelling; no auto-approve |
| Evidence metadata only | Evidence view shows title, kind, content type, size, status — no binary upload or preview |
| No AI | No suggestion engine, no LLM integration |
| No Event Bus | No publish/subscribe from UI layer |
| No reporting engine | Reports view is placeholder metadata only |

---

## Domain package versions (unchanged)

| Package | Version |
| ------- | ------- |
| `@apzhub/testing-contracts` | **0.6.0** |
| `@apzhub/testing-persistence` | **0.7.0** |
| `@apzhub/testing-services` | **0.5.0** |

APZTCMS-010 does not bump domain packages.

---

## Explicit exclusions

- PostgreSQL / repository access from UI
- Event Bus, notifications, search indexing
- AI assist (deferred after APZTCMS-013 or later)
- Binary evidence upload / object storage
- Reporting engine / PDF export
- Playwright dependency on live APIs (E2E uses mock-routed HTTP)

---

## Production transport (APZTCMS-012)

APZTCMS-011 delivered **`gateway.testing.*`** and platform service implementations. APZTCMS-012 added `/api/v1/testing/**` handlers and `createHttpTestingClient()`.

`createHttpTestingClient()` implements the same `TestingClient` surface against route handlers that call `gateway.testing.*`. Views and commands remain unchanged; transport selection is handled in `testing-api.ts`.

See [Testing Platform Service Architecture](./APZHUB-Testing-Platform-Service-Architecture.md) · [Testing Gateway Reference](./APZHUB-Testing-Gateway-Reference.md) · [Testing HTTP API](./APZHUB-Testing-HTTP-API.md) · [Testing Typed Client Architecture](./APZHUB-Testing-Typed-Client-Architecture.md).

---

## Related

- [Testing Navigation Guide](./APZHUB-APZ-TCMS-Testing-Navigation-Guide.md)
- [Testing View Catalogue](./APZHUB-APZ-TCMS-Testing-View-Catalogue.md)
- [Testing Command Catalogue](./APZHUB-APZ-TCMS-Testing-Command-Catalogue.md)
- [Testing UX Guide](./APZHUB-APZ-TCMS-Testing-UX-Guide.md)
- [Developer Guide](./APZHUB-APZ-TCMS-Developer-Guide.md)
- [APZTCMS-010 Completion Report](../sprint/APZTCMS-010-completion-report.md)
