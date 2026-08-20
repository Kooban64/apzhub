# APZQEP REDESIGN — PHASE 1

Date: 2026-08-18  
Authority: Owner acceptance of Phase 0 + Phase 1 instruction  
Evidence: [evidence/phase-1/](./evidence/phase-1/)

Phase 2 was **not started**.

---

## 1. Old presentation replaced

The Quality Flow KPI home (`qep-home-verdict` / `qep-home-metrics` / release-confidence dashboard) is no longer the `/workspace/qep` and `/workspace/qep/home` landing surface.

The flattened catalogue sidebar (Overview, Applications, Test Library, Plans, Runs, Defects, Automation, Evidence, Releases, Source) is no longer the APZQEP navigation authority.

My Work is no longer a static-link page.

Existing destination screens that Phase 1 did not redesign still render through the existing routers. They were not wrapped in a second product chrome.

## 2. New shell/composition

APZQEP uses the existing APZ Workbench:

- Activity rail | APZQEP context sidebar | main workspace | inspector (collapsed until selection)
- Bottom panel remains collapsed unless a QEP/PEN resolver supplies content
- Header: `APZ │ APZQEP` then Application only when portfolio projects exist. Tenant is not primary QEP context.
- Status: `APZHUB` / `APZQEP · QEP Master` / `Connected`
- QEP desktop breakpoint is 1024px so tablet widths do not squeeze the desktop sidebar
- QEP mobile composition: Home | Work | Defects | More

QEP Master is a **UX composition**, not a new IAM role. Account admin entries still follow the real persona (`org_member` does not see Platform Administration).

## 3. QEP Master navigation

Sectioned Master IA, compact uppercase section labels, permission-filtered leaves.

Shown when entitled and permitted:

Home (Overview, My Work) · Portfolio (Applications) · Define (Requirements) · Test (Test Cases, Test Suites, Test Plans, Test Runs) · Verify (Manual Execution, Automation) · Assure (Defects, Evidence, Traceability, Coverage, Quality Risk) · Engineering (Builds & CI, Source if independently entitled) · Release Assurance (Readiness, Certification) · Insights (Quality Intelligence, Reports) · Administration (Settings, Integrations, Audit)

Omitted as honest gaps (not fake pages):

User Stories · Exploratory · UI/UX Verification · Portfolio Releases · Gates · Environments · Teams · Roles · Release Policies · People & Access

Source is never implied by `qep.*`. `source.write` does not reveal Source.

## 4. Quality Command Centre

Attention and decision surface, not a statistics dashboard.

Four panes:

1. Attention — critical defects, retest-required defects, verification-gap count
2. Quality context — selected application name if any, factual counts, links to defects / My Work / certification
3. My work — assigned execution/defect/retest counts from real assignment APIs
4. Recent quality activity — `/api/v1/qep/audit` items, or an unavailable state

No READY / AT RISK / NOT READY / release % / quality score.

Demo tenant currently shows honest zeros plus noisy but real security-bridge audit rows (`bridge.security_assurance.read · unavailable:none`). That is repository truth, not invented posture.

## 5. Command Centre real data sources

| Question                           | Source                                                                     | Honesty                                        |
| ---------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------- |
| What needs attention?              | `GET /api/v1/qep/defects?severity=critical` and `status=ready_for_retest`  | Real defects only                              |
| What work is assigned to me?       | `GET /api/v1/qep/executions/assigned` and defects `assigneeId=currentUser` | Assignee only; not `createdBy`                 |
| What verification is incomplete?   | Coverage dashboard `summary.uncovered`                                     | Count only; `averageCoverage` is not displayed |
| What could affect quality/release? | Critical / retest / uncovered facts                                        | No fake release verdict                        |
| What changed recently?             | `GET /api/v1/qep/audit`                                                    | Real events or unavailable                     |

Portfolio quality-project ids are **not** passed as Cap `projectId`.

Unavailable APIs omit or show an unavailable state; they do not fail the whole page.

## 6. My Work

Route: `/workspace/qep/my-work`

Assigned executions + assigned defects, tabs (Assigned to me / Retest / Executions / Defects), search, Type and State filters, Application filter only when work items expose a context value.

Row select opens the shell Inspector with identity / state / context / related facts and Open Defect or Open Execution. It does not embed the full detail screen.

Demo tenant currently has **no assigned executions or defects**, so the table empty-state is honest. Inspector visual evidence could not be captured against a selected row in this environment. Unit tests prove the inspector payload.

## 7. Application context

**PARTIAL**

Portfolio `GET /api/v1/qep/portfolio/projects` is the only source. No new Application aggregate. No data migration.

The header Application selector is shown only when that API returns projects. The demo tenant returned none, so the selector is omitted. Command Centre shows Application = Not selected.

Existing `projectId` strings on artefacts are still displayed as context, not as a first-class Application.

## 8. Release context

**DEFERRED — NO AUTHORITATIVE RELEASE AGGREGATE**

No Release selector. No READY / AT RISK / release score. Existing release strings on artefacts were left untouched.

## 9. Source independence

- QEP entitlement ≠ Source access
- Source nav requires independent `source.read` / capabilities `canRead`
- `source.write` is irrelevant to Phase 1 UX
- Source workspace remains read + context (`SOURCE_SLICE3_READ_CONTEXT_ONLY`)
- No commit / push / PR / merge / Terminal / shell / RCE in this phase
- `hasQepPermission("qep.*")` no longer grants `source.read` (bugfix)

Visual 09 (finance, no source) did not reach a completed QEP shell — finance stays on the workbench interstitial. Functional proof is `GET /api/v1/source/capabilities` 403 and unit tests. Visual 10 shows Source under Engineering for `org_member`.

## 10. Responsive/mobile foundation

- ≥1024px QEP: rail + sidebar + main + collapsed inspector
- <1024px QEP: main + bottom nav (Home | Work | Defects | More)
- Mobile evidence confirms no desktop sidebar squeeze
- Tester mobile execution workflow was not built (Phase 4)

Laptop 1280 evidence is the same composition as desktop with inspector collapsed.

## 11. Light/dark

Both captured. Dark mode is a quality-engineering workbench (tokens, compact tables/panes), not an IDE skin. Source remains an engineering surface; APZQEP overall is not restyled as one.

## 12. Permissions/AuthZ

Existing effective permissions remain authoritative. No nine-role IAM catalogue. No Platform Admin or Organisation Admin implied by QEP Master.

| Case                        | Result                                                             |
| --------------------------- | ------------------------------------------------------------------ |
| QEP entitled (`org_member`) | APZQEP rail, Master IA, Command Centre                             |
| Non-QEP (`finance`)         | `productKeys` lacks `qep`; Command Centre absent                   |
| QEP Master composition      | Status hint only; account menu follows real persona                |
| `source.read` absent        | Source hidden (unit + finance capabilities)                        |
| `source.read` present       | Source leaf under Engineering                                      |
| `source.write`              | Unused by Phase 1 UX                                               |
| Tenant isolation            | Unchanged API tenant scope; UI does not accept a foreign tenant id |

## 13. Tests

- `apps/web/lib/qep/qep-permission.test.ts`
- `apps/web/lib/workbench/compose-qep-sidebars.test.ts`
- `apps/web/lib/workbench/compose-workbench-rail.test.ts`
- `apps/web/components/qep/qep-home-views.test.tsx`
- `apps/web/components/qep/qep-my-work-view.test.tsx`
- `testing/playwright/e2e/apzqep-phase-1-master.spec.ts`
- Home assertion in `testing/playwright/e2e/apzqep-201-release-control-centre.spec.ts` updated so it no longer expects the KPI verdict dashboard

## 14. Visual evidence

Stored under `docs/frontend/apzqep-redesign/evidence/phase-1/`:

| File                                      | Note                                               |
| ----------------------------------------- | -------------------------------------------------- |
| `01-qep-command-centre-desktop-light.png` | Command Centre + Master IA                         |
| `02-qep-command-centre-desktop-dark.png`  | Dark                                               |
| `03-qep-command-centre-laptop.png`        | 1280 laptop                                        |
| `04-qep-command-centre-mobile.png`        | Bottom nav foundation                              |
| `05-qep-master-navigation.png`            | Same composition as 01 (nav is in-frame)           |
| `06-qep-my-work-desktop.png`              | Empty assigned-work table                          |
| `07-qep-my-work-inspector.png`            | **Same as 06** — no assigned row to select         |
| `08-qep-my-work-mobile.png`               | Mobile My Work                                     |
| `09-qep-source-hidden-no-access.png`      | **Weak** — finance interstitial, not a QEP sidebar |
| `10-qep-source-visible-read-access.png`   | Source under Engineering; main still hydrating     |

Owner visual review should concentrate on 01, 02, 04, 06, 08, 10.

## 15. Genuine gaps discovered

1. Application is still a portfolio file ledger, not a selector-grade aggregate (demo list empty).
2. No assigned QEP work in the demo tenant, so My Work inspector and Command Centre attention lists could not be screenshot with real items (unit tests cover the mapping).
3. Audit activity is technically honest but noisy (security-bridge `unavailable:none` rows).
4. No demo persona that is QEP-entitled **and** Source-denied while still rendering the QEP shell — 09 could not show a QEP sidebar without Source.
5. Header still includes the platform tenant switcher, help, and theme toggle from the shared workbench (not a Release selector).
6. Administration destinations in the target IA (People & Access, Teams, Roles, Environments, Release Policies, Settings) remain unimplemented as product screens.
7. `qep.*` previously short-circuited `hasQepPermission` for **any** required key including `source.read`. That is now fixed.

## 16. Regression check

- No parallel QEP backend
- No Source write / PR / Terminal enablement
- Existing QEP routes and APIs retained
- Destination pages that Phase 1 did not redesign still use existing views
- SPR-201 Release Readiness page was not redesigned; only Home expectations were corrected

## 17. Phase 2 implications

Phase 2 (Define: Requirements → User Stories → Acceptance Criteria) can proceed only after Owner visual review of Command Centre, Master navigation, My Work, and responsive composition.

Do not treat Phase 1 empty demo data as a reason to invent Stories/AC objects. Those remain later-phase domain work.

When Phase 2 starts:

- User Stories must be a real domain, not a nav alias
- Requirements remain the current SoR until Stories exist
- Do not pretend Application/Release aggregates were completed here

---

PHASE 1 FUNCTIONAL STATUS: **PARTIAL**

PHASE 1 VISUAL STATUS: **READY FOR OWNER REVIEW**

OLD QEP HOME: **REPLACED**

OLD FLATTENED SIDEBAR: **REPLACED**

PARALLEL QEP BACKEND CREATED: **NO**

SOURCE WRITE ENABLED: **NO**

PHASE 2: **NOT STARTED**
