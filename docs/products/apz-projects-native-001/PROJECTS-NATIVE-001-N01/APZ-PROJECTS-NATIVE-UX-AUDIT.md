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

| ID   | Area                          | Current                                                                                  | Target                                | Gap / notes                                     | Class             | Engine leak? | Priority | Feeds |
| ---- | ----------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------- | ----------------------------------------------- | ----------------- | ------------ | -------- | ----- |
| G-01 | Branding / product name       | ~~Chrome used Projects~~                                                                 | Consistent **APZ Projects**           | **CLOSED** in N-03                              | Already Compliant | No           | —        | N-03  |
| G-02 | Branding / engine marks       | No engine brand strings in Projects UI/lib production paths; boundary test forbids marks | Keep zero engine marks                | Compliant                                       | Already Compliant | No           | —        | —     |
| G-03 | Error copy                    | `lib/projects/errors.ts` sanitizes engine/provider/adapter tokens                        | Keep safe messages                    | Strong                                          | Already Compliant | No           | —        | —     |
| G-04 | Diagnostics / JSON panels     | ~~Health dumped raw JSON~~                                                               | Never show raw payloads to end users  | **CLOSED** in N-03 (human readiness summary)    | Already Compliant | No           | —        | N-03  |
| G-05 | Health / connection-test      | ~~Viewer sidebar Health~~                                                                | Operator-only, APZHUB framing         | **CLOSED** in N-03 (`projects.admin` Readiness) | Already Compliant | No           | —        | N-03  |
| G-06 | Terminology                   | Project / Task / Sprint / Backlog / Roadmap; human status labels                         | Keep APZHUB names                     | Largely good                                    | Native            | No           | Low      | —     |
| G-07 | Raw technical IDs             | ~~workspaceId / sprint IDs / Assignee ID~~                                               | Human labels                          | **CLOSED** in N-03                              | Already Compliant | No           | —        | N-03  |
| G-08 | Create / domain jargon        | ~~Platform API / honesty / Wave 1 HTTP~~                                                 | Product language only                 | **CLOSED** in N-03                              | Already Compliant | No           | —        | N-03  |
| G-09 | Navigation (in-product)       | Manifest sidebar + workbench sidebar modules                                             | Manifest-driven primary nav           | Aligned                                         | Already Compliant | No           | —        | —     |
| G-10 | Shell integration             | `/workspace/projects` via WorkbenchPage                                                  | Peer workspace                        | Compliant                                       | Already Compliant | No           | —        | —     |
| G-11 | Layout / page structure       | ~~No workspace frame~~                                                                   | Align with Time/Support composition   | **CLOSED** in N-03                              | Already Compliant | No           | —        | N-03  |
| G-12 | Menus / actions               | ~~No context panel~~                                                                     | Context panel + quick actions         | **CLOSED** in N-03                              | Already Compliant | No           | —        | N-03  |
| G-13 | Empty states                  | ~~Weak CTAs~~                                                                            | APZ Projects empties + CTAs           | **CLOSED** in N-03                              | Already Compliant | No           | —        | N-03  |
| G-14 | Errors (UX)                   | ~~Generic error title~~                                                                  | Align naming with APZ Projects        | **CLOSED** in N-03                              | Already Compliant | No           | —        | N-03  |
| G-15 | Loading                       | ~~Loading Projects…~~                                                                    | “Loading APZ Projects…”               | **CLOSED** in N-03                              | Already Compliant | No           | —        | N-03  |
| G-16 | Onboarding                    | ~~Absent~~                                                                               | First-run guidance                    | **CLOSED** in N-03                              | Already Compliant | No           | —        | N-03  |
| G-17 | Settings                      | ~~Absent~~                                                                               | APZHUB Projects preferences only      | **CLOSED** in N-03                              | Already Compliant | No           | —        | N-03  |
| G-18 | Help                          | ~~Absent~~                                                                               | APZHUB-only help                      | **CLOSED** in N-03                              | Already Compliant | No           | —        | N-03  |
| G-19 | Notifications                 | Service registers notification routes; no product notification UX                        | Mission-aligned Attention integration | Foundation only                                 | Native            | No           | Medium   | later |
| G-20 | Permissions UI                | ~~Hardcoded `DEFAULT_UI_PERMISSIONS = ["projects.*"]`~~                                  | Session / PermissionService only      | **CLOSED** in N-02                              | Already Compliant | No           | —        | N-02  |
| G-21 | Identity / session            | ~~No session permission hook on router~~                                                 | One APZHUB identity end-to-end        | **CLOSED** in N-02 (`useProjectsPermissions`)   | Already Compliant | No           | —        | N-02  |
| G-22 | Breadcrumbs                   | ~~None~~                                                                                 | APZ Projects → section → entity       | **CLOSED** in N-03                              | Already Compliant | No           | —        | N-03  |
| G-23 | Context panel                 | ~~None~~                                                                                 | Selection/actions context             | **CLOSED** in N-03                              | Already Compliant | No           | —        | N-03  |
| G-24 | Design system                 | Shared Projects UI primitives + table pattern                                            | Shared workspace patterns             | **CLOSED** (aligned) in N-03                    | Already Compliant | No           | —        | N-03  |
| G-25 | Permission undefined bypass   | ~~Router default `projects.*` soft-open~~                                                | Undefined = deny; no wildcard default | **CLOSED** in N-02                              | Already Compliant | No           | —        | N-02  |
| G-26 | Permission coverage gaps      | ~~Create/search/health ungated~~                                                         | Gate all sensitive surfaces           | **CLOSED** in N-02 (router gates)               | Already Compliant | No           | —        | N-02  |
| G-27 | Implementation honesty chrome | ~~Honesty / HTTP / engine-API framing~~                                                  | Product-safe capability language      | **CLOSED** in N-03                              | Already Compliant | No           | —        | N-03  |
| G-28 | Manifest branding             | `engineBranding: hidden`; chrome title **APZ Projects**                                  | Keep hidden; chrome = APZ Projects    | **CLOSED** in N-03                              | Already Compliant | No           | —        | N-03  |

---

## Counts

| Class             | Count |
| ----------------- | ----: |
| Already Compliant |    26 |
| Native            |     1 |
| Wrapper           |     0 |
| Requires Redesign |     0 |
| Engine Leak Risk  |     0 |

---

## Engine Leak summary

| Finding                               | Verdict                                                |
| ------------------------------------- | ------------------------------------------------------ |
| Engine brand in Projects UI           | **None found**                                         |
| Boundary test                         | **Present** (`projects-architecture-boundary.test.ts`) |
| Unsafe JSON / diagnostics panels      | **Removed** in N-03 — human readiness summary only     |
| Could a user name the implementation? | **Unlikely**                                           |

---

## Implications for later slices

| Slice              | Driven by audit                                                          |
| ------------------ | ------------------------------------------------------------------------ |
| **N-02 Identity**  | G-20, G-21, G-25, G-26 — **CLOSED**                                      |
| **N-03 Workspace** | G-01, G-04–G-05, G-07–G-08, G-11–G-18, G-22–G-24, G-27–G-28 — **CLOSED** |
| **N-04 APZQEP**    | Process binding once Owner authorises                                    |
| **later**          | G-19 notification UX                                                     |

## Cross-product pattern note

G-20 / G-21 matched **EPP-001** (Time + Support + Projects). Status: **Validated Pattern · Action: None**. No shared platform abstraction authorised.

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
