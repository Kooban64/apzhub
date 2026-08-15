# Retire Authentik (after APZPRD BetterAuth path works)

| Field        | Value                                                                                                                                                           |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status       | **CHECKLIST — not yet GO**                                                                                                                                      |
| Authority    | Owner                                                                                                                                                           |
| Prerequisite | [SPR-APZPRD-001](../../sprint/SPR-APZPRD-001-betterauth-productivity-workspace.md) · [SPR-APZPRD-003](../../sprint/SPR-APZPRD-003-projects-workbench-deepen.md) |
| Decision     | [OWNER-BETTERAUTH-SOLE-AUTHN](../../decisions/OWNER-BETTERAUTH-SOLE-AUTHN.md) — **BetterAuth only; never expand Authentik**                                     |

## Do not stop Authentik until all are true

1. **APZHUB login** uses BetterAuth only (`BETTER_AUTH_URL` / port 3300 path). No user journey depends on Authentik for APZHUB.
2. **Productivity suite** users reach `/workspace` with entitled modules via entitlements (SPR-COMM).
3. **Engine handoff** for Projects works via APZHUB adapter credentials — not nginx Authentik forward-auth. Verify Projects **Readiness** shows Authentik used = **no**.
4. **Legacy vhosts** that still need Authentik are inventoried; either migrated or explicitly kept with Owner exception.
5. **Backup** of Authentik DB / compose config taken.
6. **Owner GO** recorded to stop `apz-authentik-*` containers.

## Rollback

Restart Authentik compose services; restore gateway forward-auth for listed vhosts only.

## Honesty

Stopping Authentik early will break legacy host apps still behind forward-auth. **APZHUB / Projects must not be one of them** — and already are not (BetterAuth + adapter). Do not add Authentik to the APZHUB login path while waiting for retirement GO.
