# PRH-012–018 Completion Report — Production Hardening & Operational Readiness

> **Status:** ACCEPTED / CLOSED  
> **Date:** 2026-07-18  
> **Owner Acceptance:** 2026-07-18  
> **Stories:** PRH-012 … PRH-018  
> **Classification:** Platform Core — Operational Readiness

---

## Executive summary

This programme closes the remaining PCv2-01 operational readiness slice: production deployment / upgrade / checklist documentation, commercial onboarding **design** with monitoring hooks, audit completeness review, and a local Playwright production smoke suite. M17 CI wiring, Vault, provisioning, and OSS adapters remain out of scope.

---

## Deliverables

| Story   | Artefact                                                                                 |
| ------- | ---------------------------------------------------------------------------------------- |
| PRH-012 | `docs/governance/APZHUB-Production-Deployment-Guide.md`                                  |
| PRH-013 | `docs/governance/APZHUB-Platform-Upgrade-Rollback-Guide.md`                              |
| PRH-014 | `docs/governance/APZHUB-Production-Operations-Checklist.md`                              |
| PRH-015 | `docs/architecture/APZHUB-Tenant-Onboarding-Design.md` + `commercial-readiness-hooks.ts` |
| PRH-016 | `docs/sprint/PRH-012-018-audit-completeness-report.md` + authz audit contract tests      |
| PRH-017 | `testing/e2e/production-smoke/` · `pnpm test:production-smoke`                           |
| PRH-018 | This report + Programme Acceptance Report + CURRENT-* updates                            |
| Audit   | `pnpm audit:prh-012-018`                                                                 |

---

## Operational validation

| Check                                           | Result                  |
| ----------------------------------------------- | ----------------------- |
| Deployment / upgrade / checklist docs published | PASS                    |
| Commercial hooks catalogue (design-only)        | PASS                    |
| Audit gap report                                | READY WITH OBSERVATIONS |
| Production smoke suite present                  | PASS (local; CI → M17)  |
| Integration SDK                                 | Unchanged **1.0.0**     |

---

## Enabling fix (operational readiness)

Resolved pre-existing Next.js dynamic-route slug conflict that blocked local Playwright `webServer`:

- Moved `DELETE /api/v1/testing/traceability/{relationshipId}` → `/api/v1/testing/traceability/relationships/{relationshipId}`
- Updated OpenAPI + certification path checks

---

## Explicit limitations

- Full GitHub Actions CI deferred to **M17**
- Commercial provisioning implementation deferred to **OSS-100-12+ / PCv2-03**
- Vault / BullMQ / new OSS adapters excluded
- SIEM export deferred to **PCv2-05**

---

## Quality

| Gate                                      | Result     |
| ----------------------------------------- | ---------- |
| Unit tests (hooks + authz audit contract) | **4** PASS |
| `pnpm test:production-smoke`              | **4** PASS |
| `pnpm audit:prh-012-018`                  | PASS       |

---

## Stop condition

**ACCEPTED / CLOSED.** Owner Acceptance recorded. Bootstrap and recommend next programme only after this closure (lifecycle).

---

## See also

- [Sprint Guide](./PRH-012-018-Production-Hardening-Sprint-Guide.md)
- [Acceptance Report](../foundation/completion-reports/PRH-012-018-programme-acceptance-report.md)
