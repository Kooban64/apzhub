# APZQEP-164-000 — Enterprise Dashboard & Quality Experience Architecture

| Field       | Value                                                 |
| ----------- | ----------------------------------------------------- |
| Programme   | **APZQEP-164-000**                                    |
| Wave        | 4                                                     |
| Version     | 1.1                                                   |
| Status      | **ARCHITECTURE COMPLETE**                             |
| Engineering | **UNCHANGED / NONE**                                  |
| Timestamp   | 20260803T191002Z                                      |
| Evidence    | `evidence/apzqep-164-000/20260803T191002Z/`           |
| Next        | Product Board review → then Owner Auth for APZQEP-164 |

## Strategic title refinement (Wave 4)

| APZQEP-160 / PBR-163 working title                                   | Authoritative for this pack                     |
| -------------------------------------------------------------------- | ----------------------------------------------- |
| Enterprise Dashboards / Enterprise Dashboards & Executive Experience | **Enterprise Dashboards & Experience Platform** |

Programme identifier **APZQEP-164** is preserved for roadmap continuity.  
This pack is the architecture authority for Wave 4 naming and structure pending Board approval.

APZQEP-160 historical documents are **not rewritten**.

## Intended reusable platform packages (future engineering)

```text
@apzhub/platform-dashboard        — dashboard framework (layouts, widgets, saved views)
@apzhub/platform-visualization    — charts, timelines, heatmaps, evidence viewers
```

**Not** `@apzhub/platform-experience` (too broad; avoid dumping-ground package).

APZQEP owns the **Quality Experience** composition built from those packages.

## Architectural stack

```text
Platform Automation
        ↓
Platform SCM
        ↓
Evidence Platform
        ↓
Quality Intelligence Platform
        ↓
Enterprise Dashboards & Experience Platform   ← Wave 4 (this architecture)
```

Dashboards are **consumers**. They are not systems of record and not business engines.

## Documents

| Document                        | Path                                                                             |
| ------------------------------- | -------------------------------------------------------------------------------- |
| Vision                          | [DASHBOARD-VISION.md](./DASHBOARD-VISION.md)                                     |
| Quality Experience Architecture | [QUALITY-EXPERIENCE-ARCHITECTURE.md](./QUALITY-EXPERIENCE-ARCHITECTURE.md)       |
| Platform Dashboard              | [PLATFORM-DASHBOARD.md](./PLATFORM-DASHBOARD.md)                                 |
| Platform Visualization          | [PLATFORM-VISUALIZATION.md](./PLATFORM-VISUALIZATION.md)                         |
| Workspace                       | [WORKSPACE-ARCHITECTURE.md](./WORKSPACE-ARCHITECTURE.md)                         |
| Visual Component Library        | [VISUAL-COMPONENT-LIBRARY.md](./VISUAL-COMPONENT-LIBRARY.md)                     |
| Persona Dashboards              | [PERSONA-DASHBOARDS.md](./PERSONA-DASHBOARDS.md)                                 |
| Evidence Visualization          | [EVIDENCE-VISUALIZATION.md](./EVIDENCE-VISUALIZATION.md)                         |
| QI Visualization                | [QUALITY-INTELLIGENCE-VISUALIZATION.md](./QUALITY-INTELLIGENCE-VISUALIZATION.md) |
| Release Readiness Experience    | [RELEASE-READINESS-EXPERIENCE.md](./RELEASE-READINESS-EXPERIENCE.md)             |
| APIs                            | [API-ARCHITECTURE.md](./API-ARCHITECTURE.md)                                     |
| Performance                     | [PERFORMANCE-ARCHITECTURE.md](./PERFORMANCE-ARCHITECTURE.md)                     |
| Accessibility                   | [ACCESSIBILITY-ARCHITECTURE.md](./ACCESSIBILITY-ARCHITECTURE.md)                 |
| Commercial Position             | [COMMERCIAL-POSITION.md](./COMMERCIAL-POSITION.md)                               |
| Implementation Roadmap          | [IMPLEMENTATION-ROADMAP.md](./IMPLEMENTATION-ROADMAP.md)                         |
| Programme Breakdown             | [PROGRAMME-BREAKDOWN.md](./PROGRAMME-BREAKDOWN.md)                               |
| Product Board Review            | [PRODUCT-BOARD-REVIEW.md](./PRODUCT-BOARD-REVIEW.md)                             |
| Completion                      | [APZQEP-164-000-COMPLETION.md](./APZQEP-164-000-COMPLETION.md)                   |
| Owner Auth                      | [OWNER-AUTHORISATION.md](./OWNER-AUTHORISATION.md)                               |

## Stop

No engineering. No dashboard/widget/chart implementation. Await Product Board approval before APZQEP-164.
