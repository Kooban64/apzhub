# APZTCMS-013 — API Audit

**Date:** 2026-07-12  
**Verdict:** **PASS** (with known 012 collection gaps)  
**Surface:** `/api/v1/testing/**`

---

## Inventory

| Item       | Evidence                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------- |
| Routes     | **73** `route.ts` under `apps/web/app/api/v1/testing`                                    |
| Handlers   | `apps/web/lib/api/v1/handlers/testing.ts`                                                |
| Schemas    | `apps/web/lib/api/v1/schemas/testing.ts`                                                 |
| OpenAPI    | `docs/specs/APZHUB-Platform-OpenAPI-v1.yaml` — `pnpm openapi:validate:platform` **PASS** |
| HTTP tests | `apps/web/lib/api/v1/platform-api.testing.v1.test.ts` **14** tests                       |

---

## Validated behaviours

| Concern                          | Status      | Notes                                                                                                       |
| -------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------- |
| Request validation               | **PASS**    | Zod schemas on path/query/body                                                                              |
| Response envelopes               | **PASS**    | Standard APZHUB envelope + meta                                                                             |
| Error mapping                    | **PASS**    | Platform error categories; no raw domain leakage                                                            |
| Pagination / sorting / filtering | **PASS**    | Query schemas + list handlers                                                                               |
| Authorization                    | **PASS**    | RequestPipeline + operation→permission map                                                                  |
| Tenant isolation                 | **PASS**    | ServiceRequestContext tenant; fixtures cover multi-tenant IDs                                               |
| Revision handling                | **PASS**    | Domain/persistence revision fields retained through platform                                                |
| Idempotency                      | **PARTIAL** | Automation import duplicate protection in domain; durable HTTP idempotency keys not a universal API feature |
| OpenAPI parity (key paths)       | **PASS**    | Asserted in HTTP Vitest                                                                                     |

---

## Resources covered

Requirements, plans, suites, cases, executions (+ steps/commands), evidence metadata, automation imports, coverage, defects, quality, release readiness, certifications, approvals (read), traceability, dashboard.

---

## Explicit non-goals (still excluded)

Binary evidence / multipart, live runner execution, AI endpoints, Event Bus publish, notifications, new routes in APZTCMS-013.

---

## Known limitations (carried)

- Some typed-client list helpers return empty collections where collection HTTP endpoints are absent (APZTCMS-012 debt).
- Case review verbs may map through status transition rather than dedicated HTTP verbs.
