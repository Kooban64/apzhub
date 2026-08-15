# SPR-APZQEP-210 — Product-definition closeout (full MVP completeness)

> **Status:** **AUTHORISED · IN PROGRESS** — 2026-08-14  
> **Parent posture:** V1.1 Caps A–F **CLOSED**; SPR-APZQEP-200 (201–204) **DELIVERED**  
> **Scope class:** Product-definition / USER-WORKFLOWS completeness (Owner option **2**)  
> **Does not:** Reopen Cap kernels · authorise APZQEP-166 · Faraday/Kali UI · external AI SoR

## Outcome

APZQEP matches **product-definition MVP** and **USER-WORKFLOWS** for a 100% complete usable product: every MVP catalogue module has an honest, permissioned surface; operator RBAC covers Cap domains; readiness includes risk/waivers; planned tools are available (live or clear ops path); parked items stay parked.

## Explicitly parked (not this programme)

| Parked                                                     | Reason                                                 |
| ---------------------------------------------------------- | ------------------------------------------------------ |
| APZQEP-166 / ES-004                                        | Not authorised                                         |
| External AI providers (163A)                               | Not authorised; governed assist stays optional/flagged |
| Faraday product · Kali UI module · Greenbone as QEP module | Flagship F11 Out                                       |
| M16 Knowledge / M18 MCP depth                              | Phase 2+ / entitlement                                 |
| Caps A–F reopen                                            | COMPLETE — do not reopen                               |
| Full project ABAC beyond thin ACL                          | Separate authz programme                               |

## Finite backlog (must-have)

| ID        | Sprint slice | Gap                                                                                                                                                          |
| --------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **210-A** | Auth         | Seed `qep-operator` / `qep-reader` with Cap domain keys (evidence, requirements, plan, execution, verification, risk, admin, audit, design, reporting alias) |
| **210-B** | Honesty      | Align `qep-types` ↔ `module.yaml` ↔ router; catalogue aliases for M04/M06/M15 → Cap surfaces                                                                 |
| **210-C** | MVP stubs    | Un-stub **M11 Risk**, **M20 Administration**, **M21 Audit**, **M05 Verification Design** with usable MVP panes                                               |
| **210-D** | Readiness    | Waivers / Ready-with-qualifications (WF-25/35) + risk aggregation into Release Readiness                                                                     |
| **210-E** | Tools        | Typst PDF path; Integrations live-wire runbooks; Playwright/SCM ops defaults documented                                                                      |
| **210-F** | Docs         | PRODUCT-CATALOGUE / PRODUCT-STATUS / README honesty for 200 COMPLETE + 210 IN PROGRESS                                                                       |
| **210-G** | Cert path    | Co-approver surface + reproduce prior certification entry (WF-24/27) — thin but real                                                                         |

## Delivery order

1. **210-A + 210-F + 210-B** (P0 — unblock least-privilege and honesty) — **DONE (2026-08-14)**
2. **210-C** MVP module surfaces — **DONE** (Risk · Admin · Audit · Verification Design + Cap aliases)
3. **210-D + 210-G** cert-path DEF holes — **IN PROGRESS** (risk/waivers on Readiness; co-approver / reproduce pack next)
4. **210-E** tool availability / ops — pending

## Delivery record (partial)

- Operator/reader seeds include Cap domain permission keys (`qep.evidence.*`, plan, execution, verification, requirements, risk, admin, audit, design).
- Catalogue honesty: M05/M11/M17/M20/M21 enabled; M04/M06/M15 alias Cap Suites / Test Execution / Enterprise Reporting.
- MVP UIs + APIs: `/workspace/qep/risk`, `administration`, `audit`, `verification-design`; `GET/POST /api/v1/qep/risk`, `GET /api/v1/qep/audit`.
- Release Readiness checklist includes risk mitigate/waive and **Ready with qualifications**.
- Docs: PRODUCT-CATALOGUE, PRODUCT-STATUS, docs/README, strategy README point at SPR-210.

## Acceptance (programme)

1. Operator without `qep.*` wildcard can use Caps A–F + MVP modules under least privilege.
2. No catalogue `enabled` module routes to “not wired” unavailable.
3. Risk, Admin, Audit, Verification Design are `active` with real UI (not stub unavailable).
4. Release Readiness can record waiver / qualification disposition.
5. Docs mark SPR-200 COMPLETE and SPR-210 progress honestly.
6. Parked items remain parked.

## Non-goals

Redesign V1.1 SoR · multi-SCM expansion (180) · Automation Expansion (170 broad) · Superadmin console redesign (separate UI programme).
