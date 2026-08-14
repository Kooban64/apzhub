# APZPRD — Enterprise Productivity Platform

> **Status:** **OWNER-DIRECTED PILLAR VISION** — 2026-08-13  
> **Commercial pillar:** APZPRD (illustrative external: APZ Workspace)  
> **Executive question:** _Can our people work effectively?_  
> **Parent strategy:** [APZOR-COMMERCIAL-PILLARS](./APZOR-COMMERCIAL-PILLARS.md)  
> **Engineering guide:** existing productivity products under `docs/products/` (Projects, Time, Support, Workflow, Analytics, Documents, Knowledge) + Workbench frameworks  
> **Does not authorise:** unbounded implementation — named sprint guides required

---

## Positioning (locked)

> **APZPRD is an Enterprise Productivity Platform that gives every person one personalised workspace assembled from the projects, service management, time, workflow, knowledge, documents and analytics capabilities they are authorised to use — while specialist enterprise tools operate securely and transparently underneath the platform.**

**Not** an application launcher.  
**Not** Plane + Zammad + Kimai + Metabase + n8n behind a shared login.

Key principle:

> **Every user sees one APZPRD, but APZPRD dynamically assembles that person's workspace from the products, capabilities, permissions and data they are entitled to use.**

---

## Assembly model

```text
USER → Identity → Entitlements → Permissions → Capabilities
        → Personal Workspace → APZ Products → Platform Services
        → Adapters → Providers
```

| Layer                         | Question                                                           |
| ----------------------------- | ------------------------------------------------------------------ |
| **1 — Platform**              | Can this person enter APZPRD?                                      |
| **2 — Product**               | Which APZ products and capabilities?                               |
| **3 — Professional Provider** | Exceptional direct access to Plane / Zammad / Metabase / n8n / … ? |

Most users stop at Layer 2. Layer 3 is rare and audited.

---

## Product family (APZ-branded)

| APZ Product   | Example provider (masked) |
| ------------- | ------------------------- |
| APZ Projects  | Plane                     |
| APZ Support   | Zammad                    |
| APZ Time      | Kimai                     |
| APZ Workflow  | n8n                       |
| APZ Analytics | Metabase                  |
| APZ Documents | Paperless-ngx             |
| APZ Knowledge | Native / provider-backed  |

Customer buys **APZ Time**, not “Kimai with a logo.”  
Providers are replaceable behind stable APZ contracts.

---

## Roles: platform vs product

- **Platform roles:** Platform Admin, Org Admin, Standard User, Auditor, …
- **Product roles:** independent per product (e.g. Project Manager + Support Agent + Time Employee + Analytics Viewer).

**Product entitlement ≠ product permission.** Both enforced.  
Capability-based authz underneath (`projects.read`, `support.ticket.assign`, `time.entry.approve`, …).

---

## Composable commercial packaging (firm rule)

**Never require the whole suite to use one capability.**

Examples of sellable compositions (illustrative):

| Package           | Contents                                              |
| ----------------- | ----------------------------------------------------- |
| APZPRD Time       | Time only                                             |
| APZPRD Service    | Support + Knowledge                                   |
| APZPRD Delivery   | Projects + Time + Knowledge + Analytics               |
| APZPRD Operations | Support + Projects + Workflow + Analytics + Knowledge |
| APZPRD Enterprise | Full productivity platform                            |

One codebase. Entitlements shape the experience.  
Licensing by product/seat/capability — not all-or-nothing.

---

## Provisioning lifecycle

Grant/remove product → entitlement + role → provider identity mapping → provider permissions → verify → audit → workspace update.

Support **Joiner / Mover / Leaver** and **organisation templates** (Support Agent, Project Manager, BI Analyst, …).

One **user inspector** shows platform + products + professional tools + provisioning health + audit.

---

## Workbench (shared APZHUB capabilities)

Permission-filtered:

- Global search
- Unified notifications
- Unified activity
- Personalisation (landing, favourites, theme)
- Quick actions (capability-derived)
- Command palette / deep links

Home answers: **What do I need to do today?** — never seven product tiles for everyone.

Cross-product flows (ticket → project task → notify) and Workflow orchestration across entitled products. Analytics may combine authorised product data.

---

## Professional Tools menu

Controlled escape hatch only when Layer 3 granted (e.g. Metabase ↗, n8n ↗). Normal UX stays clean.

---

## Navigation is dynamic

Time-only user: Home · Time · Knowledge  
Support agent: Home · Support · Time · Knowledge  
Manager: + Projects · Analytics · …  
Never show inaccessible products.

Persona workspaces (Employee, Support, Manager, Executive, Automation) are **views**, not separate apps.

---

## UX principles

Work first · permission-aware · progressive disclosure · contextual · consistent · fast · mobile-capable for timesheets/tickets/approvals/notifications.

---

## With APZQEP / APZPEN

Same identity ecosystem when licensed; **not** part of every APZPRD deployment. Independently purchasable.

---

## Ultimate measure of success

Users ask **what do I need to do today?** — not which product to open.  
One person with multiple functions gets **one workspace**.  
A Time-only customer gets a polished Time product on day one.

**Revision:** 1.0.0 · 2026-08-13
