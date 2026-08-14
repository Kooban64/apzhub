# SPR-COMM-002 — Org packages UI, tenant switch, project source bindings

> **Status:** **DELIVERED** — 2026-08-14  
> **Authority:** [SaaS Commercial Model](../strategy/commercial/SAAS-COMMERCIAL-MODEL.md) (**LOCKED**)  
> **Prerequisite:** [SPR-COMM-001](./SPR-COMM-001-catalogue-entitlements-tenant-switch.md) **DELIVERED**  
> **Parent:** [APZOR Commercial Pillars](../strategy/APZOR-COMMERCIAL-PILLARS.md)

## Goal

Continue commercial land after COMM-001:

1. **Org admin UX** — subscribe named packages; show module entitlements
2. **Tenant switch UI** — header control on `activeTenantId` APIs
3. **Project source bindings** — when creating an APZQEP quality project or APZPEN engagement, attach Git (etc.) access details

## Delivered

| Item                             | Location                                          |
| -------------------------------- | ------------------------------------------------- |
| Package subscribe UI             | `/org/subscriptions`                              |
| Tenant switcher                  | Operator shell header                             |
| Project source ledger            | `lib/commercial/project-source-bindings.ts`       |
| Provider catalogue (client-safe) | `lib/commercial/project-source-catalogue.ts`      |
| Shared create fields             | `components/commercial/project-source-fields.tsx` |
| QEP create + attach              | Portfolio / Projects UI + APIs                    |
| APZPEN create + list/detail      | Engagements UI + APIs                             |

## Source bindings (design lock)

| Decision         | Choice                                                                       |
| ---------------- | ---------------------------------------------------------------------------- |
| Scope            | **Project / engagement based** — not a free-floating org SCM setting         |
| Products         | **APZQEP (`qep`) + APZPEN (`pentest`) only** in this phase                   |
| Day-one provider | **GitHub** (`granted_read` or `customer_pipeline`)                           |
| Flexibility      | Provider union from `@apzhub/platform-scm` — non-GitHub typed as coming soon |
| Secrets          | `secretRef` only; never plaintext in binding ledger                          |
| Timing           | Bind at create (or attach later on the same project/engagement)              |

## Non-goals (still deferred)

APZPRD source binding · full GitLab/ADO adapters · OAuth install wizard polish · org-level SCM catalogue page · auto-register SCM runtime from binding
