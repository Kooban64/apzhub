# SPR-APZPEN-009 — Operator UX close (assign / evidence / manual findings)

> **Status:** **DELIVERED** — 2026-08-14  
> **Depends on:** SPR-APZPEN-008  
> **Pillar:** [APZPEN Vision](../strategy/APZPEN-ENTERPRISE-SECURITY-ASSURANCE-PLATFORM.md)

## Goal

Close remaining operator vs portal asymmetry and polish inventory / report / certification surfaces — without starting deferred mega-programmes (Security Graph depth, immutable ledger, non-GitHub SCM, PostgreSQL SoR).

## Delivered

| Item                  | Notes                                                                         |
| --------------------- | ----------------------------------------------------------------------------- |
| Shared controls       | `finding-operator-controls.tsx` — status, assign/evidence, manual create      |
| Findings / Engagement | Full action parity + assign/evidence + manual finding form                    |
| Workflow queues       | Remediation / Retests / Evidence use same action bar; evidence attach on gaps |
| Certification         | Certify CTA + report link on board                                            |
| Assets                | Environment, engagement links, open finding count                             |
| Reports               | Query deep-link, auto-preview, markdown download; link from engagement        |
| Portal                | Renders remediation guidance; severity/status filters                         |

## Non-goals (still deferred)

Security Graph depth · immutable certification ledger · non-GitHub SCM · PostgreSQL SoR · file evidence vault
