# SPR-002 — Platform Registry & Discovery Framework

> **Sprint:** 002  
> **Epic:** Platform Runtime  
> **Status:** Approved for Implementation — Phase 0 complete  
> **Priority:** Critical (P0)  
> **Depends On:** [Document 000](../000-apzhub-engineering-constitution.md) · [Documents 024–029](../024-apzhub-platform-sdk-development-framework.md) · [SPR-001](../SPR-001-monorepo-foundation-development-environment.md) · [v0.1.0-foundation closeout](../reviews/SPR-001-closeout.md)  
> **Prerequisite:** Sprint 001 `v0.1.0-foundation`  
> **Package:** `@apzhub/platform-runtime` ([ADR-0018](../adr/ADR-0018-platform-runtime-package.md))  
> **Estimated Duration:** 2–3 weeks  
> **Classification:** Implementation Sprint Guide

---

## 1. Sprint objective

Build the **runtime Platform Registry** — the authoritative discovery and metadata layer for all platform capabilities.

The Registry shall:

- Discover capabilities from manifests at startup (and on controlled refresh)
- Validate manifest contracts before registration
- Resolve dependencies between capabilities
- Expose a typed, read-oriented API for consumers (Shell, SDKs, future services)
- Track lifecycle and health metadata for registered capabilities

Sprint 002 delivers **platform infrastructure only**. No business modules, no OSS engine integrations, and no user-facing feature work beyond diagnostic/registry endpoints.

Implements [ADR-0004](../adr/ADR-0004-platform-registry-first-architecture.md) and Document [024 — Platform SDK](../024-apzhub-platform-sdk-development-framework.md) Section 7 (Platform Registration).

---

## 2. Scope

### Included

| Area                          | Deliverable                                                                                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Registry runtime**          | In-process Platform Registry in `@apzhub/platform-runtime`                                                                                        |
| **Discovery**                 | Filesystem manifest scanner for monorepo paths (`packages/ui`, `services/`, `integrations/`, `events/`, future `modules/`)                        |
| **Validation**                | Zod (or equivalent) schemas per capability kind; reject invalid manifests at startup                                                              |
| **Registration API**          | Typed `Registry` facade: `getModules()`, `getServices()`, `getIntegrations()`, `getComponents()`, etc.                                            |
| **Dependency resolution**     | Topological ordering; missing dependency detection; version compatibility checks                                                                  |
| **Lifecycle metadata**        | Installed / enabled / disabled states (platform capabilities only in SPR-002)                                                                     |
| **Health aggregation**        | Registry health summary; per-capability health metadata from manifests                                                                            |
| **Persistence (recommended)** | PostgreSQL cache for registry state — see [platform-registry-database.md](../architecture/platform-registry-database.md)                          |
| **Platform bootstrap**        | Register existing SPR-001 UI `component.yaml` manifests; platform-internal stubs (no business entries)                                            |
| **Diagnostics**               | Registry health summary on `/api/health` only — **no public REST registry API** ([ADR-0010](../adr/ADR-0010-registry-internal-typescript-api.md)) |
| **Tests**                     | Unit tests for validation, discovery, dependency resolution; integration tests for bootstrap                                                      |
| **Documentation**             | Architecture, API, manifest recommendations (this sprint’s design docs)                                                                           |

### Capability kinds supported (registry index)

| Kind              | Manifest (existing SDK)                                     | SPR-002 registry index                               |
| ----------------- | ----------------------------------------------------------- | ---------------------------------------------------- |
| Modules           | `module.yaml` (025)                                         | ✅ Index + validate (no business modules registered) |
| Platform Services | `service.yaml` (027)                                        | ✅ Index + validate (scaffold entries only)          |
| Integrations      | `integration.yaml` (026)                                    | ✅ Index + validate (scaffold entries only)          |
| UI Components     | `component.yaml` (028)                                      | ✅ Index + validate (SPR-001 components)             |
| Events            | `event.yaml` (029)                                          | ✅ Index + validate (type stubs only)                |
| Themes            | `theme.yaml` (022 — proposed)                               | ✅ Index schema; register built-in light/dark        |
| Commands          | embedded in `module.yaml` / `command.yaml` (019 — proposed) | ✅ Normalised command index                          |
| Search providers  | embedded in manifests (020)                                 | ✅ Normalised provider index                         |
| Workers           | `worker.yaml` (012 — proposed)                              | ✅ Schema + empty index                              |
| Dashboards        | embedded in `module.yaml` (proposed)                        | ✅ Schema + empty index                              |
| Widgets           | embedded in `module.yaml` (proposed)                        | ✅ Schema + empty index                              |
| Reports           | embedded in `module.yaml` (proposed)                        | ✅ Schema + empty index                              |
| AI providers      | future                                                      | ⏸ Schema placeholder only                            |
| Feature flags     | future                                                      | ⏸ Schema placeholder only                            |

---

## 3. Exclusions

Sprint 002 explicitly **does not** include:

| Exclusion                                         | Reason                                                    |
| ------------------------------------------------- | --------------------------------------------------------- |
| Business modules (Projects, Support, etc.)        | Deferred to module sprints                                |
| OSS integrations (Plane, Kimai, Zammad, …)        | Deferred to integration sprints                           |
| Business Platform Services                        | Deferred to service sprints                               |
| Event Bus runtime / pub-sub                       | Deferred to Event Bus sprint (012/029)                    |
| Desktop Shell changes                             | Shell consumes registry in a **later** sprint             |
| Command Palette UI                                | Requires registry; UI deferred                            |
| Global Search UI / indexing                       | Requires registry; search engine deferred                 |
| Navigation wiring from registry                   | Deferred to navigation sprint (017)                       |
| Permission enforcement on registry queries        | Requires IAM sprint (007); registry returns metadata only |
| Dynamic hot-reload of manifests in production     | Out of scope; controlled restart acceptable for SPR-002   |
| Modifying existing SDK documents (025–029)        | Recommendations only — see manifest specification doc     |
| Modifying Sprint 001 code except via approved ADR | Constitution + closeout constraint                        |

---

## 4. Deliverables

| #   | Deliverable                               | Location                                                  |
| --- | ----------------------------------------- | --------------------------------------------------------- |
| 1   | Platform Registry implementation          | `packages/platform-runtime/`                              |
| 2   | Manifest validation schemas               | `packages/platform-runtime/manifests/`                    |
| 3   | Discovery engine                          | `packages/platform-runtime/discovery/`                    |
| 4   | Registry persistence (if approved)        | `packages/config/src/db/` + migration                     |
| 5   | Registry bootstrap                        | Platform startup hook in `apps/web` (minimal — load only) |
| 6   | Diagnostic API                            | `apps/web/app/api/platform/registry/route.ts`             |
| 7   | Architecture documentation                | `docs/architecture/platform-registry*.md`                 |
| 8   | ADR(s) for persistence & package boundary | `docs/adr/`                                               |
| 9   | Unit + integration tests                  | `packages/sdk/**/*.test.ts`                               |
| 10  | CHANGELOG entry                           | `0.2.0-registry` (proposed)                               |

---

## 5. Acceptance criteria

| #     | Criterion                                                                                                         | Verification                                         |
| ----- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| AC-1  | Registry discovers all SPR-001 `component.yaml` files                                                             | Unit/integration test                                |
| AC-2  | Invalid manifest prevents startup (fail-fast in production; warn in dev)                                          | Test with corrupt fixture                            |
| AC-3  | `Registry.getComponents()` returns typed entries for Button, Input, Card, Header, Sidebar, StatusBar, ShellLayout | Unit test                                            |
| AC-4  | `Registry.getModules()` returns empty array (no business modules)                                                 | Unit test                                            |
| AC-5  | Dependency resolution detects missing `requires` entries                                                          | Unit test with fixture manifests                     |
| AC-6  | Version compatibility rejects incompatible `platformVersion`                                                      | Unit test                                            |
| AC-7  | Registry health summary on `/api/health`                                                                          | Integration test                                     |
| AC-8  | No Desktop Shell behaviour change                                                                                 | Manual + E2E regression (SPR-001 suite still passes) |
| AC-9  | Coverage ≥ 80% on registry package                                                                                | CI `pnpm test:coverage`                              |
| AC-10 | All CI gates pass                                                                                                 | lint, typecheck, build, test, e2e, storybook         |

---

## 6. Risks

See [Section 11](#11-risks-and-mitigations) and [platform-registry.md](../architecture/platform-registry.md).

---

## 7. Dependencies

### Document dependencies

| Document           | Relationship                            |
| ------------------ | --------------------------------------- |
| 000                | Supreme authority — no layer bypassing  |
| 024                | Platform Registration, manifest-first   |
| 025–029            | Per-kind manifest contracts (unchanged) |
| 017, 019, 020, 022 | Future consumers of registry indices    |
| ADR-0004           | Registry-first architecture decision    |

### Technical dependencies (from Sprint 001)

| Dependency                       | Status                                                     |
| -------------------------------- | ---------------------------------------------------------- |
| `@apzhub/config` (env, Drizzle)  | ✅ Available                                               |
| PostgreSQL                       | ✅ Available (persistence option)                          |
| `@apzhub/ui` component manifests | ✅ 7 manifests                                             |
| `@apzhub/sdk` stub               | ✅ To be replaced                                          |
| CI + test infrastructure         | ✅ Available                                               |
| Better Auth / IAM                | ⚠ RBAC not enforced — registry is metadata-only in SPR-002 |

### Sprint dependencies

| Prerequisite                                          | Required before implementation |
| ----------------------------------------------------- | ------------------------------ |
| `v0.1.0-foundation` tag                               | Recommended                    |
| Owner approval of this guide + implementation plan    | **Mandatory**                  |
| ADR for registry persistence model                    | **Mandatory** (Phase 0)        |
| ADR for `@apzhub/registry` vs expanding `@apzhub/sdk` | **Mandatory** (Phase 0)        |

---

## 8. Definition of Done

Sprint 002 is complete when:

1. Platform Registry runtime is implemented and bootstrapped on application startup
2. All acceptance criteria (Section 5) pass in CI
3. Existing SPR-001 UI components are discoverable via `Registry.getComponents()`
4. No business capabilities are registered
5. Desktop Shell remains unchanged (static navigation preserved)
6. Architecture, API, manifest, and database design documents are filed
7. ADR(s) filed for persistence and package structure decisions
8. CHANGELOG updated; sprint closeout report produced
9. No modifications to foundation documents 001–029

---

## 9. Architecture references

| Topic                                    | Document                                                                                 |
| ---------------------------------------- | ---------------------------------------------------------------------------------------- |
| Platform Runtime                         | [platform-runtime.md](../architecture/platform-runtime.md)                               |
| Registry design                          | [platform-registry.md](../architecture/platform-registry.md)                             |
| Unified manifest model (recommendations) | [platform-manifest-specification.md](../architecture/platform-manifest-specification.md) |
| Runtime & Registry API                   | [platform-registry-api.md](../architecture/platform-registry-api.md)                     |
| Persistence recommendation               | [platform-registry-database.md](../architecture/platform-registry-database.md)           |
| Architecture update                      | [ARCH-002](../reviews/ARCH-002-platform-runtime-update.md)                               |

---

## 10. Implementation plan

Detailed phased execution: [SPR-002-implementation-plan.md](./SPR-002-implementation-plan.md)

---

## 11. Risks and mitigations

### Architectural risks

| Risk                                  | Impact                | Mitigation                                                                 |
| ------------------------------------- | --------------------- | -------------------------------------------------------------------------- |
| Registry becomes a god-object         | High coupling         | Split by capability kind; read-only facades; no business logic in registry |
| Manifest schema drift from SDK docs   | Invalid registrations | Version manifest schemas; validate against SDK doc version field           |
| Bypassing registry via direct imports | Architecture erosion  | ESLint boundary rules; code review; ADR enforcement                        |

### Performance risks

| Risk                              | Impact             | Mitigation                                                                    |
| --------------------------------- | ------------------ | ----------------------------------------------------------------------------- |
| Slow startup from filesystem scan | Delayed cold start | Cache parsed manifests in PostgreSQL; parallel scan; lazy load optional kinds |
| Large manifest count at scale     | Memory pressure    | Index metadata only; lazy-load full manifest bodies                           |

### Startup risks

| Risk                                 | Impact             | Mitigation                                                      |
| ------------------------------------ | ------------------ | --------------------------------------------------------------- |
| Fail-fast on bad manifest blocks dev | Developer friction | Strict in CI/production; configurable warn-only in local dev    |
| Registry init before DB ready        | Crash loop         | Health check ordering; retry with backoff; clear error messages |

### Dependency risks

| Risk                                              | Impact                | Mitigation                                                        |
| ------------------------------------------------- | --------------------- | ----------------------------------------------------------------- |
| Circular capability dependencies                  | Unresolvable graph    | Topological sort with cycle detection; fail with actionable error |
| Missing platform services referenced by manifests | Broken future modules | Validate `requires` against known platform capability IDs         |

### Scalability risks

| Risk                                  | Impact                   | Mitigation                                                                       |
| ------------------------------------- | ------------------------ | -------------------------------------------------------------------------------- |
| Monolithic in-process registry limits | Future multi-node deploy | Design API for later extraction to Platform Service; persistence layer decoupled |
| Hundreds of modules                   | Query latency            | Indexed PostgreSQL cache; paginated API; filter by kind/permission (future)      |

### Testing risks

| Risk                              | Impact               | Mitigation                                                      |
| --------------------------------- | -------------------- | --------------------------------------------------------------- |
| Filesystem-dependent tests flaky  | CI instability       | Fixture manifest directories under `testing/fixtures/registry/` |
| Incomplete coverage of edge cases | Production surprises | Property tests for dependency graph; corrupt manifest fixtures  |

---

## 12. Approval gate

**Do not begin implementation** until:

- [ ] Owner approves this guide
- [ ] Owner approves [SPR-002-implementation-plan.md](./SPR-002-implementation-plan.md)
- [ ] Phase 0 ADRs accepted
- [ ] Sprint 001 tag `v0.1.0-foundation` applied (recommended)

---

_Planning document — no application code in this sprint guide._
