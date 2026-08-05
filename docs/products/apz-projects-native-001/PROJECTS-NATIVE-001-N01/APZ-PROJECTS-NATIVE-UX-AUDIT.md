# APZ Projects — Native UX Audit (Gap Register)

| Field       | Value                                                                                                           |
| ----------- | --------------------------------------------------------------------------------------------------------------- |
| Slice       | **APZ-PROJECTS-NATIVE-001-N01**                                                                                 |
| Status      | **COMPLETE** (analysis only)                                                                                    |
| Timestamp   | 20260805T064800Z                                                                                                |
| Method      | Static review of Projects UI/lib, manifests, workbench mount, boundary tests; compared to Time/Support after RI |
| Engineering | **None** — no code changes in this slice                                                                        |
| Mission     | [../../apzprojects/PRODUCT-MISSION.md](../../apzprojects/PRODUCT-MISSION.md) **APPROVED**                       |
| Authority   | [OWNER-AUTHORISATION.md](./OWNER-AUTHORISATION.md)                                                              |

## Objective

Define everything the user sees. Establish truth before N-02 Identity / N-03 Workspace / N-04 APZQEP.

Align experience to the Product Mission: APZ Projects as the operational coordination hub of APZHUB — not a wrapped project console.

## Classification legend

| Class                 | Meaning                                                       |
| --------------------- | ------------------------------------------------------------- |
| **Already Compliant** | Meets native APZHUB product contract today                    |
| **Native**            | APZHUB-owned surface; may need polish but no engine leak      |
| **Wrapper**           | Thin shell; feels incomplete / not first-class                |
| **Engine Leak Risk**  | User could infer or see engine/adapter identity — defect risk |
| **Requires Redesign** | Must change for first-class APZHUB experience                 |

**Engine leak test:** Could a user tell this is the underlying project implementation? If yes → defect.

## Scope inventory (user-facing routes)

| Route                                   | View                 | Present |
| --------------------------------------- | -------------------- | ------- |
| `/workspace/projects`                   | Dashboard            | Yes     |
| `/workspace/projects/list`              | All projects         | Yes     |
| `/workspace/projects/new` (+ `/create`) | Create               | Yes     |
| `/workspace/projects/proj_*` (+ tabs)   | Detail               | Yes     |
| `/workspace/projects/my-work`           | My work              | Yes     |
| `/workspace/projects/tasks`             | Tasks                | Yes     |
| `/workspace/projects/backlog`           | Backlog              | Yes     |
| `/workspace/projects/sprints`           | Sprints              | Yes     |
| `/workspace/projects/roadmap`           | Roadmap              | Yes     |
| `/workspace/projects/search`            | Search               | Yes     |
| `/workspace/projects/health`            | Health & diagnostics | Yes     |
| Help / Settings / Onboarding            | —                    | **No**  |

Mount: `ProjectsWorkspaceRouter` in `apps/web/components/workbench-page.tsx` when `isProjectsRoute(pathname)`.

---

## Gap register

| ID   | Area                          | Current                                                                                  | Target                                | Gap / notes                                       | Class             | Engine leak?      | Priority     | Feeds |
| ---- | ----------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------- | ----------------- | ----------------- | ------------ | ----- |
| G-01 | Branding / product name       | Chrome / titles use **Projects**; manifest name/label Projects                           | Consistent **APZ Projects**           | Mission name not elevated                         | Requires Redesign | No                | High         | N-03  |
| G-02 | Branding / engine marks       | No engine brand strings in Projects UI/lib production paths; boundary test forbids marks | Keep zero engine marks                | Compliant                                         | Already Compliant | No                | —            | —     |
| G-03 | Error copy                    | `lib/projects/errors.ts` sanitizes engine/provider/adapter tokens                        | Keep safe messages                    | Strong                                            | Already Compliant | No                | —            | —     |
| G-04 | Diagnostics / JSON panels     | Health view dumps raw `JSON.stringify` for search health, diagnostics, audit             | Never show raw payloads to end users  | Present — leak risk if payloads name providers    | Engine Leak Risk  | **Yes (risk)**    | High         | N-03  |
| G-05 | Health / connection-test      | `/workspace/projects/health` in sidebar for viewers; mixed dumps                         | Operator-only, APZHUB framing         | End-user ops surface                              | Wrapper           | Residual via G-04 | High         | N-03  |
| G-06 | Terminology                   | Project / Task / Sprint / Backlog / Roadmap; human status labels                         | Keep APZHUB names                     | Largely good; residual implementation honesty     | Native            | No                | Low          | —     |
| G-07 | Raw technical IDs             | Detail shows workspaceId; sprint tables show IDs; Assignee ID; search entityId fallback  | Human labels                          | Wrapper feel                                      | Requires Redesign | No                | High         | N-03  |
| G-08 | Create / domain jargon        | “Platform Projects API”, honesty banners, Wave 1 HTTP notes, raw status enums            | Product language only                 | Implementation vocabulary in user chrome          | Requires Redesign | No                | High         | N-03  |
| G-09 | Navigation (in-product)       | Manifest sidebar (dashboard/list/my-work/tasks/backlog/sprints/roadmap/search/health)    | Manifest-driven primary nav           | Aligned                                           | Already Compliant | No                | —            | —     |
| G-10 | Shell integration             | `/workspace/projects` via WorkbenchPage                                                  | Peer workspace                        | Compliant                                         | Already Compliant | No                | —            | —     |
| G-11 | Layout / page structure       | Local `PageShell` only — no breadcrumbs / workspace frame                                | Align with Time/Support composition   | Thin                                              | Wrapper           | No                | Medium       | N-03  |
| G-12 | Menus / actions               | Inline row actions; no context panel                                                     | Context panel + quick actions         | Sparse                                            | Wrapper           | No                | Medium       | N-03  |
| G-13 | Empty states                  | Shared EmptyState; weak CTAs on several surfaces                                         | APZ Projects empties + CTAs           | Thin                                              | Wrapper           | No                | Medium       | N-03  |
| G-14 | Errors (UX)                   | ErrorState + Retry                                                                       | Align naming with APZ Projects        | Adequate                                          | Native            | No                | Low          | N-03  |
| G-15 | Loading                       | “Loading Projects…”                                                                      | “Loading APZ Projects…”               | Naming                                            | Native            | No                | Low          | N-03  |
| G-16 | Onboarding                    | Absent                                                                                   | First-run guidance                    | Missing                                           | Requires Redesign | No                | Medium       | N-03  |
| G-17 | Settings                      | Absent                                                                                   | APZHUB Projects preferences only      | Missing                                           | Requires Redesign | No                | Medium       | N-03  |
| G-18 | Help                          | Absent                                                                                   | APZHUB-only help                      | Missing                                           | Requires Redesign | No                | Medium       | N-03  |
| G-19 | Notifications                 | Service registers notification routes; no product notification UX                        | Mission-aligned Attention integration | Foundation only                                   | Native            | No                | Medium       | later |
| G-20 | Permissions UI                | Hardcoded `DEFAULT_UI_PERMISSIONS = ["projects.*"]`                                      | Session / PermissionService only      | Same class as Time/Support pre-N-02 (**EPP-001**) | Requires Redesign | No                | **Critical** | N-02  |
| G-21 | Identity / session            | No session permission hook on router; Workbench does not pass permissions                | One APZHUB identity end-to-end        | Critical                                          | Requires Redesign | No                | **Critical** | N-02  |
| G-22 | Breadcrumbs                   | None                                                                                     | APZ Projects → section → entity       | Missing                                           | Requires Redesign | No                | Medium       | N-03  |
| G-23 | Context panel                 | None                                                                                     | Selection/actions context             | Missing                                           | Requires Redesign | No                | Medium       | N-03  |
| G-24 | Design system                 | `@apzhub/ui` + local primitives                                                          | Shared workspace patterns             | Acceptable foundation                             | Native            | No                | Medium       | N-03  |
| G-25 | Permission undefined bypass   | Helpers deny on undefined, but router default `projects.*` re-opens manage UI            | Undefined = deny; no wildcard default | Soft-open via default                             | Requires Redesign | No                | High         | N-02  |
| G-26 | Permission coverage gaps      | Create/search/health ungated; several views ignore permissions prop                      | Gate all sensitive surfaces           | Incomplete                                        | Requires Redesign | No                | High         | N-02  |
| G-27 | Implementation honesty chrome | User-visible honesty / HTTP / engine-API framing                                         | Product-safe capability language      | Wrapper feel                                      | Wrapper           | No                | Medium       | N-03  |
| G-28 | Manifest branding             | `engineBranding: hidden`; chrome title Projects                                          | Keep hidden; chrome = APZ Projects    | Half-compliant                                    | Requires Redesign | No                | Medium       | N-03  |

---

## Counts

| Class             | Count |
| ----------------- | ----: |
| Already Compliant |     4 |
| Native            |     5 |
| Wrapper           |     5 |
| Requires Redesign |    13 |
| Engine Leak Risk  |     1 |

---

## Engine Leak summary

| Finding                               | Verdict                                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------------------------ |
| Engine brand in Projects UI           | **None found**                                                                             |
| Boundary test                         | **Present** (`projects-architecture-boundary.test.ts`)                                     |
| Unsafe JSON / diagnostics panels      | **Present** on Health — **Engine Leak Risk**                                               |
| Could a user name the implementation? | **Unlikely from branding**; residual risk is raw diagnostics JSON + wrapper/honesty chrome |

---

## Implications for later slices

| Slice              | Driven by audit                                             |
| ------------------ | ----------------------------------------------------------- |
| **N-02 Identity**  | G-20, G-21, G-25, G-26 (**EPP-001** again)                  |
| **N-03 Workspace** | G-01, G-04–G-05, G-07–G-08, G-11–G-18, G-22–G-24, G-27–G-28 |
| **N-04 APZQEP**    | Process binding once UX/identity clear                      |
| **later**          | G-19 notification UX                                        |

## Cross-product pattern note

G-20 / G-21 match the same identity class already recorded as **EPP-001** (Time + Support). Third observation strengthens the pattern — still **Observation only**; no shared platform abstraction authorised.

## Anti-goals

- Do not chase implementation feature parity from this register.
- Do not implement from this document without an authorised follow-on slice.
- Product contract remains **APZ Projects** as operational coordination hub; implementation remains invisible.

## Evidence anchors

- `apps/web/components/projects/*`
- `apps/web/lib/projects/*`
- `apps/web/components/workbench-page.tsx`
- `services/projects/manifests/projects/module.yaml`
- `apps/web/components/projects/projects-architecture-boundary.test.ts`
- Mission: `docs/products/apzprojects/`
- Time/Support references: `docs/products/time/`, `docs/products/apz-support-native-001/`
