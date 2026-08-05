# Portfolio Decision — Next Investment: APZ Projects

| Field     | Value                                                                                  |
| --------- | -------------------------------------------------------------------------------------- |
| Status    | **DECIDED**                                                                            |
| Timestamp | 20260805T052000Z                                                                       |
| Authority | Product Board / Owner direction                                                        |
| Review    | [APZHUB-QUARTERLY-PORTFOLIO-REVIEW.md](./APZHUB-QUARTERLY-PORTFOLIO-REVIEW.md) QPR-001 |

## Decision

> **Next portfolio investment is APZ Projects — beginning with APZ-PROJECTS-000 (Product Mission & Business Outcomes). Do not open APZ-PROJECTS-NATIVE-001 until the mission is Owner-APPROVED.**

Do **not** start Documents, Workflow, Analytics, or Law in parallel.

## Scoring (Product Board view)

| Product              | Daily Internal Use | Business Impact | Adoption Complexity | Priority |
| -------------------- | -----------------: | --------------: | ------------------: | -------: |
| **APZ Projects**     |         ⭐⭐⭐⭐⭐ |      ⭐⭐⭐⭐⭐ |              Medium |    **1** |
| **APZ Documents**    |           ⭐⭐⭐⭐ |      ⭐⭐⭐⭐⭐ |              Medium |    **2** |
| **APZ Workflow**     |             ⭐⭐⭐ |      ⭐⭐⭐⭐⭐ |                High |    **3** |
| **APZ Analytics**    |             ⭐⭐⭐ |        ⭐⭐⭐⭐ |              Medium |    **4** |
| **APZ Law Platform** |               ⭐⭐ |        ⭐⭐⭐⭐ |                High |    **5** |

## Why APZ Projects

1. **Centre of daily work** — coordination hub for planning, tasks, milestones, releases; natural connect point for Time, Support, Documents, quality evidence.
2. **APZQEP becomes more valuable** — Quality Flows can relate to project / epic / feature / sprint / release context without changing APZQEP architecture.
3. **Unlocks the portfolio** — mature Projects becomes the operational backbone for later richer integrations.

```text
APZ Projects
      │
      ├── APZ Time
      ├── APZ Support
      ├── APZ Documents
      ├── APZQEP
      ├── APZ Workflow
      └── APZ Analytics
```

## Proposed roadmap

### Complete

- ✅ APZQEP Enterprise Baseline
- ✅ APZ Time — Reference Implementation #001
- ✅ APZ Support — Reference Implementation #002
- ✅ Native Adoption methodology — operationally validated

### Next (in progress)

- ✅ **APZ-PROJECTS-000** — Owner APPROVED / CLOSED — [../apzprojects/](../apzprojects/)
- 🎯 **APZ-PROJECTS-NATIVE-001** — N-01 COMPLETE; N-02+ pending — [../apz-projects-native-001/](../apz-projects-native-001/)
- Reference Implementation #003 — **if earned** after N-04

### After RI #003 (updated PB-002)

- ✅ APZ Projects — RI #003 complete
- 🎯 **APZ-DOCUMENTS-000** — Mission open — [../apzdocuments/](../apzdocuments/)
- Then Workflow → Analytics → Law per [APZHUB-PORTFOLIO-BUSINESS-ROADMAP.md](./APZHUB-PORTFOLIO-BUSINESS-ROADMAP.md)

> Portfolio delivery does **not** wait for pilot friction. Platform evolution still does.

## Explicit non-actions

- No APZ-PROJECTS-NATIVE-001 until mission APPROVED
- No parallel Native Adoption programmes
- No Playbook or APZQEP redesign from this decision
- No engine / architecture discussion in PRODUCT-000
