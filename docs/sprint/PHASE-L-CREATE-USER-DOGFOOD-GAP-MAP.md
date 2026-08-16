# PHASE L — Gap Map (APZOR create-user dogfood)

| Field     | Value                                                                                                      |
| --------- | ---------------------------------------------------------------------------------------------------------- |
| Status    | **COMPLETE · CERTIFIED 100%** — 2026-08-16                                                                 |
| Authority | [SPR-UX-PHASE-L-CREATE-USER-DOGFOOD](./SPR-UX-PHASE-L-CREATE-USER-DOGFOOD.md) · programme order §3 · S6-09 |

## Baseline

| Surface                        | State                                                              |
| ------------------------------ | ------------------------------------------------------------------ |
| Phase A Support Agent vertical | Provision → login → home (no Phase K overlays)                     |
| Phase K wizard + overlays      | CERTIFIED — UI + `resourceScopeGrants` / `professionalToolIds`     |
| User Inspector                 | Flagship tabs (I–J)                                                |
| S6-09 full persona matrix      | Partial — Phase A covers several; this phase closes create+overlay |

## Ship tracking

| ID  | Ship                         | Status               |
| --- | ---------------------------- | -------------------- |
| L0  | Sprint + registry            | **Done**             |
| L1  | Unit overlays → Inspector    | **Done**             |
| L2  | Playwright create-user smoke | **Done**             |
| L3  | Closeout                     | **Done · CERTIFIED** |

### Proof

```bash
pnpm exec vitest run apps/web/lib/iam/create-user-dogfood.test.ts
CI=true PLAYWRIGHT_WEB_PORT=3333 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3333 \
  ALLOW_DEMO_PERSONAS=true pnpm test:e2e:phase-l
```

**Verdict:** Phase L **CERTIFIED 100%** — Support Agent create path with queue scope + professional tool → Inspector → Support-shaped shell.
