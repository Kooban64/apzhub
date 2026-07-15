# OSS-101-10 — Wave 1 Certification Report

**Status:** Complete  
**Date:** 2026-07-10  
**Scope:** OSS-101-10 only — Plane Wave 1 certification & closeout  
**Package:** `@apzhub/integration-plane` **v0.6.0** (unchanged — certification only)  
**Reference standard:** [REFERENCE-ADAPTER-STANDARD.md](../architecture/REFERENCE-ADAPTER-STANDARD.md)

---

## Executive summary

Plane is formally certified as the **APZHUB Reference Adapter**. Wave 1 (OSS-100 foundation through OSS-101-09 operations, plus OSS-110 platform service/HTTP spine) is **complete**. Architecture for integration work is **frozen** pending owner approval for Wave 2 (OSS-102 Zammad).

No new user functionality, API surface, SDK APIs, or PlatformService behaviour was added. Defects found during certification were limited to lint hygiene, a contracts branded-type lint fix, and Next.js build environment/`global-error` hardening.

**Recommendation:** Proceed to **OSS-102 (Zammad)** only after explicit owner approval, using the Reference Adapter Standard as the mandatory template.

---

## Architecture certification

| Item                         | Verdict                                                                                      |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| Architecture audit           | **PASS** — [OSS-101-10-architecture-audit.md](./OSS-101-10-architecture-audit.md)            |
| Dependency audit             | **PASS** (0 violations) — [OSS-101-10-dependency-audit.md](./OSS-101-10-dependency-audit.md) |
| Layering / package ownership | **PASS**                                                                                     |
| Documented exception         | Gateway bootstrap dynamic import of Plane (feature-flagged)                                  |

---

## Capability certification

See [OSS-101-10-capability-certification.md](./OSS-101-10-capability-certification.md).

All required capabilities certified. Optional: analytics, webhooks. Min Plane CE **0.23.0** (range through **0.24.x**).

---

## End-to-end verification (mocked)

| Suite                                               | Path                                               | Result   |
| --------------------------------------------------- | -------------------------------------------------- | -------- |
| Gateway → Plane → Mock                              | `testing/wave1/wave1-gateway.stack.test.ts`        | PASS     |
| HTTP → Gateway → Services → Provider → Plane → Mock | `apps/web/lib/api/v1/wave1-stack.e2e.test.ts`      | PASS (2) |
| Performance baseline                                | `testing/wave1/wave1-performance.baseline.test.ts` | PASS     |

Scenarios covered: workspace/project/task lifecycle, state transition validation, authorisation context, mapping, provider resolution, diagnostics/readiness/sync, error paths. **No live Plane instance.**

---

## Regression certification

| Suite                                     | Result                              |
| ----------------------------------------- | ----------------------------------- |
| Integration SDK                           | PASS (included in Wave1 regression) |
| Platform Services                         | PASS                                |
| Contracts                                 | PASS                                |
| Platform HTTP API (`apps/web/lib/api/v1`) | PASS                                |
| Authorisation                             | PASS                                |
| Mapping                                   | PASS                                |
| Gateway                                   | PASS                                |
| Plane Adapter                             | PASS (99 package tests retained)    |
| Wave1 certification tests                 | PASS (4)                            |
| OpenAPI platform validate                 | PASS                                |
| **Combined Wave1 regression**             | **529 passed / 55 files**           |

### Full monorepo note

`pnpm test` / `pnpm test:coverage` across the entire monorepo reports pre-existing failures outside Wave 1 (Law postgres skip assertions when DB unavailable, bootstrap/manifest issues, workbench). These are **not** introduced by OSS-101-10 and are recorded as known technical debt. Wave 1 mandatory regression is the scoped suite above.

---

## Coverage certification

Scoped instrumentation (Wave1 packages exercised; thresholds disabled for non-Wave packages in include set):

| Area                             |                            Lines | Branches | Functions | Statements | vs 80% target                                                 |
| -------------------------------- | -------------------------------: | -------: | --------: | ---------: | ------------------------------------------------------------- |
| Plane (`integrations/plane`)     |                           88.87% |   76.52% |    93.95% |     88.87% | Branches **below**                                            |
| Integration SDK                  |                           79.01% |   76.22% |    81.35% |     79.01% | Lines/branches **below**                                      |
| Platform Services                |                           77.85% |   82.10% |    73.93% |     77.85% | Lines/functions **below**                                     |
| Contracts                        |                             100% |     100% |      100% |       100% | Met                                                           |
| Mapping (services/mapping)       |                           86.92% |   80.69% |    98.44% |     86.92% | Met                                                           |
| Gateway (services gateway slice) |                           95.00% |     100% |    90.91% |     95.00% | Met                                                           |
| Authorisation package            |                           57.17% |   70.98% |    69.81% |     57.17% | **Below** (postgres adapters lightly exercised in scoped run) |
| HTTP layer                       | n/a in vitest `coverage.include` |        — |         — |          — | Certified by HTTP tests, not line coverage                    |

**Highlight:** Plane branches, SDK lines/branches, platform-services lines/functions, and platform-authorization aggregate are below the repository 80% aspirational target in this scoped run. No optimisation or coverage-chasing work performed (certification-only scope). Future maintenance may raise coverage without changing Wave 1 behaviour.

---

## Performance baseline (mocked, ms)

Recorded 2026-07-10 (representative run; not SLAs):

| Operation                            | Baseline ms |
| ------------------------------------ | ----------: |
| workspace.list                       |        ~5–9 |
| project.list                         |        ~3–5 |
| project.create                       |        ~2–3 |
| task.list                            |        ~4–5 |
| task.update                          |        ~2–3 |
| gateway.workspaces.list              |        ~5–7 |
| gateway.projects.list                |        ~2–4 |
| provider.resolution + mapping.lookup |        ~3–9 |

No optimisation work performed.

---

## Quality gates

| Gate                    | Result                                                                |
| ----------------------- | --------------------------------------------------------------------- |
| Formatting              | Milestone artefacts Prettier-clean; repo-wide drift pre-existing (TD) |
| Lint                    | PASS (0 errors; prior unused-disable cleaned)                         |
| Typecheck               | PASS                                                                  |
| Build                   | PASS when `NODE_ENV` is **unset** (see debt)                          |
| Wave1 regression        | PASS (529)                                                            |
| OpenAPI validation      | PASS                                                                  |
| Dependency validation   | PASS                                                                  |
| Architecture validation | PASS                                                                  |
| Documentation audit     | PASS (this closeout)                                                  |

---

## Known technical debt

| ID       | Item                                                                                         | Severity            |
| -------- | -------------------------------------------------------------------------------------------- | ------------------- |
| TD-W1-01 | Full monorepo test suite has pre-existing Law/bootstrap/postgres-skip failures               | Medium              |
| TD-W1-02 | `NODE_ENV=development` in shell breaks `next build` via `/_global-error` prerender (Next 16) | Medium              |
| TD-W1-03 | Scoped coverage below 80% on some Wave1-adjacent packages                                    | Low                 |
| TD-W1-04 | Webhook HTTP ingress not implemented                                                         | Deferred (explicit) |
| TD-W1-05 | Platform Event Bus not wired to Plane events                                                 | Deferred (explicit) |
| TD-W1-06 | Projects / Task UI not implemented                                                           | Deferred (explicit) |
| TD-W1-07 | HTTP handlers not in vitest coverage include paths                                           | Low                 |

---

## Remaining risks

1. Live Plane CE version drift outside 0.23–0.24.x without contract re-certification.
2. Optional analytics/webhooks unavailable on some CE deployments → degraded health (expected).
3. Full monorepo CI green depends on resolving TD-W1-01/02 outside Wave 1.
4. Wave 2 adapters may copy Plane internals instead of the Reference Standard — mitigated by mandatory standard + audit script extension.

---

## Reference adapter certification

**`@apzhub/integration-plane` is the officially certified APZHUB Reference Adapter.**

Future adapters **must** comply with [REFERENCE-ADAPTER-STANDARD.md](../architecture/REFERENCE-ADAPTER-STANDARD.md).

---

## Wave 1 completion

| Track                   | Status                                 |
| ----------------------- | -------------------------------------- |
| OSS-100-01 … OSS-100-05 | Complete (SDK foundation)              |
| OSS-101-04 … OSS-101-09 | Complete (Plane adapter through ops)   |
| OSS-110-01 … OSS-110-09 | Complete (contracts through Task HTTP) |
| OSS-101-10              | **Complete (this report)**             |

**Wave 1 is formally complete.** Integration architecture is frozen.

---

## Recommendation for Wave 2

1. Owner approves **OSS-102 — Zammad Integration**.
2. Start with `integration.yaml` + ADR alignment to Reference Adapter Standard.
3. Reuse mock-first certification, dependency audit rules, and operations patterns.
4. Do **not** start OSS-110-10, Platform Event Bus, UI, or webhook ingress without separate approval.

---

## Artefacts produced

| Path                                                 | Role                                |
| ---------------------------------------------------- | ----------------------------------- |
| `scripts/wave1-dependency-audit.mjs`                 | Static boundary audit               |
| `docs/sprint/OSS-101-10-dependency-audit.{md,json}`  | Audit output                        |
| `docs/sprint/OSS-101-10-architecture-audit.md`       | Architecture report                 |
| `docs/sprint/OSS-101-10-capability-certification.md` | Capability matrix                   |
| `docs/architecture/REFERENCE-ADAPTER-STANDARD.md`    | Mandatory future-adapter standard   |
| `testing/wave1/*.test.ts`                            | Gateway + performance certification |
| `apps/web/lib/api/v1/wave1-stack.e2e.test.ts`        | HTTP E2E certification              |
| `docs/sprint/OSS-101-10-Wave1-Certification.md`      | This report                         |

---

## Stop condition

**Met.** Await explicit owner approval before Wave 2 (OSS-102 Zammad) or any other milestone.
