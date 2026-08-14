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

**KNW-H6 Memory Companion harden (accepted locally):** `knowledge.manage` + steward role; Wave A sidebar; live memory on Home/Companion; in-product find; unmocked create→list→detail. Consumer overlays / AI / Paperless still deferred. Evidence: [apzknowledge/engineering/evidence/KNW-H6-MEMORY-COMPANION-HARDEN.md](./apzknowledge/engineering/evidence/KNW-H6-MEMORY-COMPANION-HARDEN.md).

**Outstanding:** Paperless adapter (entire); Documents upload; or explicit “Knowledge-only, Paperless later” product decision.

**Practically useful when:** (Knowledge) create/find organisational memory daily; **and/or** (Documents) upload → store → retrieve via Paperless or native DMS path.

---

### B7 — APZQEP

| Layer    | Status                                          |
| -------- | ----------------------------------------------- |
| Shell UI | Large native workbench                          |
| Backend  | Native PostgreSQL packages                      |
| Engines  | Not Plane/Zammad/…; `qep-github` stub; not Kiwi |

**Tranche 2 Q0–Q4 (accepted locally):** Cap A–F + siblings on `APZQEP_*_PERSISTENCE_MODE=postgres`; evidence content SoR `APZQEP_EVIDENCE_STORAGE_PROVIDER=local`; automation `onEvidencePublished` wired; proven API loop suite → plan → spec → execution handoff → session → defect → evidence download. `GET /api/health` → `coreQePersistence.mode=postgres`.

**Tranche 2b Q5 (accepted locally):** `APZHUB_AUTOMATION_LIVE=true` + request `dryRun:false` → Chromium live; real PNG/trace bytes on artifacts; StoragePort local put (e.g. `apps/web/.data/qep-evidence/…/content.bin` verified PNG); `evidence://` refs; providers `liveModeEnabled`; UI live CTA; opt-in Vitest live smoke. Catalogue capture soft-fails associate lifecycle (storage is SoR for content).

**Tranche 2b Q6 (accepted locally):** Stub/unknown `/workspace/qep/*` paths no longer fall through to Requirements; honest `qep-unavailable` surface. `qep-types` module catalogue statuses synced to wired Cap/V1.1 surfaces.

**North star:** [apzqep/QUALITY-ECOSYSTEM-MAP.md](./apzqep/QUALITY-ECOSYSTEM-MAP.md) · **Flagship programme:** [apzqep/FLAGSHIP-PROGRAMME.md](./apzqep/FLAGSHIP-PROGRAMME.md) (Phases **F0–F11 complete** locally; **F12 report-pack scaffold**; Knowledge parallel).

**F1 GitHub Heartbeat (accepted locally):** server-only PAT (`credentialsSource=server_secrets`); public HMAC ingress 202; durable change events via sync + webhook (SHA/author/files proven); UI heartbeat panel; `APZQEP_SCM_PERSISTENCE_MODE=postgres`. Live API mode still opt-in (`APZHUB_SCM_GITHUB_LIVE=true`).

**F2 Quality Graph & Impact (accepted locally):** change → path/REQ/DEF edges → impact view → advisory regression pack → human accept → draft execution plan + SCM link. Suite convention `path:<prefix>` (or `customMetadata.pathPrefixes`).

**F3 Provider Evidence Matrix (accepted locally + deepen):** All 11 providers active (Playwright live + report ingest for Vitest/a11y/security/codequality/k6/selenium/cypress/appium/rest/visual); cert gates include security/performance/code quality; RC tiles evidence-driven; UUID catalogue IDs.

**F4 Certification Engine (accepted locally):** advisory gates (automation/CI/a11y-or-regression) → READY|BLOCKED score + explain-why; human GO/NO-GO via ApprovalEngine (immutable).

**F5 RC Quality OS face (accepted locally):** `/workspace/qep/rc` one composition — score + domain strip (provider-masked) + explain-why + evidence drill + human decision; Security/Performance honest empty; M13 nav active.

**F6 Quality Intelligence (accepted locally):** change-scoped advisory (gap/risk/regression/blocker) from graph + evidence + cert; artifact-linked explanations; never mutates cert/SoR; QI UI + `GET …/quality-intelligence/by-change/{id}`.

**F7 Test Design Assist (accepted locally):** change → rule-based advisory draft specs (REQ smoke + domain gaps) → human accept → draft Spec SoR + optional traces; QI deep-link; tools remain verification engines; never auto-run/certify.

**F8 Change Quality Journey (accepted locally):** one guided path per change (Impact → Design → Evidence → RC → GO/NO-GO); read-only glue + deep links; never auto-certifies; adoption face for teams.

**F9 Auto verification on change (accepted locally):** opt-in `APZHUB_AUTOMATION_ON_CHANGE` → Playwright smoke on durable commit/PR; evidence linked via F3; other domains still CI ingest; never auto GO/NO-GO.

**F10 Verification dispatch (accepted locally):** Option B — opt-in dispatch to GitHub Actions/webhook for Vitest/a11y/security/…; runners POST ingest; journey shows dispatch ledger; pen-test tools (Greenbone/Faraday/Kali) same pattern later.

**F11 Security/pen-test dispatch (accepted locally):** security pack (`trivy,semgrep,nuclei,zap` + optional greenbone); dual Docker clusters (testing vs pen-test); Kali runner image only; Faraday deferred; never auto-certify.

**F12 Professional report pack (scaffold):** draft Security Bill of Health from change-linked evidence (JSON/markdown; Typst PDF when installed); residual-risk + human sign-off fields; never auto-certify (RPT-009).

**Practically useful (F0–F11 + F12 draft export):** guided journey + auto smoke + quality + security dispatch packs + ingest + RC GO/NO-GO + draft audit pack. **Flagship claim:** quality score from governed evidence + human decision; tools/CI prove; journey/design/QI advise only; report pack is human-published.

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
