# SPR-POLISH-001 — Entitlements UX & shell consistency

> **Status:** **COMPLETE · DELIVERED** — 2026-08-15  
> **Depends on:** [SPR-ADOPT-002](./SPR-ADOPT-002-commercial-pillar-operator-dogfood.md) **COMPLETE**; [OWNER-APZPEN-REMAIN-PARKED](../decisions/OWNER-APZPEN-REMAIN-PARKED.md)  
> **AuthN:** **BetterAuth only**  
> **Does not:** Authentik · Cap reopen · APZPEN enterprise unpark · new commercial packages · workbench redesign

## Outcome

Operators who lack a commercial pillar see **why** (org not subscribed vs user not granted vs unavailable) instead of a generic deny or silent redirect — across Projects, QEP, and APZPEN soft gates.

## Ships

| ID  | Ship                          | Approach                                                                                       |
| --- | ----------------------------- | ---------------------------------------------------------------------------------------------- |
| P1  | Structured API denial details | `PRODUCT_ACCESS_DENIED` includes `details.reason` + `productKey`                               |
| P2  | Shared denial surface         | Reason-aware UI with CTAs to pricing / org members                                             |
| P3  | Soft-gate parity              | Projects · QEP · APZPEN use shared reason derivation (no silent APZPEN bounce for entitlement) |
| P4  | Org-admin grant labels        | Show catalogue product **name** beside raw key                                                 |

## Acceptance

1. Denied API responses expose structured `details.reason`.
2. Soft gates distinguish org vs user vs unavailable copy.
3. Deep-link to QEP/Projects/APZPEN without entitlement shows denial UI (bootstrap CE empty ledger still open).
4. Org admin grant checkboxes show human-readable names.
5. Unit tests cover reason derivation + API details shape.

## Non-goals

Silent Activity Bar “ghost” modules · billing redesign · Authentik · enterprise unpark.

## Delivery record

| ID     | Landed                                                   |
| ------ | -------------------------------------------------------- |
| **P1** | `requireProductAccess` → `details.reason` + `productKey` |
| **P2** | `ProductAccessDeniedView` + `softEvaluateProductAccess`  |
| **P3** | Projects · QEP · APZPEN OperatorGate soft gates          |
| **P4** | Org-admin grant labels via catalogue name                |
