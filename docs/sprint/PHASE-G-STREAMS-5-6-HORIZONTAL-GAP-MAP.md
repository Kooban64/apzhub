# PHASE G — Gap Map (Streams 5∥6 horizontal close)

| Field     | Value                                                                                                                                                                      |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status    | **COMPLETE · CERTIFIED 100%** — 2026-08-16                                                                                                                                 |
| Authority | [OWNER-UX-STREAMS-PROGRAMME-ORDER](../decisions/OWNER-UX-STREAMS-PROGRAMME-ORDER.md) · [SPR-UX-PHASE-G-STREAMS-5-6-HORIZONTAL](./SPR-UX-PHASE-G-STREAMS-5-6-HORIZONTAL.md) |
| Prior     | [PHASE-A-STREAMS-5-6-GAP-MAP](./PHASE-A-STREAMS-5-6-GAP-MAP.md) — seven personas **CERTIFIED**; horizontal debt closed here                                                |

> Gap-map first. Preserve DesktopShell + OperatorShell roles; do not invent a third shell. No parallel AuthZ.

---

## Ship tracking

| ID  | Ship                                   | Status               |
| --- | -------------------------------------- | -------------------- |
| G0  | Sprint + registry                      | **Done**             |
| G1  | Entitlement hard-mode · ordinary APZOR | **Done**             |
| G2  | Shell policy (tenant vs platform)      | **Done**             |
| G3  | Support queue/group resource scopes    | **Done**             |
| G4  | Certify horizontal close               | **Done · CERTIFIED** |

### G1 notes

- Console uses `ensureApzorOrdinarySubscriptions` / `apzor.ensure_ordinary_subscriptions`
- `ensureApzorAllSuitesFree` opt-in only (`APZHUB_APZOR_ALL_SUITES_FREE` / tests)
- Soft-open empty ledger gated: production hard-deny; CE via `APZHUB_CE_BOOTSTRAP`

### G2 notes

- Contract: `apps/web/lib/shell/shell-policy.ts` — OperatorShell for platform personas; DesktopShell for `tenant_*` / org_member
- `home-context.shellFamily` exposes the policy to clients
- Full chrome unify deferred (honest dual-shell)

### G3 notes

- Grants: `support.queue:{groupId}` · unrestricted with `support.queue.*` / `support.*`
- List/get Support requests + groups filtered under scope

### G4 notes

- Unit: soft-product-access · shell-policy · queue-scope · provisioning ordinary
- Playwright: `testing/playwright/e2e/phase-g-streams-5-6-horizontal.spec.ts` · `pnpm test:e2e:phase-g`
  (session/API smoke for shellFamily + entitlements; DesktopShell UI remains in `spr-001` under `pnpm test:e2e`)
- Included in CI via `pnpm test:e2e` (full suite)

---

## Certification

| Check                                | Evidence                                                         |
| ------------------------------------ | ---------------------------------------------------------------- |
| Empty ledger hard-deny in production | `soft-product-access.test.ts`                                    |
| Console ordinary APZOR (no free-all) | console route + catalogue button                                 |
| Shell family policy                  | `shell-policy.test.ts` + Playwright home-context smoke           |
| Support queue scopes                 | `queue-scope.test.ts` + Support list/get gate                    |
| Playwright smoke against this build  | `phase-g-streams-5-6-horizontal.spec.ts` — **4 passed** (G4 run) |

**Verdict:** Phase G horizontal Shell/RBAC close **CERTIFIED 100%**. Streams 5∥6 horizontal debt from Phase A **closed**. Remaining chrome unify / Projects-repo scopes are later programme work, not Phase G blockers.

---

## Risks (accepted)

- CE local dogfood must keep opt-in bootstrap (`APZHUB_CE_BOOTSTRAP=true`)
- Full Operator→Desktop merge remains out of scope
- Queue scopes start with Support groups; Projects/repos → **Phase H**
