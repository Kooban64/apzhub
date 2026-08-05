# Capability Coverage — Unified Work Experience

| Field     | Value                            |
| --------- | -------------------------------- |
| Programme | APZHUB-CAPABILITY-001-VALIDATION |
| Status    | **COMPLETE**                     |
| Timestamp | 20260805T101500Z                 |

## Method

Map CAPABILITY-001 requirements to existing portfolio ability.  
If not satisfied: record gap — do not solve.

## Coverage matrix

| Requirement (from CAPABILITY-001)  | Satisfied by today?                             | Source                                                           | Notes                                    |
| ---------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------- |
| Work definition vocabulary         | **Definition yes** / runtime aggregation **no** | CAPABILITY-001 docs                                              | Needs engineering later                  |
| My Work unified queue              | **No** (definition only)                        | Shell has product “My Work” in Projects, not portfolio queue     | Gap G-UW-01                              |
| Assigned to me                     | Partial                                         | Projects tasks, Support assignments, Time (limited)              | Aggregation missing                      |
| Waiting for me / others            | Partial                                         | Product statuses exist; shared lifecycle mapping not implemented | Gap G-UW-02                              |
| Blocked                            | Partial                                         | Projects/Support concepts exist; not unified                     | Gap G-UW-02                              |
| Due today / High priority          | Partial                                         | Per-product fields; no unified lens                              | Gap G-UW-01                              |
| Needs approval                     | Partial                                         | APZQEP + Support escalations; not one lens                       | Gap G-UW-03                              |
| Ready to release                   | Partial                                         | APZQEP ops packs; not My Work surface                            | Gap G-UW-03                              |
| Recently completed                 | Partial                                         | Product histories; no personal unified lens                      | Gap G-UW-01                              |
| Work context panel (cross-links)   | Partial                                         | Product detail + shell context patterns (Support/Projects N-03)  | Cross-SoR links incomplete — Gap G-UW-04 |
| Work-centred navigation            | Partial                                         | Shell + deep links; work-first entry not primary                 | Gap G-UW-05                              |
| Role lenses (Exec/Manager/…)       | **No**                                          | Definition only                                                  | Gap G-UW-06                              |
| Shared lifecycle projection        | **No**                                          | Definition only; products keep native statuses                   | Gap G-UW-02                              |
| Action from Projects               | **Yes**                                         | APZ Projects RI #003                                             | Owner intact                             |
| Request from Support               | **Yes**                                         | APZ Support RI #002                                              | Owner intact                             |
| Record from Time                   | **Yes**                                         | APZ Time RI #001                                                 | Owner intact                             |
| Quality action from APZQEP         | **Yes**                                         | APZQEP baseline + product ops packs                              | Owner intact                             |
| Document Review                    | **No**                                          | APZ Documents not adopted                                        | Gap G-UW-07                              |
| Risk as first-class work           | **No** clear SoR                                | No dedicated Risk product                                        | Gap G-UW-08                              |
| Decision (operational, non-APZQEP) | Partial                                         | Scattered; no single SoR                                         | Gap G-UW-09                              |
| One identity across journey        | **Yes**                                         | N-02 on RI products                                              | —                                        |
| Permissions filter My Work         | **Yes** (platform)                              | Platform authorization                                           | Must apply at aggregation                |
| No engine exposure                 | **Yes** (RI products)                           | Native Adoption                                                  | —                                        |

## Coverage verdict

| Class                                                                             | Verdict                                             |
| --------------------------------------------------------------------------------- | --------------------------------------------------- |
| Achievable with current RI portfolio for core Action / Request / Record / Quality | **Yes**                                             |
| Fully satisfied as a live experience today                                        | **No** — definition complete; aggregation not built |
| Blockers that force product ownership change                                      | **None**                                            |
| Blockers that force new SoR for core kinds                                        | **None**                                            |

**VALIDATED** as implementable through composition of existing products, with documented gaps.
