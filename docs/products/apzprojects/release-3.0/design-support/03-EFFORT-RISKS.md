# Design Support — Effort & Risks

Effort bands (indicative, single-engineer-equivalent days): **S** ≤2 · **M** 3–8 · **L** 9–20 · **XL** 20+

## Baseline risk themes

| Risk                      | Why it matters                                                 | Mitigation                                                                          |
| ------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Dual SoR confusion        | Wave A registers on platform Postgres; projects/tasks on Plane | Bible must state ownership per entity; Engineering never merges SoRs                |
| Thin sprint/roadmap today | Easy to over-promise “roadmap” as Gantt                        | CPO defines exact behaviour; Engineering maps to new vs extend                      |
| Notification gap          | Events exist, delivery product doesn’t                         | Ch.09 drives platform Notification Framework work — Prep possible for plumbing only |
| UI chrome divergence      | Local `projects-ui` vs `@apzhub/ui`                            | Prep Track: migrate shell to shared components early                                |
| Scope XL                  | Full competitive PM is multi-sprint                            | Release Plan must phase if Auth’d build can’t be one shot                           |

## Provisional effort (pre-Bible — revise after Feature Catalogue)

| Theme                                                             | Band | Notes                          |
| ----------------------------------------------------------------- | ---- | ------------------------------ |
| Elevate shared UI adoption in Projects shell                      | M    | Prep candidate                 |
| Sprint entity API client + UI                                     | M–L  | Contracts exist                |
| Board / Kanban                                                    | L–XL | Greenfield                     |
| Timeline / Gantt                                                  | XL   | Greenfield + perf              |
| Collaboration (comments/activity/files)                           | L–XL | Depends on Documents/SoR rules |
| Notifications product wiring                                      | M    | Platform framework exists      |
| Wave A depth + Context integration                                | M    | Extend existing                |
| Templates / baselines / critical path / approvals / import-export | XL   | Largely greenfield             |

_Estimates will be rewritten feature-by-feature as `06-FEATURE-CATALOGUE.md` lands._
