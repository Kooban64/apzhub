# APZ Support — Native UX Audit (Gap Register)

| Field       | Value                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------- |
| Slice       | **APZ-SUPPORT-NATIVE-001-N01**                                                                          |
| Status      | **COMPLETE** (analysis only)                                                                            |
| Timestamp   | 20260805T041100Z                                                                                        |
| Method      | Static review of Support UI/lib, manifests, workbench mount, boundary tests; compared to Time after A03 |
| Engineering | **None** — no code changes in this slice                                                                |
| Mission     | [../../apzsupport/PRODUCT-MISSION.md](../../apzsupport/PRODUCT-MISSION.md) **APPROVED**                 |
| Authority   | [OWNER-AUTHORISATION.md](./OWNER-AUTHORISATION.md)                                                      |

## Objective

Define everything the user sees. Establish truth before N-02 Identity / N-03 Workspace / N-04 APZQEP.

Align experience to the Product Mission: one clear APZHUB place for help — not a wrapped support console.

## Classification legend

| Class                 | Meaning                                                       |
| --------------------- | ------------------------------------------------------------- |
| **Already Compliant** | Meets native APZHUB product contract today                    |
| **Native**            | APZHUB-owned surface; may need polish but no engine leak      |
| **Wrapper**           | Thin shell; feels incomplete / not first-class                |
| **Engine Leak Risk**  | User could infer or see engine/adapter identity — defect risk |
| **Requires Redesign** | Must change for first-class APZHUB experience                 |

**Engine leak test:** Could a user tell this is the underlying support implementation? If yes → defect.

## Scope inventory (user-facing routes)

| Route                                             | View               | Present |
| ------------------------------------------------- | ------------------ | ------- |
| `/workspace/support`                              | Inbox (home)       | Yes     |
| `/workspace/support/requests` (+ `/new`, `/{id}`) | Requests           | Yes     |
| `/workspace/support/organizations` (+ `/{id}`)    | Organisations      | Yes     |
| `/workspace/support/groups` (+ `/{id}`)           | Groups             | Yes     |
| `/workspace/support/users` (+ `/{id}`)            | Users (read-only)  | Yes     |
| `/workspace/support/search`                       | Search             | Yes     |
| `/workspace/support/analytics`                    | Analytics snapshot | Yes     |
| Health / diagnostics / connection-test            | —                  | **No**  |
| Help / Settings / Onboarding                      | —                  | **No**  |

Mount: `SupportWorkspaceRouter` in `apps/web/components/workbench-page.tsx` when `isSupportRoute(pathname)`.

---

## Gap register

| ID   | Area                        | Current                                                                           | Target                                  | Gap / notes                  | Class             | Engine leak? | Priority | Feeds |
| ---- | --------------------------- | --------------------------------------------------------------------------------- | --------------------------------------- | ---------------------------- | ----------------- | ------------ | -------- | ----- |
| G-01 | Branding / product name     | ~~Chrome / titles use Support~~                                                   | Consistent **APZ Support**              | **CLOSED** in N-03           | Already Compliant | No           | —        | N-03  |
| G-02 | Branding / engine marks     | No engine brand strings in Support UI/lib production paths; boundary test forbids | Keep zero engine marks                  | Compliant                    | Already Compliant | No           | —        | —     |
| G-03 | Error copy                  | `lib/support/errors.ts` sanitizes engine/provider/adapter tokens                  | Keep safe messages                      | Strong                       | Already Compliant | No           | —        | —     |
| G-04 | Diagnostics / JSON panels   | None in Support UI                                                                | Never show raw payloads to end users    | Absence is good              | Already Compliant | No           | —        | —     |
| G-05 | Health / connection-test    | No Support health routes                                                          | If later: operator-only, APZHUB framing | Not present                  | Native            | No           | Low      | later |
| G-06 | Terminology                 | Support Request / Requests; human status labels                                   | Keep APZHUB names                       | Largely good                 | Native            | No           | Low      | —     |
| G-07 | Raw technical IDs           | ~~Detail shows raw requester/assignee/group/org IDs~~                             | Human labels (Time N-03 pattern)        | **CLOSED** in N-03           | Already Compliant | No           | —        | N-03  |
| G-08 | Create / domain jargon      | ~~Copy references “Support-domain” IDs~~                                          | Product language only                   | **CLOSED** in N-03           | Already Compliant | No           | —        | N-03  |
| G-09 | Navigation (in-product)     | Manifest sidebar (requests/orgs/groups/users/search/analytics)                    | Manifest-driven primary nav             | Aligned                      | Already Compliant | No           | —        | —     |
| G-10 | Shell integration           | `/workspace/support` via WorkbenchPage                                            | Peer workspace                          | Compliant                    | Already Compliant | No           | —        | —     |
| G-11 | Layout / page structure     | ~~Local PageShell only~~                                                          | Align with Time workspace composition   | **CLOSED** in N-03           | Already Compliant | No           | —        | N-03  |
| G-12 | Menus / actions             | ~~Commands on detail; no context panel~~                                          | Context panel + quick actions           | **CLOSED** in N-03           | Already Compliant | No           | —        | N-03  |
| G-13 | Empty states                | ~~Basic empty; inbox empty weak CTA~~                                             | APZ Support empties + CTAs              | **CLOSED** in N-03           | Already Compliant | No           | —        | N-03  |
| G-14 | Errors (UX)                 | ErrorState + Retry                                                                | Align naming with APZ Support           | **CLOSED** in N-03           | Already Compliant | No           | —        | N-03  |
| G-15 | Loading                     | ~~“Loading Support…”~~                                                            | “Loading APZ Support…”                  | **CLOSED** in N-03           | Already Compliant | No           | —        | N-03  |
| G-16 | Onboarding                  | ~~Absent~~                                                                        | First-run guidance                      | **CLOSED** in N-03           | Already Compliant | No           | —        | N-03  |
| G-17 | Settings                    | ~~Absent~~                                                                        | APZHUB Support preferences only         | **CLOSED** in N-03           | Already Compliant | No           | —        | N-03  |
| G-18 | Help                        | ~~Absent~~                                                                        | APZHUB-only help                        | **CLOSED** in N-03           | Already Compliant | No           | —        | N-03  |
| G-19 | Notifications               | Notification routes registered; UX polish later                                   | Mission-aligned Attention integration   | Foundation ahead of Time A01 | Native            | No           | Medium   | later |
| G-20 | Permissions UI              | ~~Hardcoded `DEFAULT_UI_PERMISSIONS = ["support.*"]`~~                            | Session / PermissionService only        | **CLOSED** in N-02           | Already Compliant | No           | —        | N-02  |
| G-21 | Identity / session          | ~~No session permission hook on router~~                                          | One APZHUB identity end-to-end          | **CLOSED** in N-02           | Already Compliant | No           | —        | N-02  |
| G-22 | Breadcrumbs                 | ~~None~~                                                                          | APZ Support → section → entity          | **CLOSED** in N-03           | Already Compliant | No           | —        | N-03  |
| G-23 | Context panel               | ~~None~~                                                                          | Selection/actions context               | **CLOSED** in N-03           | Already Compliant | No           | —        | N-03  |
| G-24 | Design system               | `@apzhub/ui` + local primitives                                                   | Shared workspace patterns               | **CLOSED** (aligned) in N-03 | Already Compliant | No           | —        | N-03  |
| G-25 | Permission undefined bypass | ~~Detail soft-opens when permissions undefined~~                                  | Undefined = deny                        | **CLOSED** in N-02           | Already Compliant | No           | —        | N-02  |
| G-26 | Permission coverage gaps    | ~~Users/search/analytics ignore permission props; create ungated~~                | Gate all sensitive surfaces             | **CLOSED** in N-02           | Already Compliant | No           | —        | N-02  |
| G-27 | Realtime chrome             | ~~Protocol jargon possible in status copy~~                                       | Product-safe live-update language       | **CLOSED** in N-03           | Already Compliant | No           | —        | N-03  |
| G-28 | Manifest branding           | `engineBranding: hidden`; chrome/title **APZ Support**                            | Keep hidden; chrome = APZ Support       | **CLOSED** in N-03           | Already Compliant | No           | —        | N-03  |

---

## Counts

| Class             | Count |
| ----------------- | ----: |
| Already Compliant |     6 |
| Native            |     7 |
| Wrapper           |     4 |
| Requires Redesign |    11 |
| Engine Leak Risk  |     0 |

---

## Engine Leak summary

| Finding                               | Verdict                                                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Engine brand in Support UI            | **None found**                                                                                                |
| Boundary test                         | **Present** (`support-architecture-boundary.test.ts`)                                                         |
| Unsafe JSON / connection-test panels  | **None**                                                                                                      |
| Could a user name the implementation? | **Unlikely from branding**; residual risk is **wrapper feel** (raw IDs, domain jargon, hardcoded permissions) |

---

## Implications for later slices

| Slice              | Driven by audit                                   |
| ------------------ | ------------------------------------------------- |
| **N-02 Identity**  | G-20, G-21, G-25, G-26                            |
| **N-03 Workspace** | G-01, G-07–G-08, G-11–G-18, G-22–G-24, G-27–G-28  |
| **N-04 APZQEP**    | Process binding once UX/identity clear            |
| **later**          | G-05 ops health (if needed), G-19 notification UX |

## Anti-goals

- Do not chase implementation feature parity from this register.
- Do not implement from this document without an authorised follow-on slice.
- Product contract remains **APZ Support**; implementation remains invisible.

## Evidence anchors

- `apps/web/components/support/*`
- `apps/web/lib/support/*`
- `apps/web/components/workbench-page.tsx`
- `services/support/manifests/**/module.yaml`
- `apps/web/components/support/support-architecture-boundary.test.ts`
- Mission: `docs/products/apzsupport/`
- Time reference: `docs/products/time/APZHUB-TIME-NATIVE-001/`
