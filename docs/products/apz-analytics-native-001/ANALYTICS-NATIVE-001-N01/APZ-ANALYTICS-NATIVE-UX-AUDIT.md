# APZ Analytics — Native UX Audit (Gap Register)

| Field       | Value                                                                                         |
| ----------- | --------------------------------------------------------------------------------------------- |
| Slice       | **APZ-ANALYTICS-NATIVE-001-N01**                                                              |
| Status      | **COMPLETE** (analysis only)                                                                  |
| Timestamp   | 20260805T174500Z                                                                              |
| Method      | Static review of Analytics Workbench UI, manifests, permissions; compared to APPROVED mission |
| Engineering | **None**                                                                                      |
| Mission     | [../../apzanalytics/PRODUCT-MISSION.md](../../apzanalytics/PRODUCT-MISSION.md) **APPROVED**   |
| Board       | [../PRODUCT-BOARD-ENTERPRISE-INSIGHT.md](../PRODUCT-BOARD-ENTERPRISE-INSIGHT.md) **IN FORCE** |
| Authority   | [OWNER-AUTHORISATION.md](./OWNER-AUTHORISATION.md)                                            |

## Objective

Determine whether APZ Analytics already behaves like the **enterprise decision product**.

**Central audit questions:**

1. Do users start with a business question / decision — or a dashboard catalogue?
2. Does the product improve decisions, or only measure activity?
3. Are SoRs observed only — never owned?

## Classification legend

| Class                 | Meaning                            |
| --------------------- | ---------------------------------- |
| **Already Compliant** | Meets EDS contract today           |
| **Native**            | APZHUB-owned; polish may be needed |
| **Wrapper**           | Thin / incomplete                  |
| **Engine Leak Risk**  | Engine/adapter identity visible    |
| **Requires Redesign** | Must change for EDS identity       |

## Scope inventory

Base: `/workspace/analytics` via `AnalyticsWorkspaceRouter`.

| Surface                                                     | Present                 |
| ----------------------------------------------------------- | ----------------------- |
| Home (curated suites / catalogues)                          | Yes — measurement-first |
| Suites (executive, operational, projects, time, support, …) | Yes                     |
| Dashboard detail / saved / datasets / reports / search      | Yes                     |
| Health / diagnostics                                        | Yes                     |
| Enterprise questions entry (EQ-*)                           | **No**                  |
| Decision / horizon framing                                  | **No**                  |
| Help / settings (EDS)                                       | **No**                  |

Activity Bar: **Analytics** (`chart-column`). Commands: Open Analytics Home, Executive Dashboard, Saved Dashboards, Search Dashboards, Health.

---

## Gap register

| ID   | Area                              | Current                                           | Target                                             | Gap                                                      | Class             | Priority | Feeds |
| ---- | --------------------------------- | ------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------- | ----------------- | -------- | ----- |
| G-01 | Product identity                  | “Analytics Workbench” / curated dashboards        | **Enterprise Decision Support** / decision product | Dashboard product framing                                | Requires Redesign | Critical | N-03  |
| G-02 | Entry mental model                | Suites → catalogue → dashboard                    | Question → answer → (optional viz)                 | Users start with dashboards                              | Requires Redesign | Critical | N-03  |
| G-03 | Decision before measurement       | KPI/scorecard/utilisation suites                  | Decision-improving questions                       | Activity measurement dominates                           | Requires Redesign | Critical | N-03  |
| G-04 | Enterprise questions              | EQ catalogue unused in UI                         | EQ-E/M/S/P/Q/T/W surfaced                          | Questions absent from chrome                             | Requires Redesign | Critical | N-03  |
| G-05 | Horizons                          | Not present                                       | Operational / Tactical / Strategic                 | No horizon IA                                            | Requires Redesign | High     | N-03  |
| G-06 | Named engine (Metabase)           | Masked in UI; errors sanitized                    | Keep zero brand                                    | Compliant for brand strings                              | Already Compliant | —        | —     |
| G-07 | RBAC language                     | `analytics.dashboard.*` / report / dataset        | Insight/question-oriented grants (or mapped)       | Permission vocabulary is viz-led                         | Native            | High     | N-02  |
| G-08 | Default UI permissions            | Router defaults `analytics.*`                     | Session only; never hardcode wildcard              | Identity gap (Documents/Workflow N-02 pattern)           | Requires Redesign | High     | N-02  |
| G-09 | SoR ownership                     | Some copy notes reporting SoR authoritative       | Strict observe-only; no Analytics SoR              | Mostly compliant in spirit; UX still catalogue-of-assets | Native            | Medium   | N-03  |
| G-10 | Shell integration                 | DesktopShell mount                                | Peer workspace                                     | Compliant                                                | Already Compliant | —        | —     |
| G-11 | Breadcrumbs / help / settings     | Incomplete vs RI products                         | APZ Analytics chrome + EDS help                    | Missing                                                  | Requires Redesign | Medium   | N-03  |
| G-12 | Vocabulary                        | Dashboard, suite, report, dataset first           | Question, decision, horizon, insight               | Viz vocabulary dominant                                  | Requires Redesign | High     | N-03  |
| G-13 | Cross-RI observation              | Suites named by domain                            | Explicit observe RI #001–#005 for decisions        | Partial (named suites) without decision framing          | Wrapper           | Medium   | N-03  |
| G-14 | Strategic / Product Board horizon | Absent                                            | “What should we do?” / quarterly learning          | Missing                                                  | Requires Redesign | Medium   | N-03+ |
| G-15 | Legacy docs conflict              | `analytics/` + `apz-analytics/` viz-led 1.0 packs | Mission pack authoritative                         | Docs debt                                                | Native            | Medium   | note  |
| G-16 | Enterprise capability docs        | Mission APPROVED; principles IN FORCE             | Remain authoritative                               | Docs ahead of experience                                 | Already Compliant | —        | —     |
| G-17 | Support-module analytics          | Separate `/workspace/support/analytics`           | Clear boundary; no dual Analytics products         | Portfolio adjacency                                      | Native            | Low      | note  |

---

## Area summaries

| Area                            | Result                                         | Detail                                     |
| ------------------------------- | ---------------------------------------------- | ------------------------------------------ |
| Native Experience               | **GAPS IDENTIFIED**                            | Shell yes; identity is Workbench/dashboard |
| Engine Leakage                  | **PASS** (brand)                               | Metabase masked                            |
| Measurement vs Decision         | **GAPS IDENTIFIED**                            | Activity/KPI catalogue first               |
| Questions before visualisations | **GAPS IDENTIFIED**                            | No EQ path                                 |
| System of Record Boundaries     | **PASS** (model) / **GAPS** (UX asset framing) | Must not invent Analytics SoR              |
| Three horizons                  | **GAPS IDENTIFIED**                            | Absent                                     |
| Relationship to RI #001–#005    | **GAPS IDENTIFIED**                            | Suites exist; decision framing missing     |
| Enterprise Capability Alignment | **PASS** (docs)                                | Mission/Board ahead of UI                  |

## Verdict

APZ Analytics is **not yet** a native Enterprise Decision Support product. The dominant defect is **dashboard-product identity** — measurement and visualisation catalogue as the mental model — contradicting Decision Before Measurement and Questions Before Visualisations.

N-01 records gaps only. No engineering in this slice.
