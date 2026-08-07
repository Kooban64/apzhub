# APZ Projects 3.0 — Home & Project Cockpit

## Engineering Readiness Assessment

**Product under design:** APZ Projects Release 3.0  
**Scope:** Landing / Attention Home · My Projects · Project Cockpit · Personal workspace · Executive summary · Priorities · Commitments · Health · Milestones · Risks · Decisions · Approvals · Activity · Enterprise Context · Responsive · Mobile  
**Mode:** Design Support — **no redesign in this document**; prepare for immediate build once Product Design is approved  
**Benchmark:** Jira · Linear · Monday · ClickUp · Microsoft Project · Asana · Azure DevOps — improve, never copy

---

## 1. Current State

### 1.1 Landing (`/workspace/projects`)

| Aspect            | As-built                                                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Component         | `ProjectsDashboardView`                                                                                                                          |
| Behaviour         | Title “Dashboard”; lists up to 10 active projects in a **table**; onboarding dismiss; quick actions in aside                                     |
| Question answered | Weak — “overview of active projects”, not “What needs my attention?”                                                                             |
| Data              | `listProjects({ status: "active" })` only — **no** cross-project health aggregation, approvals, velocity, customer silence, or attention ranking |

### 1.2 My Projects / list

| Aspect         | As-built                                                                                              |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| List           | `ProjectsListView` — table                                                                            |
| Cards          | **None** — no story-card surface with progress / health / next milestone / risks / waiting / blockers |
| Health on list | **Not** loaded per project on home (health exists only per-project via delivery APIs)                 |

### 1.3 Personal workspace

| Aspect               | As-built                                                     |
| -------------------- | ------------------------------------------------------------ |
| My Work              | `ProjectsMyWorkView` — task-oriented assignment list         |
| “Today’s priorities” | **No** attention feed, no ranked commitments across projects |
| Executive summary    | **No** role-specific home (PM vs Executive)                  |

### 1.4 Project detail (today’s “cockpit”)

| Aspect          | As-built                                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------- |
| Component       | `ProjectDetailView`                                                                                                 |
| IA              | **Tab strip:** overview · delivery · milestones · risks · decisions · actions · tasks · backlog · sprints · roadmap |
| Layout          | Main column + sticky aside (`ProjectsWorkspaceFrame`)                                                               |
| Aside today     | Project metadata + **Enterprise Context panel** (`focusType=project`)                                               |
| Overview        | Edit name/description/status · archive · summary fields                                                             |
| Delivery tab    | `ProjectDeliveryDashboardPanel` — health, counts, upcoming milestones, top risks, decisions, blockers               |
| Registers       | Separate tabs for milestones / risks / decisions / actions (Wave A panels)                                          |
| Tasks           | Tables; backlog/sprints/roadmap are **task views**, not scheduling UI                                               |
| Activity stream | **No** bottom activity rail                                                                                         |
| Approvals       | **No** first-class approvals surface (only Context workflow fragments when related)                                 |

### 1.5 Data & APIs already available

| Capability                               | Source                                                               | Notes                                      |
| ---------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------ |
| Projects / tasks CRUD                    | Plane via Platform Services · `/api/v1/projects` · `/api/v1/tasks`   | SoR for work items                         |
| Milestones · risks · decisions · actions | Platform Postgres · `projects-delivery` · `/api/v1/projects/:id/...` | Wave A                                     |
| Delivery health + dashboard aggregate    | `getProjectDeliveryHealth` · `getProjectDeliveryDashboard`           | Per project; rule-based green/amber/red    |
| Enterprise Context                       | `GET /api/v1/context?focusType=project`                              | Composed slices; already mounted on detail |
| Permissions                              | `projects.view` · `manage` · `admin` · task grants                   | UI helpers exist                           |
| Activity (contract)                      | `ProjectService.listProjectActivity` (contract-level)                | **Not** wired to web client / UI           |
| Search                                   | `packages/search-projects`                                           | Separate search view, not Attention Home   |
| Events                                   | `events/projects/*.yaml`                                             | Notify product wiring incomplete           |

### 1.6 Shell & UI kit

| Asset                          | Status                                                   |
| ------------------------------ | -------------------------------------------------------- |
| `ProjectsWorkspaceFrame`       | Main + aside — **good scaffold** for Cockpit right rail  |
| Local `ProjectsTable` / badges | Functional; not Linear-class cards                       |
| `@apzhub/ui`                   | Button/Input mainly; DataTable/Dialog underused          |
| Motion                         | No product-level motion language on Projects home/detail |

### 1.7 Mobile / responsive

| Aspect         | As-built                                                          |
| -------------- | ----------------------------------------------------------------- |
| Layout         | `lg:flex-row` frame; stacks on small screens                      |
| Mobile product | **No** triage-first mobile experience (approve / reject / update) |

---

## 2. Gap Analysis (vs world-class Home + Cockpit)

| Target experience                                                                   | Gap severity | Gap                                                                                             |
| ----------------------------------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------- |
| Attention Home — “What needs my attention?”                                         | **Critical** | No attention aggregation API or UI; home is a project table                                     |
| Cross-project signals (risk, due milestones, approvals, customer silence, velocity) | **Critical** | No portfolio attention service; velocity/customer silence not modelled                          |
| My Projects story cards                                                             | **High**     | No card component; list lacks composed story fields                                             |
| Project Cockpit (L / C / R / bottom)                                                | **Critical** | Tabs are the identity; no timeline left rail; no activity bottom; center is not “today’s focus” |
| Commitments language & model                                                        | **High**     | Tasks + actions exist; no commitment semantics (waiting / failure consequence)                  |
| Milestone as Context hub                                                            | **Medium**   | Milestone CRUD exists; no rich commitment surface composing Context/docs/support                |
| Approvals in cockpit                                                                | **High**     | No Projects approvals register; Context may show workflow items only                            |
| Activity stream                                                                     | **High**     | Contract activity unused; no live stream UI                                                     |
| Question-led reports on home                                                        | **Medium**   | Out of first cockpit slice but no foundation                                                    |
| Notifications that matter                                                           | **High**     | Events without Attention-grade delivery                                                         |
| Mobile triage                                                                       | **High**     | No dedicated flows                                                                              |
| Role homes (Executive vs PM)                                                        | **Medium**   | Single dashboard for all                                                                        |

**Verdict:** Foundations (delivery registers, health, Context panel, project/task SoR) are real. The **experience identity** (Attention + Cockpit) does not exist yet. This is a product redesign of the shell, not a greenfield backend.

---

## 3. Engineering Recommendation (when design is approved)

### 3.1 Do not wait for a rewrite of Plane

Keep Plane as SoR for projects/tasks.  
Build Attention + Cockpit as **APZHUB composition UX** over:

- delivery registers + health (platform);
- tasks/actions (engine + platform);
- Enterprise Context (platform);
- new Attention aggregator (platform metadata / derived — never a second SoR of project truth).

### 3.2 Suggested implementation slices (build order after Design Auth)

| Slice                      | Outcome                                                                                          | Depends on                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| **A — Attention Home API** | `GET /api/v1/projects/attention` (or `/home`) returning ranked signals + project story summaries | listProjects + delivery health/dashboard per project (batch/cache) |
| **B — Attention Home UI**  | Replace dashboard table with Attention feed + My Projects cards                                  | A · card components                                                |
| **C — Cockpit shell**      | Replace tab-primary IA with L/C/R + bottom regions; deep-link preserve for registers             | Frame reuse · routing change                                       |
| **D — Cockpit center**     | Today’s focus · blockers · approvals · recent                                                    | Delivery dashboard + tasks + **new** approvals source              |
| **E — Cockpit left**       | Timeline / milestones / deliverables strip                                                       | Milestones API · new timeline viz                                  |
| **F — Activity stream**    | Bottom rail                                                                                      | Wire `listProjectActivity` or event-derived feed                   |
| **G — Milestone surface**  | Rich milestone drawer/page with Context composition                                              | Milestone API · Context focus refinement                           |
| **H — Mobile triage**      | Separate routes/views for “What do I need to do?”                                                | Attention + approvals + commitment updates                         |

### 3.3 Explicit non-goals until designed

- Full Gantt as default
- AI in cockpit right
- Copying Jira boards as identity
- Migrating Wave A registers into Plane

---

## 4. Readiness

### 4.1 Reusable now

| Component / service                           | Reuse how                                            |
| --------------------------------------------- | ---------------------------------------------------- |
| `ProjectsWorkspaceFrame`                      | Cockpit chrome (main + right)                        |
| `EnterpriseContextPanel`                      | Cockpit **right** (already correct mount point)      |
| `ProjectDeliveryDashboardPanel` + health APIs | Seed cockpit **center** health / blockers / upcoming |
| Milestone / risk / decision / action panels   | Cockpit deep links & drawers — not primary IA        |
| `projects-api` delivery clients               | Attention aggregator inputs                          |
| React Query keys                              | Extend with `attention`, `activity`, `cockpit`       |
| Permissions helpers                           | Gate Attention + cockpit regions                     |
| Design tokens / Lucide                        | Card & signal UI                                     |
| Playwright projects helpers                   | Extend for Attention + Cockpit                       |

### 4.2 Missing components (must build)

| Missing                                  | Type                                     |
| ---------------------------------------- | ---------------------------------------- |
| Attention aggregator service + API       | Platform Service (derived)               |
| Attention Home UI                        | Product UI                               |
| Project story card                       | UI component                             |
| Cockpit layout (L/C/R/bottom)            | Product UI                               |
| Commitment model / UX over tasks+actions | Domain + UI (design pending)             |
| Approvals surface for Projects           | Product + likely Workflow Context bridge |
| Activity stream UI + client              | API wire + UI                            |
| Timeline / roadmap visualization         | UI (Linear-class)                        |
| Milestone Context hub surface            | UI                                       |
| Mobile triage app shell                  | UI                                       |
| Signal types: velocity, customer silence | Data/design — not in codebase            |

### 4.3 Estimated complexity (indicative)

| Work                                                                           | Band     | Notes                             |
| ------------------------------------------------------------------------------ | -------- | --------------------------------- |
| Attention API (v1: health + milestones + risks + open actions across projects) | **M**    | N+1 risk — batch/cache required   |
| Attention Home + cards UI                                                      | **M**    | High UX polish                    |
| Cockpit shell + routing migration                                              | **M**    | Breaking IA — preserve deep links |
| Center focus composition                                                       | **M**    | Mostly assemble existing APIs     |
| Activity stream                                                                | **M**    | If activity API real; else **L**  |
| Left timeline viz                                                              | **L–XL** | Greenfield interaction            |
| Approvals                                                                      | **L**    | Needs Workflow/commitment design  |
| Mobile triage                                                                  | **L**    | New IA                            |
| Full commitment semantics                                                      | **L–XL** | Product design dependent          |

### 4.4 Technical risks

| Risk                                      | Impact                   | Mitigation                                                            |
| ----------------------------------------- | ------------------------ | --------------------------------------------------------------------- |
| Attention query cost (health per project) | Slow home                | Batch endpoint; Redis short TTL; progressive load                     |
| Dual SoR (Plane vs delivery Postgres)     | Inconsistent story cards | Card fields explicitly sourced; never invent Plane fields in platform |
| Tab → Cockpit migration                   | User/deep-link break     | Keep `?tab=` / path aliases for registers                             |
| “Approvals” undefined in Projects SoR     | Scope creep              | Design must name SoR (Workflow vs Projects) before build              |
| Activity empty in engines                 | Dead stream              | Fallback to delivery + task update events                             |
| Over-building Gantt                       | Delay                    | Roadmap-first per Workshop 001                                        |

### 4.5 Testing implications

| Layer       | Need                                                                                                            |
| ----------- | --------------------------------------------------------------------------------------------------------------- |
| Unit        | Attention ranking rules; card field mappers; cockpit region visibility by permission                            |
| Integration | Attention API with delivery + projects gateway; Context still loads in right rail                               |
| Playwright  | Home shows Attention question; click signal opens work; cockpit regions present; register deep links still work |
| a11y        | Card grid, live regions for Attention counts, cockpit landmarks                                                 |
| Performance | Home < target TTFB/LCP with 20+ projects (define in design)                                                     |

### 4.6 Build readiness score

| Area                                                          | Ready to implement on Design Auth?           |
| ------------------------------------------------------------- | -------------------------------------------- |
| Attention Home (v1 signals from existing delivery + projects) | **Yes** — after pixel/interaction design     |
| My Projects cards (v1 from delivery dashboard fields)         | **Yes**                                      |
| Cockpit shell + Context right                                 | **Yes** — reuse frame + panel                |
| Cockpit center (health/blockers/milestones/risks)             | **Yes** — assemble Wave A                    |
| Activity bottom                                               | **Partial** — confirm activity API behaviour |
| Approvals                                                     | **Blocked** on product design (SoR)          |
| Timeline left                                                 | **Blocked** on interaction design            |
| Commitments rename/model                                      | **Blocked** on product design                |
| Mobile triage                                                 | **Blocked** on mobile design                 |
| Velocity / customer silence signals                           | **Blocked** on data design                   |

**Overall:** Engineering can start **immediately** on Attention Home v1 + Cockpit shell/center/right once you approve interaction design for those surfaces. Left timeline, approvals, commitments semantics, and mobile need the next design workshops before code.

---

## 5. What Cursor needs next from Product Design

To remove remaining uncertainty, approve design for:

1. **Attention Home** — exact signals, ranking, empty states, click targets
2. **Project story card** — every field and health rule
3. **Cockpit layout** — breakpoints, what is pinned vs scrollable, keyboard
4. **Center “current focus”** — algorithm / rules for what appears
5. **Approvals** — owning SoR and states

Then Engineering Mode can ship without inventing product behaviour.
