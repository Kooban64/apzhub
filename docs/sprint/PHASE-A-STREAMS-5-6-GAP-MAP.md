# PHASE A — Gap Map (Streams 5 ∥ 6)

| Field       | Value                                                                                                                                              |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status      | Living — accompanies Phase A code                                                                                                                  |
| Authority   | [OWNER-UX-STREAMS-PROGRAMME-ORDER](../decisions/OWNER-UX-STREAMS-PROGRAMME-ORDER.md) **ACCEPTED**                                                  |
| Specs       | [UX-STREAM-005](../ux/UX-STREAM-005-platform-shell-design-system.md) · [UX-STREAM-006](../ux/UX-STREAM-006-tenant-identity-rbac-administration.md) |
| First proof | APZOR Support Agent vertical (org function → products → provision → filtered shell)                                                                |

> Gap-map existing implementation first. Preserve what is correct. No parallel IAM or shell.

---

## KEEP (extend in place)

| Area           | Path                                               | Note                                                                               |
| -------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------- |
| AuthN          | `packages/auth`                                    | BetterAuth + tenant session fields                                                 |
| Tenancy        | `packages/platform-identity`                       | Tenants, memberships                                                               |
| AuthZ          | `packages/platform-authorization`                  | PermissionService, RoleService, EffectivePermissionService — **sole AuthZ engine** |
| Session bridge | `apps/web/lib/session-permission-context.ts`       | Session → AuthZ → workbench                                                        |
| Nav filter     | `packages/workbench-framework`                     | Permission-filtered registry                                                       |
| Shell chrome   | `packages/ui` ShellLayout / ActivityBar / Header   | Skeleton — extend, don’t replace                                                   |
| Workbench      | `packages/workspace` DesktopShell                  | Palette, search, quick actions, notifications                                      |
| Catalogue      | `apps/web/lib/commercial/*`                        | Products, entitlements, product gates                                              |
| IAM ledger     | `apps/web/lib/iam/*`                               | Exists — must wire into AuthZ, not fork                                            |
| Provisioning   | `packages/platform-provisioning`                   | Reuse for joiner enablement                                                        |
| Org metadata   | `packages/identity-contracts`, `identity-core`     | Staff-function SoR candidates                                                      |
| Tenant switch  | `apps/web/components/operator/tenant-switcher.tsx` | Reuse in workbench header                                                          |
| Theme          | `packages/theme`                                   | Tokens                                                                             |

---

## PARTIAL

| Gap                                                      | Action                                                                   |
| -------------------------------------------------------- | ------------------------------------------------------------------------ |
| Five layers collapsed (persona grants product wildcards) | Staff function = metadata/template; product roles via RoleAssignment     |
| Support Agent persona = support.* only                   | Need Support/Agent + Time/Employee + Knowledge/Contributor + queue scope |
| Invite → `pending:email` only                            | Create BetterAuth user + membership + RoleAssignment + grants            |
| Soft-open empty entitlements                             | Hard-filter Activity Bar / modules                                       |
| Header missing Org/Product switchers                     | Add to DesktopShell (reuse tenant switcher)                              |
| Home from demo persona kinds                             | Compose from effective access                                            |
| Dual OperatorShell vs DesktopShell                       | One authenticated shell for tenant users                                 |
| APZOR = default tenant + free-all-suites                 | Ordinary tenant + normal subscriptions                                   |
| File SoR for IAM/commercial                              | Prefer Postgres; don’t invent second AuthZ                               |
| No User Inspector                                        | Thin review / inspector for vertical; signature later                    |

---

## MISSING (vertical proof)

1. Staff-function templates (Customer Support → suggested products/roles)
2. Product role catalogue for Support / Time / Knowledge
3. Queue resource scope
4. Joiner provision orchestration (user → membership → grants → roles)
5. Org + Product switchers on DesktopShell header
6. Hard entitlement ∩ permission filter (remove, don’t disable)
7. Support-oriented Home from effective access
8. APZOR ordinary-tenant seed
9. Minimal create/provision/review (User Inspector slice)
10. Positive + negative tests for Support Agent

---

## RISKS

- Parallel IAM (`platform-authorization` + file IAM + identity packages)
- Parallel shells (Operator vs Desktop)
- `superadmin` / `"*"` bypass smell
- APZOR special-casing
- Persona-as-permission
- Soft-open bootstrap masking entitlement bugs

---

## Persona vertical sequence (Owner)

| #   | Staff function          | Status                                                                                                                    |
| --- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 1   | Customer Support        | **Certified** (live `:3300`)                                                                                              |
| 2   | Engineering / Developer | **Certified** (live `:3300`)                                                                                              |
| 3   | Finance                 | **Certified** (live `:3300`) — Documents requires `pkg.apzprd.workspace` on demo org                                      |
| 4   | Compliance              | **Certified** (live `:3300`) — auditor docs role (no upload QA); ≠ platform `/compliance`                                 |
| 5   | Executive               | **Certified** (live `:3300`) — overview products only; knowledge viewer (create QA is registry quirk on `knowledge.view`) |
| 6   | QA                      | **Certified** (live `:3300`) — QEP/Projects/Time; no PEN (Security vertical)                                              |
| 7   | Security / Pentester    | **Certified** (live `:3300`) — PEN/Documents/Time; no QEP/Support                                                         |

### Vertical cert notes

- Staff function = template only; AuthZ = `RoleAssignment` product roles on BetterAuth users.
- Home kinds use **org-job** slugs (`finance-staff`, `compliance-officer`, …) so shared product roles (e.g. analytics-viewer) do not collide.
- Demo org Documents entitlement requires `pkg.apzprd.workspace` (subscribe via Org Console if seed lag).
- Documents **auditor** has no `document.write` → no `qa-upload-document`.
- Phase A remaining debt: **closed in Phase G** (queue scopes · shell policy · free-all retirement · Playwright smoke). See [PHASE-G-STREAMS-5-6-HORIZONTAL-GAP-MAP](./PHASE-G-STREAMS-5-6-HORIZONTAL-GAP-MAP.md) — **CERTIFIED 100%**.

## FIRST VERTICAL — touch order

2. Wire create/invite → BetterAuth + RoleAssignment + product grants — **done** (`provision:true`)
3. Entitlement ∩ permission hard filter on session/workbench — **done** (workbench + search + quick actions)
4. Support Home from effective access — **done** (`tenant_support`)
5. Org/Product header switchers (reuse) — **done** (`WorkbenchHeaderChrome`)
6. APZOR ordinary subscription seed — **done** (`ensureApzorOrdinarySubscriptions`; free-all opt-in only)
7. Thin create/provision/review UI — **done** (Inspect access + provision password)
8. Tests + live dogfood — **done** (unit + provision→login on `:3300`; Playwright cert ready)
9. Shell AuthZ includes product roles when `productKey=platform` — **done**
