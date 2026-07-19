# APZHUB-INTEGRATION-KIMAI-001 — Completion Report

> **Programme:** APZHUB-INTEGRATION-KIMAI-001  
> **Title:** Kimai Integration Foundation  
> **Classification:** PLATFORM INTEGRATION · IMPLEMENTATION  
> **Package:** `@apzhub/integration-kimai` **0.1.0**  
> **Status:** Complete — **Awaiting Owner Acceptance**  
> **Acceptance:** [programme-acceptance-report](../foundation/completion-reports/APZHUB-INTEGRATION-KIMAI-001-programme-acceptance-report.md)

---

## Objective achieved

Created a reusable Kimai CE integration foundation using Integration SDK **1.0.0**, following the Plane/n8n adapter architectural principles, without implementing APZ Time.

## Delivered

| Area                                  | Evidence                                                                                 |
| ------------------------------------- | ---------------------------------------------------------------------------------------- |
| Package scaffold                      | `integrations/kimai/` + `integration.yaml`                                               |
| Adapter / factory / bootstrap         | `src/kimai-adapter.ts` · `kimai-factory.ts` · `kimai-bootstrap.ts`                       |
| Auth / version / health / diagnostics | Adapter lifecycle + REST `/ping` `/version`                                              |
| Error translation / metrics / logging | Vendor mapper + SDK metrics/logger                                                       |
| Capabilities / registration           | `capabilities/*`                                                                         |
| Ops / cert framework                  | `operations/*`                                                                           |
| Mock provider                         | `testing/mock-kimai-api.ts`                                                              |
| Tests                                 | 28 passing (unit, provider, compatibility, health, diagnostics, certification, boundary) |
| Certification docs                    | `docs/integrations/kimai/`                                                               |

## Explicitly not delivered

TimeTrackingService · Platform Services for Time · Time HTTP · Workbench · APZ Time product · Reporting · Analytics · Approvals · Activities UI

## Quality

| Gate                                              | Result                                          |
| ------------------------------------------------- | ----------------------------------------------- |
| `pnpm typecheck` (package)                        | PASS                                            |
| `pnpm lint` (package)                             | PASS                                            |
| `pnpm test` (package)                             | PASS — 28 tests                                 |
| No ts-ignore / eslint-disable / stub placeholders | PASS                                            |
| Integration SDK freeze                            | Held — no SDK source changes for this programme |
| No `services/time`                                | Confirmed absent                                |

## STOP

Await Owner Acceptance. Do not begin APZ Time.
