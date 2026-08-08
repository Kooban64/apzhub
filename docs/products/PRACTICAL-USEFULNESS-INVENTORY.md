# APZHUB — Practical Usefulness Inventory

| Field     | Value                                                        |
| --------- | ------------------------------------------------------------ |
| Status    | **EVIDENCE** — not a programme · not Production Ready claims |
| Timestamp | 20260809T011500Z                                             |
| Purpose   | Honest gap map so we can finish one component at a time      |

**Paper claim:** 7/7 products Production Ready · Core Workbench shipped.  
**Practical reality:** Certification ≠ engines wired for daily use. Default integrations are **off**. No silent SSO to engines. Paperless adapter **absent**.

---

## How to use this

Work **one component at a time**. For each:

1. What exists (shell / API / adapter)
2. What blocks usefulness
3. Definition of “practically useful”
4. Ship that slice only

Share each component section with ChatGPT as needed.

---

## A. Platform (cross-cutting)

| #   | Component            | Exists                                | Blocks usefulness                           | Done when                                         |
| --- | -------------------- | ------------------------------------- | ------------------------------------------- | ------------------------------------------------- |
| P1  | Host cutover         | Caddy/nginx → `:3300`; Postgres/Redis | Web often not listening on 3300             | `https://apzhub…` serves login + shell reliably   |
| P2  | Better Auth          | Email/password login                  | Seed/reset/SMTP thin; no OIDC               | Operators can onboard users without console hacks |
| P3  | Permissions          | Seed + Postgres path                  | Dev `allow-all`; no engine role translation | Real grants gate products end-to-end              |
| P4  | Engine SSO handoff   | Architecture intent only              | Token/API-key only in adapters              | User opens product without engine login screen    |
| P5  | Engine provisioning  | Product enablement metadata only      | No Plane/Zammad/Kimai user sync             | New APZHUB user can work in engines               |
| P6  | Search (live)        | Ctrl+K + API                          | Meili/flags/indexing off by default         | Search returns real product hits                  |
| P7  | Notifications (live) | Inbox UI                              | Delivery/SMTP/intake thin                   | Real attention items appear                       |
| P8  | Activity (live)      | Stream UI                             | Often empty / in-memory                     | Durable cross-product stream                      |
| P9  | Workers              | Scripts exist                         | Not always-on in compose                    | Outbox/sync jobs run continuously                 |
| P10 | Audit query          | Facade                                | `providers: []`                             | Admin can query real audit                        |

---

## B. Seven products (end-to-end)

### B1 — APZ Projects ↔ Plane

| Layer        | Status                                             |
| ------------ | -------------------------------------------------- |
| Shell UI     | Strong (`/workspace/projects`, create/list/detail) |
| Platform API | Present                                            |
| Adapter      | `integrations/plane` — rich CRUD (mocked tests)    |
| Live wire    | **`PLANE_INTEGRATION_ENABLED` default false**      |

**Outstanding:** enable + token against host Plane; durable entity mapping; sprint HTTP gaps; SSO/provisioning; live CE proof.

**Practically useful when:** create project / task / list in APZHUB persists in Plane and reloads.

---

### B2 — APZ Support ↔ Zammad

| Layer     | Status                                           |
| --------- | ------------------------------------------------ |
| Shell UI  | Full inbox/create/detail                         |
| Adapter   | `integrations/zammad` CERTIFIED_WITH_LIMITATIONS |
| Live wire | **`ZAMMAD_INTEGRATION_ENABLED` default false**   |

**Outstanding:** enable + API token; OAuth absent; attachment delete; realtime off; SSO.

**Practically useful when:** open ticket in APZHUB appears in Zammad; reply syncs both ways (or documented one-way).

---

### B3 — APZ Time ↔ Kimai

| Layer     | Status                                     |
| --------- | ------------------------------------------ |
| Shell UI  | Full timesheet/activity/customer/tag       |
| Adapter   | `integrations/kimai` CERTIFIED_DOMAIN      |
| Live wire | Kimai **required** in prod (no memory SoR) |

**Outstanding:** enable + bearer token; approvals/reporting out of scope; SSO.

**Practically useful when:** log time in APZHUB → visible in Kimai; list reloads from Kimai.

---

### B4 — APZ Workflow ↔ n8n

| Layer        | Status                                    |
| ------------ | ----------------------------------------- |
| Shell UI     | Full workflow workbench                   |
| Platform SoR | Postgres runs/tasks/approvals             |
| Adapter      | `integrations/n8n` **read-only metadata** |

**Outstanding:** **no execute/activate/create via n8n**; OAuth rejected; dual historic workspaces.

**Practically useful when:** start/monitor a real automation from APZHUB (or consciously ship “platform orchestration only” and stop claiming n8n runtime).

---

### B5 — APZ Analytics ↔ Metabase

| Layer    | Status                                                  |
| -------- | ------------------------------------------------------- |
| Shell UI | Decision Companion + curated questions                  |
| Adapter  | `integrations/metabase` foundation (collections/health) |
| Embeds   | **Not implemented**                                     |

**Outstanding:** embed tokens; live dashboards; write ops; catalogue docs stale.

**Practically useful when:** user opens a Metabase dashboard/question inside APZHUB without leaving the shell.

---

### B6 — APZ Knowledge (+ Documents / Paperless)

| Product   | Status                                                         |
| --------- | -------------------------------------------------------------- |
| Knowledge | **Native Postgres** Memory Companion — works without engine    |
| Documents | Native metadata workbench — **no upload/create UI**; not a DMS |
| Paperless | **No `integrations/paperless*`** — legacy apz-stack only       |

**Outstanding:** Paperless adapter (entire); Documents upload; or explicit “Knowledge-only, Paperless later” product decision.

**Practically useful when:** (Knowledge) create/find organisational memory daily; **and/or** (Documents) upload → store → retrieve via Paperless or native DMS path.

---

### B7 — APZQEP

| Layer    | Status                                          |
| -------- | ----------------------------------------------- |
| Shell UI | Large native workbench                          |
| Backend  | Native PostgreSQL packages                      |
| Engines  | Not Plane/Zammad/…; `qep-github` stub; not Kiwi |

**Outstanding:** stub modules; SCM live path; ensure persistence flags on in prod; avoid confusing with legacy Testing/Kiwi.

**Practically useful when:** a QA team runs plan → execute → defect → evidence without leaving APZHUB (native path).

---

## C. Integrations matrix

| Engine    | Package                 | Auth today            | CRUD / ops           | Live proof  | Blocker for usefulness     |
| --------- | ----------------------- | --------------------- | -------------------- | ----------- | -------------------------- |
| Plane     | `integrations/plane`    | API key               | Rich                 | Mocked only | Flag off + SSO/provision   |
| Zammad    | `integrations/zammad`   | API token             | Strong tickets       | Mocked only | Flag off + OAuth/SSO       |
| Kimai     | `integrations/kimai`    | Bearer / legacy       | Domain CRUD          | Mocked only | Flag off + must-on in prod |
| n8n       | `integrations/n8n`      | API key / PAT / basic | **Read-only**        | Mocked only | Execute unlock             |
| Metabase  | `integrations/metabase` | API key / session     | Health + collections | Mocked only | Embed issuance             |
| Paperless | **ABSENT**              | —                     | —                    | —           | Entire adapter             |

Other present: Meilisearch, GitHub Actions, GitLab CI (read), qep-github stub.

---

## D. Recommended order (one at a time)

Evidence-based sequence for “practically useful”:

| Order | Component                                            | Why first                                          |
| ----- | ---------------------------------------------------- | -------------------------------------------------- |
| 1     | **P1 Host cutover**                                  | Nothing else usable if shell isn’t reliably up     |
| 2     | **B3 Time ↔ Kimai** _or_ **B2 Support ↔ Zammad**     | Clear CRUD; adapters mature; immediate daily value |
| 3     | **B1 Projects ↔ Plane**                              | Highest visibility product                         |
| 4     | **P6 Search live**                                   | Workbench earns value once products have data      |
| 5     | **B5 Analytics embeds** _or_ **B4 Workflow execute** | Pick by evidence of demand                         |
| 6     | **Paperless / Documents**                            | Only if document friction is proven #1             |
| 7     | **P4/P5 SSO + provisioning**                         | Hard gate for “one login feels finished”           |

---

## E. Standing rule

Do not open a new methodology programme.

For the chosen component: Constitution check → one-page inventory → build → prove against **live** engine → ship.

Next conversation starts with: which component is #1?
