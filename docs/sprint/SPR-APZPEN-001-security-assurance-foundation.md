# SPR-APZPEN-001 — Security Assurance Foundation

> **Status:** **DELIVERED** — continue via [SPR-APZPEN-002](./SPR-APZPEN-002-provider-ingest.md)  
> **Pillar:** [APZPEN Vision](../strategy/APZPEN-ENTERPRISE-SECURITY-ASSURANCE-PLATFORM.md)  
> **Parent:** [APZOR Commercial Pillars](../strategy/APZOR-COMMERCIAL-PILLARS.md)  
> **Date:** 2026-08-13

---

## Goal

Ship the smallest **robust** APZPEN product core — not a scanner dashboard:

**Engagement → Rules of Engagement → Scope → Findings → Retest request**

with automated tests at every layer. Scanners (ZAP, Trivy, Greenbone, …) remain providers; APZPEN owns the assurance model.

---

## In scope (this sprint)

1. Manifests: `modules/apzpen`, `services/apzpen`
2. Domain model + pure business rules (unit tested)
3. File-backed SoR store (tenant-scoped) + service orchestration (unit tested)
4. REST APIs under `/api/v1/apzpen/*`
5. Product shell `/apzpen` (Cursor chrome) — Home, Engagements, Findings, Assets (stub), Providers (stub)
6. Import findings from normalised security-pack shape (reuse QEP parsers later)
7. Catalogue / mode switcher alignment (`pentest` suite → APZPEN surface)

## Out of scope (later sprints)

- Live ZAP/Greenbone adapter orchestration
- Customer portal
- Full Security Graph / SBOM
- AI Security Intelligence
- Burp / MobSF integrations
- Immutable certification ledger (beyond assessment status)

---

## Acceptance

| #   | Criterion                                                                            |
| --- | ------------------------------------------------------------------------------------ |
| 1   | Cannot start testing without approved RoE                                            |
| 2   | Finding lifecycle transitions are validated                                          |
| 3   | Unit tests cover domain + store + service                                            |
| 4   | Authenticated API creates engagement, approves RoE, records finding, requests retest |
| 5   | `/apzpen` UI shows engagement posture — not a tool launcher                          |
| 6   | Docs indexed; vision remains authority for UX intent                                 |

---

## Test strategy

| Layer                    | Tool                                   |
| ------------------------ | -------------------------------------- |
| Domain / store / service | Vitest                                 |
| API (follow-on)          | Vitest handler tests where practical   |
| UI smoke                 | Playwright when auth fixture available |

**Build rule:** no domain merge without accompanying tests.
