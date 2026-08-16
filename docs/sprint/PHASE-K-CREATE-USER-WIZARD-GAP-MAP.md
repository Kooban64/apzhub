# PHASE K — Gap Map (Create-user wizard)

| Field     | Value                                                                                                  |
| --------- | ------------------------------------------------------------------------------------------------------ |
| Status    | **COMPLETE · CERTIFIED 100%** — 2026-08-16                                                             |
| Authority | [SPR-UX-PHASE-K-CREATE-USER-WIZARD](./SPR-UX-PHASE-K-CREATE-USER-WIZARD.md) · Stream 6 §§31–39 · S6-04 |

## Baseline (before Phase K)

| Surface                    | State                                                                |
| -------------------------- | -------------------------------------------------------------------- |
| Org Admin invite form      | Flat single panel — email, template, products, provision checkbox    |
| `POST /api/v1/iam/members` | Invite + provision (staff function, productKeys) — no scopes/tools   |
| User Inspector             | Flagship tabs (Phases I–J) — inspect after create                    |
| Resource scopes            | Enforced for Support/Projects/Source (Phases G–H) — not on create UX |
| Professional Tools ledger  | Org page grant/revoke — not wired into create flow                   |

## Ship tracking

| ID  | Ship                       | Status               |
| --- | -------------------------- | -------------------- |
| K0  | Sprint + registry          | **Done**             |
| K1  | Wizard UI                  | **Done**             |
| K2  | Scope + PT overlays on API | **Done**             |
| K3  | Unit + closeout            | **Done · CERTIFIED** |

### Implementation notes

- UI: `apps/web/components/iam/create-user-wizard.tsx`
- Host: `apps/web/components/iam/org-admin-members-view.tsx`
- Overlays: `apps/web/lib/iam/provision-overlays.ts`
- Postgres: `upsertPostgresUserScopedPermissions`
- Proof: `pnpm exec vitest run apps/web/lib/iam/provision-overlays.test.ts`

**Verdict:** Phase K **CERTIFIED 100%** — review-before-provision create-user wizard + scope/PT overlays.
