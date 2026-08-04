# APZ Time — Native UX Audit (Gap Register)

| Field       | Value                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------- |
| Slice       | **TIME-NATIVE-001-A01**                                                                           |
| Status      | **COMPLETE** (analysis only)                                                                      |
| Timestamp   | 20260804T194000Z                                                                                  |
| Method      | Static review of `apps/web/components/time`, `apps/web/lib/time`, workbench mount, boundary tests |
| Engineering | **None** — no code changes in this slice                                                          |
| Authority   | [OWNER-AUTHORISATION.md](./OWNER-AUTHORISATION.md)                                                |

## Objective

Define everything the user sees. Establish truth before A02 Identity / A03 Workspace / A04 APZQEP.

## Classification legend

| Class                 | Meaning                                                        |
| --------------------- | -------------------------------------------------------------- |
| **Already Compliant** | Meets native APZHUB product contract today                     |
| **Native**            | APZHUB-owned surface; may need polish but no engine leak       |
| **Wrapper**           | Thin shell over capability; feels incomplete / not first-class |
| **Engine Leak**       | User could tell this is Kimai (or another engine) — **defect** |
| **Requires Redesign** | Must change for first-class APZHUB experience                  |

**Engine Leak test:** _Could a user tell this is Kimai?_ If yes → defect.

## Scope inventory (user-facing routes)

| Route                                        | View                     | Present in Phase 1             |
| -------------------------------------------- | ------------------------ | ------------------------------ |
| `/workspace/time`                            | Dashboard / Overview     | Yes                            |
| `/workspace/time/timesheets`                 | Timesheet list           | Yes                            |
| `/workspace/time/timesheets/new`             | Create timesheet         | Yes                            |
| `/workspace/time/timesheets/{id}`            | Timesheet detail         | Yes                            |
| `/workspace/time/activities` (+ `/new`)      | Activities               | Yes                            |
| `/workspace/time/customers` (+ `/new`)       | Customers                | Yes                            |
| `/workspace/time/tags` (+ `/new`)            | Tags                     | Yes                            |
| `/workspace/time/search`                     | Search                   | Yes                            |
| `/workspace/time/health`                     | Health                   | Yes (ops-leaning)              |
| `/workspace/time/diagnostics`                | Diagnostics / connection | Yes (ops-leaning)              |
| Time projects UI                             | —                        | **No** (API exists; UI absent) |
| Help / Settings / Onboarding / Notifications | —                        | **No**                         |

Mount: `TimeWorkspaceRouter` inside `WorkbenchPage` when `isTimeRoute(pathname)`.

---

## Gap register

| ID   | Area                          | Current                                                                                                           | Target                                                     | Gap / notes                                                           | Class                     | Engine leak?                                                 | Priority | Feeds         |
| ---- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------ | -------- | ------------- |
| G-01 | Branding / product name       | Eyebrow label **"Time"** (`PageShell`); not “APZ Time”                                                            | Consistent **APZ Time** product naming in chrome           | Naming underplays product identity                                    | Wrapper                   | No                                                           | Medium   | A03           |
| G-02 | Branding / engine marks       | No Kimai strings in `components/time` or `lib/time` (boundary test forbids)                                       | Keep zero engine marks                                     | —                                                                     | Already Compliant         | No                                                           | —        | —             |
| G-03 | Error copy                    | `errors.ts` sanitizes kimai/plane/provider/adapter/engine/upstream                                                | Keep safe messages                                         | —                                                                     | Already Compliant         | No                                                           | —        | —             |
| G-04 | Diagnostics redaction         | `formatSafeDiagnosticsJson` redacts brand tokens → `[engine]`                                                     | Same; never show brand                                     | —                                                                     | Already Compliant         | No                                                           | —        | —             |
| G-05 | Capabilities JSON             | Diagnostics view stringifies **capabilities** / readiness / compatibility **without** `formatSafeDiagnosticsJson` | All JSON panels use safe formatter                         | Possible field-name / structure leak even if brand redacted elsewhere | Requires Redesign         | **Risk — treat as Engine Leak if raw adapter fields appear** | High     | A03           |
| G-06 | Connection test               | UI offers “connection test” against Time backend path                                                             | Operator-only APZHUB diagnostics; no “test engine” framing | Feels like integration console, not product workspace                 | Wrapper                   | Possibly (semantics)                                         | High     | A02/A03       |
| G-07 | Terminology                   | Timesheets, activities, customers, tags — APZHUB-oriented                                                         | Keep; avoid Kimai entity names                             | Largely good                                                          | Native                    | No                                                           | Low      | —             |
| G-08 | Raw technical IDs             | Detail view shows mono `activityId` / `customerId` / `projectId`                                                  | Human labels + APZHUB references                           | Feels like API debugger                                               | Requires Redesign         | No                                                           | High     | A03           |
| G-09 | Time projects vs APZ Projects | Docs: `tproj_*` ≠ `proj_*`; **no projects UI** despite API                                                        | Clear APZ Time project concept or hide until ready         | Confusion risk with APZ Projects                                      | Requires Redesign         | No                                                           | High     | A03 / Phase C |
| G-10 | Navigation (in-product)       | Dashboard button grid to sections; no dedicated Time sidebar model                                                | Workbench sidebar sections for Time                        | Incomplete native nav                                                 | Wrapper                   | No                                                           | High     | A03           |
| G-11 | Shell integration             | Routed under `/workspace/time` via DesktopShell                                                                   | Same; Time as peer workspace                               | Path compliant                                                        | Already Compliant         | No                                                           | —        | A03 polish    |
| G-12 | Layout / page structure       | Local `PageShell` + tables; uses `@apzhub/ui` Button + tokens                                                     | Align with shared workspace patterns (panels, density)     | Thin Phase 1 workbench                                                | Wrapper                   | No                                                           | Medium   | A03           |
| G-13 | Menus / actions               | Per-page buttons; limited bulk/context actions                                                                    | Context panel + command-friendly actions                   | Sparse                                                                | Wrapper                   | No                                                           | Medium   | A03           |
| G-14 | Empty states                  | Present (`EmptyState`) with Time copy                                                                             | Richer APZHUB empty patterns + CTAs                        | Generic but branded Time                                              | Native                    | No                                                           | Medium   | A03           |
| G-15 | Errors (UX)                   | `ErrorState` + Retry                                                                                              | Align with platform error patterns                         | Adequate Phase 1                                                      | Native                    | No                                                           | Low      | —             |
| G-16 | Loading                       | “Loading Time…”                                                                                                   | Keep product name consistent with G-01                     | Minor                                                                 | Native                    | No                                                           | Low      | A03           |
| G-17 | Onboarding                    | **Absent**                                                                                                        | First-run APZHUB Time guidance                             | Missing                                                               | Requires Redesign         | No                                                           | Medium   | A03           |
| G-18 | Settings                      | **Absent**                                                                                                        | APZHUB Time preferences (not engine settings)              | Missing                                                               | Requires Redesign         | No                                                           | Medium   | A02/A03       |
| G-19 | Help                          | **Absent** (no APZHUB help; no Kimai docs links found in UI)                                                      | APZHUB help only                                           | Missing help; at least no engine docs leak                            | Requires Redesign         | No                                                           | High     | A03           |
| G-20 | Notifications                 | **Absent** for Time product events                                                                                | APZHUB notification integration                            | Missing (Phase 1 exclusion)                                           | Requires Redesign         | No                                                           | Medium   | Phase C / A03 |
| G-21 | Permissions UI                | ~~Hardcoded `time.*`~~ → session grants via `useTimePermissions`                                                  | Drive from APZHUB PermissionService / session              | **CLOSED** (A02)                                                      | Already Compliant         | No                                                           | —        | A02           |
| G-22 | Identity / session            | ~~UI ignored session grants~~ → layout hydrates `authPermissionContext` + `SessionAuthorizationProvider`          | One APZHUB identity end-to-end; no Kimai login             | **CLOSED** (A02)                                                      | Already Compliant         | No                                                           | —        | A02           |
| G-23 | Breadcrumbs                   | Not evident in Time views                                                                                         | APZHUB breadcrumb for Time hierarchy                       | Missing                                                               | Requires Redesign         | No                                                           | Medium   | A03           |
| G-24 | Context panel                 | Not Time-specific                                                                                                 | Selection → context for timesheet/customer                 | Missing                                                               | Requires Redesign         | No                                                           | Medium   | A03           |
| G-25 | Health surface                | Health + search diagnostics in product routes                                                                     | Ops vs end-user separation                                 | End users may see ops chrome                                          | Wrapper                   | Risk if JSON leaks                                           | High     | A03           |
| G-26 | Design system                 | Mixed: `@apzhub/ui` Button + custom tables/shell                                                                  | Prefer shared DataTable / patterns where mandated          | Partial                                                               | Wrapper                   | No                                                           | Medium   | A03           |
| G-27 | Local preferences             | `localStorage` keys `apzhub.time.*`                                                                               | Prefer Preference Service (023) long-term                  | Acceptable interim                                                    | Native                    | No                                                           | Low      | Phase B       |
| G-28 | Phase 1 feature absences      | No approvals, reporting UI, dashboards, exports, billing, leave, scheduling                                       | Defer unless daily-use blocking                            | Documented limitations — not leaks                                    | Already Compliant (scope) | No                                                           | —        | Phase C       |

---

## Engine Leak summary

| Finding                                                 | Verdict                                                                                            |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Literal Kimai branding in Time UI components            | **None found** (boundary test + scan)                                                              |
| Kimai docs / auth / roles in UI                         | **None found**                                                                                     |
| Unsafe JSON panels (capabilities etc.)                  | **Risk** — G-05                                                                                    |
| Connection-test as product UX                           | **Semantic leak risk** — G-06                                                                      |
| Could a typical end user currently say “this is Kimai”? | **Unlikely from copy**; they may say “this is a thin admin tool,” not a first-class APZHUB product |

---

## Counts

| Class              | Count (approx.) |
| ------------------ | --------------: |
| Already Compliant  |               5 |
| Native             |               4 |
| Wrapper            |               8 |
| Requires Redesign  |              10 |
| Engine Leak / Risk |  2 (G-05, G-06) |

---

## Implications for later slices

| Slice             | Driven by audit                                                              |
| ----------------- | ---------------------------------------------------------------------------- |
| **A02 Identity**  | G-21, G-22 — **CLOSED** (see [TIME-NATIVE-001-A02](../TIME-NATIVE-001-A02/)) |
| **A03 Workspace** | G-01, G-08–G-14, G-17–G-20, G-23–G-26, G-05/G-06 placement                   |
| **A04 APZQEP**    | Process binding once UX/identity direction is clear; not blocked on G-28     |

## Anti-goals (reaffirmed)

- Do not chase Kimai feature parity from this register.
- Do not implement from this document without a follow-on authorised slice.
- Product contract remains **APZ Time**; implementation contract remains the Kimai adapter.

## Evidence anchors

- `apps/web/components/time/*`
- `apps/web/lib/time/*`
- `apps/web/components/workbench-page.tsx` (Time mount)
- `apps/web/components/time/time-architecture-boundary.test.ts`
- `docs/products/time/KNOWN-LIMITATIONS.md`
