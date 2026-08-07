# APZ Workflow — Native UX Audit (Gap Register)

| Field       | Value                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------ |
| Slice       | **APZ-WORKFLOW-NATIVE-001-N01**                                                                        |
| Status      | **COMPLETE** (analysis only)                                                                           |
| Timestamp   | 20260805T163000Z                                                                                       |
| Method      | Static review of Workflow / Workflows / Workflow Engine UI, libs, manifests; mission + Board principle |
| Engineering | **None** — no code changes in this slice                                                               |
| Mission     | [../../apzworkflow/PRODUCT-MISSION.md](../../apzworkflow/PRODUCT-MISSION.md) **APPROVED**              |
| Board       | [../PRODUCT-BOARD-INTENT-PRINCIPLE.md](../PRODUCT-BOARD-INTENT-PRINCIPLE.md) **IN FORCE**              |
| Authority   | [OWNER-AUTHORISATION.md](./OWNER-AUTHORISATION.md)                                                     |

## Objective

Determine whether APZ Workflow already behaves like a native APZHUB product that **models, governs and visualises business processes** — without presenting as an automation engine.

**Central audit questions:**

1. When a user thinks about a process, do they start with a **business journey** — or with runs, schedules, providers, and engines?
2. Can every user-visible workflow be described without mentioning software? ([Workflow Test](../../apzworkflow/WORKFLOW-TEST.md))

## Classification legend

| Class                 | Meaning                                                       |
| --------------------- | ------------------------------------------------------------- |
| **Already Compliant** | Meets native APZHUB product contract today                    |
| **Native**            | APZHUB-owned surface; may need polish but no engine leak      |
| **Wrapper**           | Thin shell; feels incomplete / not first-class                |
| **Engine Leak Risk**  | User could infer or see engine/adapter identity — defect risk |
| **Requires Redesign** | Must change for first-class APZHUB experience                 |

**Engine leak test:** Could a user tell which implementation engine exists? If yes → defect.  
**Intent leak test:** Does the UI answer “what runs?” before “what should happen?” If yes → identity defect.

## Scope inventory (three parallel planes)

| Plane                  | Route                        | Manifest / module                      | Permission             |
| ---------------------- | ---------------------------- | -------------------------------------- | ---------------------- |
| Runtime Workbench      | `/workspace/workflow`        | `services/workflow/manifests/workflow` | `workflow.view`        |
| Platform Workflows SoR | `/workspace/workflows`       | `platform-workflows`                   | `workflow.view`        |
| **Workflow Engine**    | `/workspace/workflow-engine` | `platform-workflow-engine`             | `workflow.engine.read` |

Mounted in `apps/web/components/workbench-page.tsx`.

**Runtime sections:** home, definitions, runs, schedules, tasks, approvals, notifications, search, health, diagnostics, capabilities.  
**SoR sections:** overview, workflows, versions, templates, categories, folders, validation, audit, diagnostics.  
**Engine sections:** overview, workflows, templates, projects, users, tags, capabilities, health, diagnostics, compatibility.

Activity Bar presents **three** products for one capability — Critical identity gap.

---

## Gap register

| ID   | Area                          | Current                                                                | Target                                                                   | Gap / notes                                 | Class             | Engine leak? | Priority | Feeds  |
| ---- | ----------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------- | ----------------- | ------------ | -------- | ------ |
| G-01 | Product unity                 | Three Activity Bar entries: Workflow / Workflows / Workflow Engine     | One **APZ Workflow** product surface                                     | Capability fragmented                       | Requires Redesign | Indirect     | Critical | N-03   |
| G-02 | Engine as product             | Activity Bar **Workflow Engine**; palette “Go to Workflow Engine”      | Engine invisible; admin-only if needed                                   | Violates mission identity                   | Engine Leak Risk  | **Yes**      | Critical | N-03   |
| G-03 | Named engine brand (n8n)      | No `n8n` in component trees; errors strip n8n tokens                   | Keep zero named-engine marks                                             | Compliant for string brand                  | Already Compliant | No           | —        | —      |
| G-04 | Ops-first vocabulary          | Definitions, Runs, Schedules, Cron, Capabilities, Diagnostics          | Business processes / journeys first                                      | Fails Workflow Test at chrome level         | Requires Redesign | No           | Critical | N-03   |
| G-05 | Intent vs execution           | Runs / Schedules / “Workflow Execution Not Available” prominent        | Intent catalogue first; execution behind curtain                         | UI answers “what runs?” first               | Requires Redesign | No           | Critical | N-03   |
| G-06 | Provider language             | “Provider-neutral”, “Ops provider”, capabilities panels                | APZHUB product language only                                             | Implementation framing                      | Engine Leak Risk  | **Yes**      | High     | N-03   |
| G-07 | Workflow Test catalogue       | No journey names (onboarding, procurement, approval, …)                | Business-named processes                                                 | Catalogue is technical                      | Requires Redesign | No           | High     | N-03   |
| G-08 | Dual API surface              | `/api/v1/workflow` vs `/api/v1/workflows` (+ `/engine`)                | One product mental model (API may stay internal)                         | Reinforces three-plane confusion            | Wrapper           | No           | Medium   | note   |
| G-09 | Shell integration             | Mounted in DesktopShell                                                | Peer workspace                                                           | Compliant as mounts                         | Already Compliant | No           | —        | —      |
| G-10 | Branding consistency          | Mixed: Workflow / Workflows / Workflow Engine / legacy “APZ Workflows” | Consistent **APZ Workflow**                                              | Naming drift                                | Requires Redesign | No           | High     | N-03   |
| G-11 | Breadcrumbs / help / settings | Ops workbench chrome; help/settings pattern uneven vs RI products      | APZ Workflow → section → entity; APZHUB help                             | Incomplete native polish                    | Native            | No           | Medium   | N-03   |
| G-12 | Permissions model             | Rich `workflow.*` + `workflow.engine.*` catalogue                      | Session/PermissionService; engine perms admin-only                       | Engine perms exist for product surface      | Native            | Low          | Medium   | N-02   |
| G-13 | Identity / session            | Assumed Better Auth / workbench session                                | One APZHUB identity; no engine login                                     | Prove in N-02                               | Native            | TBD          | High     | N-02   |
| G-14 | SoR for process definition    | Platform Workflows SoR plane exists alongside runtime                  | Clear: Workflow owns **process definition / governance / visualisation** | Split ownership unclear to users            | Wrapper           | No           | High     | N-03   |
| G-15 | Backbone linkage              | Little UX tying steps to Projects / Support / Time / Documents         | Journeys reference RI products by design                                 | Glue not visible                            | Requires Redesign | No           | High     | N-03+  |
| G-16 | Legacy docs conflict          | `docs/products/workflow/` automation + n8n framed                      | Mission pack authoritative                                               | Docs debt — do not treat legacy as identity | Native            | Docs         | Medium   | note   |
| G-17 | Portfolio “Automation” name   | Historical ECM “Workflow Automation”; Activity “Workflow Engine”       | **Workflow Orchestration** / business processes                          | Naming debt                                 | Native            | No           | Medium   | docs   |
| G-18 | Enterprise capability docs    | Mission APPROVED; Intent Principle IN FORCE; Workflow Test IN FORCE    | Remain authoritative                                                     | Docs ahead of experience                    | Already Compliant | No           | —        | —      |
| G-19 | My Work composition           | No Workflow journey feed in My Work                                    | Optional later composition                                               | Lane 1 / later — note only                  | Native            | No           | —        | Lane 1 |
| G-20 | Diagnostics / health          | First-class nav on all three planes                                    | Admin-gated; no provider IDs                                             | Ops-forward for end users                   | Wrapper           | Risk         | Medium   | N-03   |

---

## Area summaries

| Area                            | Result              | Detail                                                     |
| ------------------------------- | ------------------- | ---------------------------------------------------------- |
| Native Experience               | **GAPS IDENTIFIED** | Shell mounts exist; three-plane / ops chrome               |
| Engine Leakage                  | **GAPS IDENTIFIED** | n8n strings masked; **Workflow Engine** is product-visible |
| Intent vs Execution             | **GAPS IDENTIFIED** | Runs/schedules/providers dominate over business journeys   |
| Workflow Test                   | **GAPS IDENTIFIED** | Chrome fails business-language test                        |
| System of Record Boundaries     | **GAPS IDENTIFIED** | Process SoR unclear across Workflow vs Workflows planes    |
| Relationship to RI #001–#004    | **GAPS IDENTIFIED** | Glue not expressed in UX                                   |
| Enterprise Capability Alignment | **PASS** (docs)     | Mission / Board / ECM aligned; product experience lags     |

## Verdict

APZ Workflow is **not yet** a native APZHUB business-process product. The dominant defect is **identity fragmentation** (three Activity Bar products) plus **execution-first chrome** that contradicts the frozen distinction: Workflow = business intent; Automation = execution.

N-01 records gaps only. No engineering in this slice.
