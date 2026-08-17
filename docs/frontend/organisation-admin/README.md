# Organisation Admin (Tenant Admin)

**Status:** Block 1–2 ACCEPTED · Block 3 implemented — final visual/capability pass  
**Authority:** Tenant-scoped — never Platform Admin  
**Reference tenant:** APZOR (ordinary tenant; no special behaviour)

## Acceptance state

| Slice                                                           | Status                       |
| --------------------------------------------------------------- | ---------------------------- |
| 1 Shell · Home · People                                         | **ACCEPTED**                 |
| 2 Teams · Roles · Products · Provisioning                       | **ACCEPTED**                 |
| 3 Workspace · Integrations · Security · Audit · Settings · Help | **IMPLEMENTED · FINAL PASS** |

Visual standard: dense enterprise UI · restrained chrome · tables · wide structured sections · compact filters · underlined tabs · honest states.

## Permanent regressions

- Tenant from authenticated session only — no client `tenantId`
- Gate: `identity.manage` for shell; surface APIs use more specific keys
- Nav display merge is **display-only** — APIs / PermissionService remain authoritative
- `org_admin → Platform Admin API = 403` (permanent)

```bash
pnpm test:e2e:organisation-admin-shell-home-people
pnpm test:e2e:organisation-admin-block2-access
pnpm test:e2e:organisation-admin-block3-governance
```

## Navigation (complete)

```text
Home
ORGANISATION — People · Teams · Roles & Access
PRODUCTS — Products · Provisioning
WORKSPACE — Workspace Settings · Integrations
GOVERNANCE — Security · Audit
────────────────
Help · Organisation Settings
```

## Block 3 surfaces

| Surface               | Path                                     | Data honesty                                                                                             |
| --------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Workspace Settings    | `/organisation-admin/workspace-settings` | Tenant name / metadata read-only; org defaults mostly Not configured; does not duplicate Personalisation |
| Integrations          | `/organisation-admin/integrations`       | Business catalogue (GitHub / M365 / Google Workspace) — Not configured; no engine providers              |
| Security              | `/organisation-admin/security`           | Member/session/admin counts where available; MFA/SSO Not configured; session policy platform-managed     |
| Audit                 | `/organisation-admin/audit`              | APE-Audit facade, session tenant only; empty feed OK                                                     |
| Organisation Settings | `/organisation-admin/settings`           | Platform tenant profile; org-admin persona list; lifecycle platform-managed                              |
| Help                  | `/organisation-admin/help`               | Thin topics; search Not configured                                                                       |

## Permission mapping

| Surface               | Nav / API any-of                                   |
| --------------------- | -------------------------------------------------- |
| People                | `identity.read` · `identity.manage` · `user.*`     |
| Teams                 | `team.*`                                           |
| Roles & Access        | `identity.read` · `identity.manage`                |
| Products              | `entitlement.read` · `catalogue.read`              |
| Provisioning          | `admin.operate`                                    |
| Workspace Settings    | `admin.operate` · `identity.manage`                |
| Integrations          | `admin.operate`                                    |
| Security              | `identity.manage` · `admin.read`                   |
| Audit                 | `identity.read` · `admin.read`                     |
| Organisation Settings | `admin.operate` · `identity.manage`                |
| Help                  | visible to gated users; API uses `identity.manage` |

**API authority:** every Organisation Admin route requires `identity.manage` first, then the surface any-of. Product grants such as `workspace.*` / `tenant.*` never unlock Tenant Admin APIs alone. Nav display merge remains display-only.

## Rules

- Reuse Stream 6 IAM / commercial / AuthZ / audit — no parallel configuration systems
- Never expose Plane / Zammad / Kimai / n8n / Metabase / Paperless / Postgres / Redis
- Do not manufacture Connected integrations or audit telemetry
- Suspension / termination of tenancy is Platform-managed
- Shell always shows **APZ · {Organisation} · Organisation Administration**

## Final Tenant Admin matrix

| Surface               | UI          | Backend                            | Real Data                       | Writes | Tests       |
| --------------------- | ----------- | ---------------------------------- | ------------------------------- | ------ | ----------- |
| Shell / Home          | Implemented | `/home`                            | Tenant + membership rollups     | No     | Block 1 e2e |
| People / Person       | Implemented | `/people`, `/people/[id]`          | Stream 6 IAM                    | No     | Block 1 e2e |
| Teams / Team detail   | Implemented | `/teams`, `/teams/[id]`            | Groups when present             | No     | Block 2 e2e |
| Roles & Access        | Implemented | `/roles-access`                    | Product roles + provenance      | No     | Block 2 e2e |
| Products / Detail     | Implemented | `/products`, `/products/[suiteId]` | Subscriptions + assignments     | No     | Block 2 e2e |
| Provisioning          | Partial     | `/provisioning`                    | Entitlement readiness; queue NC | No     | Block 2 e2e |
| Workspace Settings    | Partial     | `/workspace-settings`              | Name/metadata; defaults NC      | No     | Block 3 e2e |
| Integrations / Detail | Partial     | `/integrations`                    | Business catalogue; all NC      | No     | Block 3 e2e |
| Security              | Partial     | `/security`                        | Counts; MFA/SSO NC              | No     | Block 3 e2e |
| Audit                 | Partial     | `/audit`                           | Tenant-scoped; empty feed OK    | No     | Block 3 e2e |
| Organisation Settings | Partial     | `/settings`                        | Tenant profile + org-admins     | No     | Block 3 e2e |
| Help                  | Partial     | `/help`                            | Topic links; search NC          | No     | Block 3 e2e |

### Remaining honest `Not configured`

- Organisation default landing / theme / branding / default product / default team / feature flags
- Business integrations (GitHub, Microsoft 365, Google Workspace) — no Connected SoR yet
- MFA coverage reporting · Access reviews · Organisation SSO
- Audit providers (empty feed until attached)
- Primary / billing contacts
- Help search · Using APZ articles · Contact Support channel
- Provisioning job queue (Block 2)

**Tenant Administration is complete for Owner acceptance.** No QEP/PEN/PRD workbench work in this stream.
