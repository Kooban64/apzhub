# SPR-APZQEP-210 — Product-definition closeout (full MVP completeness)

> **Status:** **COMPLETE · DELIVERED** — 2026-08-15  
> **Parent posture:** V1.1 Caps A–F **CLOSED**; SPR-APZQEP-200 (201–204) **DELIVERED**  
> **Scope class:** Product-definition / USER-WORKFLOWS completeness (Owner option **2**)  
> **Does not:** Reopen Cap kernels · authorise APZQEP-166 · Faraday/Kali UI · external AI SoR · Authentik SSO implementation

## Outcome

APZQEP matches **product-definition MVP** and **USER-WORKFLOWS** for a complete usable product: MVP catalogue modules have honest, permissioned surfaces; operator RBAC covers Cap domains; readiness includes risk/waivers; dual human certification + reproduce; planned tools have live/ops paths; parked items stay parked.

## Explicitly parked (not this programme)

| Parked                                                     | Reason                                                    |
| ---------------------------------------------------------- | --------------------------------------------------------- |
| APZQEP-166 / ES-004                                        | Not authorised                                            |
| External AI providers (163A)                               | Not authorised; governed assist stays optional/flagged    |
| Faraday product · Kali UI module · Greenbone as QEP module | Flagship F11 Out                                          |
| M16 Knowledge / M18 MCP depth                              | Phase 2+ / entitlement                                    |
| Caps A–F reopen                                            | COMPLETE — do not reopen                                  |
| Full project ABAC beyond thin ACL                          | Separate authz programme                                  |
| Enterprise IdP / Authentik SSO wire-up                     | Platform IAM 007 follow-on — Admin documents honesty only |

## Finite backlog (must-have) — delivery

| ID        | Sprint slice                                     | Status        |
| --------- | ------------------------------------------------ | ------------- |
| **210-A** | Auth Cap domain seed                             | **DELIVERED** |
| **210-B** | Catalogue honesty + Cap aliases                  | **DELIVERED** |
| **210-C** | Risk · Admin · Audit · Verification Design       | **DELIVERED** |
| **210-D** | Readiness waivers / Ready with qualifications    | **DELIVERED** |
| **210-E** | Typst durable PDF + ops runbooks + env catalogue | **DELIVERED** |
| **210-F** | Docs honesty                                     | **DELIVERED** |
| **210-G** | Dual co-approver + reproduce prior pack          | **DELIVERED** |

## Acceptance (met)

1. Operator without `qep.*` wildcard can use Caps A–F + MVP modules under least privilege.
2. No catalogue `enabled` module routes to “not wired” unavailable.
3. Risk, Admin, Audit, Verification Design are `active` with real UI.
4. Release Readiness records risk mitigate/waive and Ready with qualifications.
5. Dual human authority for GO; distinct actors; reproduce snapshot for decided packs.
6. Typst PDF writes durable local manifest + audit; runbooks published.
7. Docs mark SPR-200 COMPLETE and SPR-210 DELIVERED.
8. Parked items remain parked.

## Delivery record

- Operator/reader seeds include Cap domain permission keys.
- M05/M11/M17/M20/M21 enabled; M04/M06/M15 alias Cap Suites / Test Execution / Enterprise Reporting.
- MVP APIs: `/api/v1/qep/risk`, `/api/v1/qep/audit`; certification dual authority + `/reproduce`.
- Release Readiness risk check + qualifications panel.
- Report pack PDF: durable `.data/qep-report-packs/{packId}/` + `pdf-manifest.json` + QEP audit.
- Ops runbooks: `qep-automation-live`, `qep-scm-github-live`, `qep-dispatch-record-only`, `qep-typst-report-pack`.
- Admin authentication posture panel (BetterAuth honesty; SSO not claimed).

## Non-goals (unchanged)

Redesign V1.1 SoR · multi-SCM expansion (180) · Automation Expansion (170 broad) · implementing Authentik SSO in this sprint.
