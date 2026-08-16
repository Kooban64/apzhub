# PHASE G — Gap Map (Streams 5∥6 horizontal close)

| Field     | Value                                                                                                                                                                      |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status    | Living — Phase G **ACTIVE** (G1–G3 shipped this batch)                                                                                                                     |
| Authority | [OWNER-UX-STREAMS-PROGRAMME-ORDER](../decisions/OWNER-UX-STREAMS-PROGRAMME-ORDER.md) · [SPR-UX-PHASE-G-STREAMS-5-6-HORIZONTAL](./SPR-UX-PHASE-G-STREAMS-5-6-HORIZONTAL.md) |
| Prior     | [PHASE-A-STREAMS-5-6-GAP-MAP](./PHASE-A-STREAMS-5-6-GAP-MAP.md) — seven personas **CERTIFIED**; horizontal debt open                                                       |

> Gap-map first. Preserve DesktopShell + OperatorShell roles; do not invent a third shell. No parallel AuthZ.

---

## Ship tracking

| ID  | Ship                                   | Status   |
| --- | -------------------------------------- | -------- |
| G0  | Sprint + registry                      | **Done** |
| G1  | Entitlement hard-mode · ordinary APZOR | **Done** |
| G2  | Shell policy (tenant vs platform)      | **Done** |
| G3  | Support queue/group resource scopes    | **Done** |
| G4  | Certify horizontal close               | Later    |

### G1 notes

- Console uses `ensureApzorOrdinarySubscriptions` / `apzor.ensure_ordinary_subscriptions`
- `ensureApzorAllSuitesFree` opt-in only (`APZHUB_APZOR_ALL_SUITES_FREE` / tests)
- Soft-open empty ledger gated: production hard-deny; CE via `APZHUB_CE_BOOTSTRAP`

### G2 notes

- Contract: `apps/web/lib/shell/shell-policy.ts` — OperatorShell for platform personas; DesktopShell for `tenant_*`
- Full chrome unify deferred

### G3 notes

- Grants: `support.queue:{groupId}` · unrestricted with `support.queue.*` / `support.*`
- List/get Support requests + groups filtered under scope

---

## Risks

- CE local dogfood must keep opt-in bootstrap (`APZHUB_CE_BOOTSTRAP=true`)
- Full Operator→Desktop merge is out of scope; policy + redirects only
- Queue scopes start with Support groups; Projects/repos later
- Playwright CI against this build remains for G4
