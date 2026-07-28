# APZQEP-ARCH-010 — Verification Workbench Architecture

> **Programme:** APZQEP-ARCH-010  
> **Title:** Verification Workbench Architecture  
> **Status:** **ACCEPTED / CLOSED / COMPLETE**  
> **Classification:** Owner Architecture Programme  
> **Revision:** 1.0.0-arch  
> **Date:** 2026-07-26  
> **Owner Acceptance:** [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md)  
> **Downstream:** **APZQEP-ENG-040C** Verification Workbench Engineering

## Purpose

Authoritative interaction architecture for the **APZ QEP Verification Workbench**. Extends the accepted Workbench grammar ([APZQEP-ARCH-006](../requirements-workbench/README.md)) with Verification-specific explorers, queues, assignment, decision workflow, inspector, timeline, and dashboard models. Does **not** redesign the Platform Workbench shell.

## Pack

| Document                                                                           | Purpose                              |
| ---------------------------------------------------------------------------------- | ------------------------------------ |
| [VERIFICATION-WORKBENCH-ARCHITECTURE.md](./VERIFICATION-WORKBENCH-ARCHITECTURE.md) | Complete authoritative specification |
| [ARCHITECTURE-OVERVIEW.md](./ARCHITECTURE-OVERVIEW.md)                             | Overview companion                   |
| [WORKSPACE-MODEL.md](./WORKSPACE-MODEL.md)                                         | Workspace / pane model               |
| [EXPLORER-MODEL.md](./EXPLORER-MODEL.md)                                           | Verification Explorer                |
| [QUEUE-MODEL.md](./QUEUE-MODEL.md)                                                 | Operational queues                   |
| [ASSIGNMENT-MODEL.md](./ASSIGNMENT-MODEL.md)                                       | Assignment workflow                  |
| [DECISION-WORKFLOW.md](./DECISION-WORKFLOW.md)                                     | Lifecycle decision UX                |
| [INSPECTOR-MODEL.md](./INSPECTOR-MODEL.md)                                         | Verification Inspector               |
| [TIMELINE-MODEL.md](./TIMELINE-MODEL.md)                                           | Timeline presentation                |
| [HISTORY-MODEL.md](./HISTORY-MODEL.md)                                             | Domain history presentation          |
| [DASHBOARD-MODEL.md](./DASHBOARD-MODEL.md)                                         | Dashboard widgets                    |
| [SEARCH-MODEL.md](./SEARCH-MODEL.md)                                               | Search experience                    |
| [NAVIGATION-MODEL.md](./NAVIGATION-MODEL.md)                                       | Navigation and subject links         |
| [PERFORMANCE-MODEL.md](./PERFORMANCE-MODEL.md)                                     | Scale and loading                    |
| [ACCESSIBILITY-MODEL.md](./ACCESSIBILITY-MODEL.md)                                 | Accessibility                        |
| [AI-CONSIDERATIONS.md](./AI-CONSIDERATIONS.md)                                     | Future AI interaction                |
| [MCP-CONSIDERATIONS.md](./MCP-CONSIDERATIONS.md)                                   | Future MCP consumption               |
| [ARCHITECTURE-DECISION-RECORDS.md](./ARCHITECTURE-DECISION-RECORDS.md)             | ADR index                            |
| [ARCHITECTURE-COMPLETION-REPORT.md](./ARCHITECTURE-COMPLETION-REPORT.md)           | Completion report                    |

## Baselines

| Field                       | Value                                                                |
| --------------------------- | -------------------------------------------------------------------- |
| Platform shell              | Documents **005**, **016–023**, Design System **006**                |
| Workbench grammar           | **APZQEP-ARCH-006** ACCEPTED                                         |
| Verification architecture   | **APZQEP-ARCH-009** ACCEPTED                                         |
| Verification domain         | **APZQEP-ENG-040A** ACCEPTED                                         |
| Verification backend        | **APZQEP-ENG-040B** ACCEPTED · `@apzhub/qep-verification` **0.2.0**  |
| Requirements / Traceability | **1.0.0 CERTIFIED / FROZEN**                                         |
| Downstream engineering      | Separate Owner Engineering Instruction required — **NOT AUTHORISED** |

## STOP

APZQEP-ARCH-010 is **implemented** and awaits Owner Acceptance. Do **not** begin Verification Workbench UI, Coverage, Impact, Evidence, Certification, AI, or MCP under this architecture alone.
