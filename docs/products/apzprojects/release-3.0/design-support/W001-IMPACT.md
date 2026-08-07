# Design Support — Workshop 001 Impact

**Against:** `design/W001-FIRST-PRINCIPLES.md`  
**As-built:** current `/workspace/projects` workbench

| Design intent                               | As-built today                                  | Build implication                                                                |
| ------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------- |
| Attention Home (“What needs my attention?”) | Thin dashboard / list-first                     | **New primary home** — attention feed + signals                                  |
| My Projects story cards                     | Table / list                                    | **New card surface** — health, milestone, risks, waiting, blockers               |
| Project Cockpit (L/C/R + activity)          | Tabbed detail (`overview`, `tasks`, `risks`, …) | **Replace tab identity** with cockpit layout; tabs may remain as deep links only |
| Commitments                                 | Tasks (Plane) + Wave A actions                  | **UX + model layer** over work items; failure/waiting first-class                |
| Milestone as Context hub                    | Wave A milestone register (fields thinner)      | **Extend milestone surface** + compose Context providers                         |
| Roadmap-first timeline                      | Due-date task list                              | **New timeline** (Linear-class); Gantt secondary                                 |
| Question reports                            | Not present                                     | New question→evidence answers (Analytics pattern)                                |
| Sparse notifications                        | Events YAML only                                | Wire Attention-grade notifies only                                               |
| Mobile triage                               | None                                            | Separate mobile flows                                                            |

## Reuse now

- Delivery health + risks/decisions/actions/milestones APIs (Wave A)
- Enterprise Context panel (becomes Cockpit **right**)
- Activity: need product stream (contract activity exists, no UI)
- Design tokens / `@apzhub/ui` for cards and motion

## Do not reuse as identity

- Tabbed project detail as primary IA
- Task table as the soul of work
- Static “Projects / Templates / Members” nav as home

## Ready for next workshop

**Home / Attention + My Projects cards — every pixel and interaction.**
