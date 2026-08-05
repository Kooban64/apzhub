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

| ID   | Area                          | Current                                                                                                  | Target                                           | Gap / notes                        | Class                     | Engine leak? | Priority | Feeds   |
| ---- | ----------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ---------------------------------- | ------------------------- | ------------ | -------- | ------- |
| G-01 | Branding / product name       | ~~Eyebrow "Time"~~ → **APZ Time** chrome + workbench title                                               | Consistent **APZ Time** product naming in chrome | **CLOSED** (A03)                   | Already Compliant         | No           | —        | A03     |
| G-02 | Branding / engine marks       | No Kimai strings in `components/time` or `lib/time` (boundary test forbids)                              | Keep zero engine marks                           | —                                  | Already Compliant         | No           | —        | —       |
| G-03 | Error copy                    | `errors.ts` sanitizes kimai/plane/provider/adapter/engine/upstream                                       | Keep safe messages                               | —                                  | Already Compliant         | No           | —        | —       |
| G-04 | Diagnostics redaction         | `formatSafeDiagnosticsJson` redacts brand tokens → `[engine]`                                            | Same; never show brand                           | —                                  | Already Compliant         | No           | —        | —       |
| G-05 | Capabilities JSON             | ~~Raw JSON panels~~ → summary cards + safe developer `<details>`                                         | All JSON panels use safe formatter               | **CLOSED** (A03)                   | Already Compliant         | No           | —        | A03     |
| G-06 | Connection test               | ~~Integration-console framing~~ → “Platform readiness” / admin-gated                                     | Operator-only APZHUB diagnostics                 | **CLOSED** (A03)                   | Already Compliant         | No           | —        | A03     |
| G-07 | Terminology                   | Timesheets, activities, customers, tags — APZHUB-oriented                                                | Keep; avoid Kimai entity names                   | Largely good                       | Native                    | No           | Low      | —       |
| G-08 | Raw technical IDs             | ~~Mono IDs on detail~~ → resolved activity/customer/tag names                                            | Human labels + APZHUB references                 | **CLOSED** (A03)                   | Already Compliant         | No           | —        | A03     |
| G-09 | Time projects vs APZ Projects | ~~Risk of confusion~~ → Time-domain project UI hidden from create/detail                                 | Hide until ready (or clear concept later)        | **CLOSED** (A03 hide)              | Already Compliant         | No           | —        | A03     |
| G-10 | Navigation (in-product)       | ~~Dashboard button grid~~ → manifest sidebar primary                                                     | Workbench sidebar sections for Time              | **CLOSED** (A03)                   | Already Compliant         | No           | —        | A03     |
| G-11 | Shell integration             | Routed under `/workspace/time` via DesktopShell; nav registration tested                                 | Same; Time as peer workspace                     | **CLOSED** (A03 polish)            | Already Compliant         | No           | —        | A03     |
| G-12 | Layout / page structure       | `PageShell` + `TimeWorkspaceFrame` + context panel                                                       | Align with shared workspace patterns             | **CLOSED** (A03)                   | Already Compliant         | No           | —        | A03     |
| G-13 | Menus / actions               | Context panel quick/selection actions on Overview + timesheet detail                                     | Context panel + command-friendly actions         | **CLOSED** (A03)                   | Already Compliant         | No           | —        | A03     |
| G-14 | Empty states                  | `EmptyState` with APZ Time copy + CTAs                                                                   | Richer APZHUB empty patterns + CTAs              | **CLOSED** (A03)                   | Already Compliant         | No           | —        | A03     |
| G-15 | Errors (UX)                   | `ErrorState` + Retry                                                                                     | Align with platform error patterns               | Adequate Phase 1                   | Native                    | No           | Low      | —       |
| G-16 | Loading                       | ~~“Loading Time…”~~ → “Loading APZ Time…”                                                                | Keep product name consistent with G-01           | **CLOSED** (A03)                   | Already Compliant         | No           | —        | A03     |
| G-17 | Onboarding                    | Overview getting-started tip (dismissible)                                                               | First-run APZHUB Time guidance                   | **CLOSED** (A03)                   | Already Compliant         | No           | —        | A03     |
| G-18 | Settings                      | `/workspace/time/settings` — product prefs only (`time.admin`)                                           | APZHUB Time preferences (not engine settings)    | **CLOSED** (A03)                   | Already Compliant         | No           | —        | A03     |
| G-19 | Help                          | `/workspace/time/help` — APZHUB-only help                                                                | APZHUB help only                                 | **CLOSED** (A03)                   | Already Compliant         | No           | —        | A03     |
| G-20 | Notifications                 | **Absent** for Time product events                                                                       | APZHUB notification integration                  | Phase 1 exclusion — remains open   | Requires Redesign         | No           | Medium   | Phase C |
| G-21 | Permissions UI                | ~~Hardcoded `time.*`~~ → session grants via `useTimePermissions`                                         | Drive from APZHUB PermissionService / session    | **CLOSED** (A02)                   | Already Compliant         | No           | —        | A02     |
| G-22 | Identity / session            | ~~UI ignored session grants~~ → layout hydrates `authPermissionContext` + `SessionAuthorizationProvider` | One APZHUB identity end-to-end; no Kimai login   | **CLOSED** (A02)                   | Already Compliant         | No           | —        | A02     |
| G-23 | Breadcrumbs                   | `PageShell` breadcrumbs on all Time pages                                                                | APZHUB breadcrumb for Time hierarchy             | **CLOSED** (A03)                   | Already Compliant         | No           | —        | A03     |
| G-24 | Context panel                 | `TimeWorkspaceFrame` context panel (timer / actions / selection)                                         | Selection → context for timesheet/customer       | **CLOSED** (A03)                   | Already Compliant         | No           | —        | A03     |
| G-25 | Health surface                | Health + Platform readiness admin-gated (`time.admin`); friendly status first                            | Ops vs end-user separation                       | **CLOSED** (A03)                   | Already Compliant         | No           | —        | A03     |
| G-26 | Design system                 | Shared Time UI primitives + table pattern; tokens/`@apzhub/ui`                                           | Prefer shared patterns where mandated            | **CLOSED** (A03 aligned)           | Already Compliant         | No           | —        | A03     |
| G-27 | Local preferences             | `localStorage` keys `apzhub.time.*`                                                                      | Prefer Preference Service (023) long-term        | Acceptable interim                 | Native                    | No           | Low      | Phase B |
| G-28 | Phase 1 feature absences      | No approvals, reporting UI, dashboards, exports, billing, leave, scheduling                              | Defer unless daily-use blocking                  | Documented limitations — not leaks | Already Compliant (scope) | No           | —        | Phase C |

---

## Engine Leak summary

| Finding                                                 | Verdict                                                      |
| ------------------------------------------------------- | ------------------------------------------------------------ |
| Literal Kimai branding in Time UI components            | **None found** (boundary test + scan)                        |
| Kimai docs / auth / roles in UI                         | **None found**                                               |
| Unsafe JSON panels (capabilities etc.)                  | **CLOSED** — G-05 (A03)                                      |
| Connection-test as product UX                           | **CLOSED** — G-06 (A03)                                      |
| Could a typical end user currently say “this is Kimai”? | **Unlikely**; product chrome now presents as native APZ Time |

---

## Counts

| Class              | Count (approx.) |
| ------------------ | --------------: |
| Already Compliant  |              24 |
| Native             |               2 |
| Wrapper            |               0 |
| Requires Redesign  |        1 (G-20) |
| Engine Leak / Risk |               0 |

---

## Implications for later slices

| Slice             | Driven by audit                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **A02 Identity**  | G-21, G-22 — **CLOSED** (see [TIME-NATIVE-001-A02](../TIME-NATIVE-001-A02/))                                                   |
| **A03 Workspace** | G-01, G-05/G-06, G-08–G-19, G-23–G-26 — **CLOSED** (see [TIME-NATIVE-001-A03](../TIME-NATIVE-001-A03/)); G-20 deferred Phase C |
| **A04 APZQEP**    | Process binding once UX/identity direction is clear; not blocked on G-28                                                       |

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
