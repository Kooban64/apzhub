# SPR-COMM-001 — Catalogue packages, entitlements, tenant switch

> **Status:** **DELIVERED** — 2026-08-14  
> **Authority:** [SaaS Commercial Model](../strategy/commercial/SAAS-COMMERCIAL-MODEL.md) (**LOCKED**)  
> **Parent:** [APZOR Commercial Pillars](../strategy/APZOR-COMMERCIAL-PILLARS.md)

## Goal

Land the commercial model in code:

1. Catalogue **packages** (APZPRD compositions) + `workflow` / `knowledge` / `law` product keys
2. **Package → module** subscription expansion
3. **Entitlement resolution** helper (tenant offerings ∩ user grants)
4. **Tenant switch** API (`activeTenantId`)
5. Soft APZPEN product gate when org has subscriptions

## Delivered

| Item                             | Location                                          |
| -------------------------------- | ------------------------------------------------- |
| Package catalogue                | `apps/web/lib/commercial/catalogue.ts`            |
| `subscribeOrganisationToPackage` | `apps/web/lib/commercial/provisioning.ts`         |
| `resolveTenantEntitlements`      | `apps/web/lib/commercial/resolve-entitlements.ts` |
| Soft APZPEN product gate         | `apps/web/lib/apzpen/access.ts`                   |
| `POST /api/v1/me/active-tenant`  | set `activeTenantId`                              |
| `GET /api/v1/me/tenants`         | list memberships                                  |
| Org console `packages.subscribe` | `/api/v1/org/console`                             |
| Home context entitlements        | `/api/v1/me/home-context`                         |

## Non-goals (still deferred)

Full billing engine rewrite · marketing host cutover · Professional Tool Access UI
