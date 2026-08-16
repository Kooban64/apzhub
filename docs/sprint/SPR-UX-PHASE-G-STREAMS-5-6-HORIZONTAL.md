# SPR-UX-PHASE-G — Streams 5∥6 horizontal close (Phase A debt)

> **Status:** **APPROVED · ACTIVE** — 2026-08-16  
> **Authority:** [OWNER-UX-STREAMS-PROGRAMME-ORDER](../decisions/OWNER-UX-STREAMS-PROGRAMME-ORDER.md) · Phase A already authorised  
> **Gap map:** [PHASE-G-STREAMS-5-6-HORIZONTAL-GAP-MAP](./PHASE-G-STREAMS-5-6-HORIZONTAL-GAP-MAP.md)  
> **Specs:** [UX-STREAM-005](../ux/UX-STREAM-005-platform-shell-design-system.md) · [UX-STREAM-006](../ux/UX-STREAM-006-tenant-identity-rbac-administration.md)  
> **Depends on:** Phase A verticals certified · Phases B–F complete  
> **Does not:** New Owner ADR · Reopen parked APZPEN enterprise · Rebuild shells from zero

## Intent

Close **Phase A horizontal** Shell/RBAC debt after seven persona verticals certified:

| Debt (Phase A gap map)                    | Phase G ship                           |
| ----------------------------------------- | -------------------------------------- |
| Soft-open / free-all masking entitlements | Hard entitlement mode + ordinary APZOR |
| Dual OperatorShell vs DesktopShell        | Shell policy: platform vs tenant       |
| Queue resource scope                      | Support group/queue scope grants       |
| Playwright CI against this build          | Smoke + unit certs                     |
| Stale Stream 5/6 “NOT STARTED” registry   | Reconcile docs                         |

## Signature ships

| ID  | Ship                                                                          |
| --- | ----------------------------------------------------------------------------- |
| G0  | Sprint + gap map + registry reconcile                                         |
| G1  | Entitlement hard-mode + retire free-all console path (ordinary subscriptions) |
| G2  | Shell policy — tenant users → DesktopShell; OperatorShell = platform/admin    |
| G3  | Support queue/group resource scopes (AuthZ + list filter)                     |
| G4  | Horizontal cert tests + Phase G closeout when DoD met                         |

## Definition of Done

- Empty entitlement ledger no longer soft-opens in hard mode / production default
- Console does not advertise “free-all” for APZOR
- Documented shell split; tenant productivity stays on DesktopShell
- Queue/group scopes enforceable for Support agents
- Gap map CERTIFIED when G1–G3 Done; Streams 5/6 horizontal status updated
