# SPR-APZPEN-008 — Vision workflow surfaces + E2E

> **Status:** **DELIVERED** — 2026-08-14  
> **Depends on:** SPR-APZPEN-007  
> **Pillar:** [APZPEN Vision](../strategy/APZPEN-ENTERPRISE-SECURITY-ASSURANCE-PLATFORM.md)

## Goal

Land the vision IA work queues (Remediation · Retests · Evidence · Certification), upgrade Home to a risk/work-queue dashboard, and expand Playwright coverage for source bind, findings actions, and portal grants.

## Delivered

| Item             | Notes                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Workflow filters | `apps/web/lib/apzpen/workflow-views.ts` — queue filters + `summariseWorkQueues`                                           |
| Nav              | Remediation, Retests, Evidence, Certification in `APZPEN_NAV` + shell icons                                               |
| Pages            | `/apzpen/remediation`, `/retests`, `/evidence`, `/certification`                                                          |
| Home             | Work-queue strip + links; primary engagement posture                                                                      |
| E2E              | `testing/playwright/e2e/apzpen-001-security-assurance.spec.ts` — bind source, finding actions, portal grant, workflow nav |
| Tests            | `workflow-views.test.ts`                                                                                                  |

## Non-goals (deferred)

Security Graph depth · immutable certification ledger · non-GitHub SCM adapters · PostgreSQL SoR · deeper Evidence vault UX

Operator assign/evidence/manual findings closed in [SPR-APZPEN-009](./SPR-APZPEN-009-operator-ux-close.md).
