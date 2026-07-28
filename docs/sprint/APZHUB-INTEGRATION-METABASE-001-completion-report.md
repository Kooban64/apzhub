# APZHUB-INTEGRATION-METABASE-001 — Completion Report

> **Programme:** APZHUB-INTEGRATION-METABASE-001  
> **Title:** Metabase Integration Foundation  
> **Classification:** PRODUCTION CODE · IMPLEMENTATION  
> **Package:** `@apzhub/integration-metabase` **0.1.0**  
> **Status:** Complete — **ACCEPTED / CLOSED** (Owner Decision with ANALYTICS-003)  
> **Acceptance:** [programme-acceptance-report](../foundation/completion-reports/APZHUB-INTEGRATION-METABASE-001-programme-acceptance-report.md)

---

## Objective achieved

Implemented a certified Metabase Integration Foundation using Integration SDK **1.0.0**, establishing the canonical Analytics provider (ADR-0067), without implementing Analytics Contracts, Services, HTTP APIs, Workbench, or APZ Analytics.

## Delivered

| Area                                     | Evidence                                                                |
| ---------------------------------------- | ----------------------------------------------------------------------- |
| Package scaffold                         | `integrations/metabase/` + `integration.yaml`                           |
| Adapter / factory / bootstrap            | `metabase-adapter.ts` · `metabase-factory.ts` · `metabase-bootstrap.ts` |
| Client / REST                            | `metabase-client.ts` · `internal/metabase-rest-client.ts`               |
| Auth / connection / health / diagnostics | Adapter lifecycle + SecretProvider                                      |
| Version / capability detection           | `/api/session/properties`                                               |
| Error translation / metrics / logging    | Vendor mapper + SDK metrics/logger                                      |
| Capabilities / registration              | `capabilities/*`                                                        |
| Ops / readiness / compatibility          | `operations/*`                                                          |
| Mock provider                            | `testing/mock-metabase-api.ts`                                          |
| Tests                                    | **15** passing (adapter + coverage)                                     |
| Certification docs                       | `docs/integrations/metabase/`                                           |

## Explicitly not delivered

Analytics Contracts · Analytics Platform Services · HTTP APIs · Workbench · APZ Analytics product · embed token issuance · custom SQL · report designer

## Quality

| Gate                                     | Result                               |
| ---------------------------------------- | ------------------------------------ |
| `pnpm typecheck` (package)               | PASS                                 |
| `pnpm lint` (package)                    | PASS                                 |
| `pnpm test` (package)                    | PASS — **15** tests                  |
| Integration SDK freeze                   | Held — no SDK source changes         |
| No Analytics services / HTTP / Workbench | Confirmed absent from this programme |

## Prerequisite closure

Owner Decision authorised this programme after Analytics Platform Foundation and Analytics Information Model were declared complete. APZHUB-PLATFORM-ANALYTICS-002 marked **ACCEPTED / CLOSED** under the same Owner Decision.

## STOP

Await Owner Acceptance. Do **not** implement Analytics Contracts, Services, HTTP APIs, Workbench, or APZ Analytics.
