# PRODUCT-CAPABILITY-MODEL

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-160       |
| Timestamp | 20260803T141613Z |

## Capability streams (Version 1.1)

| Stream | Name                    | Purpose                                                                                             |
| ------ | ----------------------- | --------------------------------------------------------------------------------------------------- |
| **A**  | Enterprise Automation   | Orchestrate Playwright, API, contract, mobile, visual, a11y, k6, security, manual                   |
| **B**  | Enterprise Integrations | GitHub, GitLab, Azure DevOps, Bitbucket, Plane/Jira, CI/CD, webhooks, release pipelines             |
| **C**  | AI Quality Intelligence | Generation, maintenance, regression selection, defect clustering, release advisor, insights         |
| **D**  | Enterprise Dashboards   | Executive, engineering, QA, ops, portfolio, readiness, risk, trends                                 |
| **E**  | Continuous Quality      | Change detection, impact analysis, auto-selection, continuous certification signals, gates, scoring |
| **F**  | Enterprise Platform     | Plugins, engines, runners, providers, evidence, events, data model, SDK, extensions                 |

## Capability map (summary)

| Domain                      | Capabilities                                         |
| --------------------------- | ---------------------------------------------------- |
| Requirements & Traceability | Quality-relevant requirements, links, coverage       |
| Planning                    | Suites, plans, risk-based selection                  |
| Execution                   | Manual + automated runners via abstraction           |
| Evidence                    | Immutable collection, retention, certification packs |
| Intelligence                | AI advisory + analytics (human-controlled decisions) |
| Release                     | Readiness score, gates, Board packs                  |
| Operations                  | Health, incidents (ops-led), quality trends          |
| Platform                    | APZHUB shell, services, connectors, events           |

## Version 1.0 foundation (preserved)

Caps A–F, Postgres SoR, fail-closed RBAC, evidence model, GA ops programme — **immutable baseline**. Version 1.1 extends; does not reopen 120/140/151/152/150R.

## Dependency sketch

```text
F (Platform) underpins A–E
A (Automation) enables B & E
B (Integrations) feeds E
C (AI) consumes A/B/E evidence; never bypasses governance
D (Dashboards) projects measured/derived intelligence
```
