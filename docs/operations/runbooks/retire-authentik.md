# Retire Authentik (after APZPRD BetterAuth path works)

| Field        | Value                                                                                         |
| ------------ | --------------------------------------------------------------------------------------------- |
| Status       | **CHECKLIST — not yet GO**                                                                    |
| Authority    | Owner                                                                                         |
| Prerequisite | [SPR-APZPRD-001](../../sprint/SPR-APZPRD-001-betterauth-productivity-workspace.md) acceptance |
| Decision     | [OWNER-BETTERAUTH-SOLE-AUTHN](../../decisions/OWNER-BETTERAUTH-SOLE-AUTHN.md)                 |

## Do not stop Authentik until all are true

1. **APZHUB login** uses BetterAuth only (`BETTER_AUTH_URL` / port 3300 path). No user journey depends on Authentik for APZHUB.
2. **Productivity suite** users reach `/workspace` with entitled modules via entitlements (SPR-COMM).
3. **Engine handoff** for in-scope products (at least Projects or Support) works via APZHUB adapter credentials — not nginx Authentik forward-auth for that journey.
4. **Legacy vhosts** that still need Authentik are inventoried; either migrated or explicitly kept with Owner exception.
5. **Backup** of Authentik DB / compose config taken.
6. **Owner GO** recorded to stop `apz-authentik-*` containers.

## Rollback

Restart Authentik compose services; restore gateway forward-auth for listed vhosts only.

## Honesty

Stopping Authentik early will break legacy host apps still behind forward-auth. APZHUB itself must not be one of them.
