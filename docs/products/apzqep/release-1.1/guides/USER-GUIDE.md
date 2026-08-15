# APZQEP 1.1 — User Guide

| Audience | Quality leads · Engineers · Release managers · Executives |
| -------- | --------------------------------------------------------- |
| Product  | APZQEP Version 1.1                                        |

> **Current operator how-to (full product bar):** [OPERATOR-USER-GUIDE.md](../../guides/OPERATOR-USER-GUIDE.md) — Phase 2–3, AI/MCP, continuous signals, APZPEN bridge.

## Getting started

1. Sign in to APZHUB (single SSO).
2. Open the **Quality** workspace from the Activity Bar (permission-filtered).
3. Prefer **Quality Flow Workspace** for day-to-day release quality orchestration.

## Primary workspaces

| Workspace                          | Path                                   | Use when                                           |
| ---------------------------------- | -------------------------------------- | -------------------------------------------------- |
| Quality Flow Workspace             | `/workspace/qep/quality-flows`         | Active flows, waiting work, exceptions, decisions  |
| Suites / Plans / Execution         | Cap A–C routes under `/workspace/qep/` | Test assets and execution                          |
| Defects / Requirements / Reporting | Cap D–F routes                         | Defects, traceability, reports                     |
| Automation                         | `/workspace/qep/automation`            | Provider-neutral automation runs                   |
| Source Control                     | `/workspace/qep/scm`                   | Repository registration and webhook history        |
| Quality Intelligence               | `/workspace/qep/quality-intelligence`  | Recommendations, scores, confidence                |
| Dashboards                         | `/workspace/qep/dashboards`            | Persona dashboards (honest empty until data bound) |
| Evidence                           | `/workspace/qep/evidence`              | Capture, explore, and govern evidence              |

## Quality Flow Workspace (flagship)

- **Command centre** — active flows, waiting, exceptions, recent changes, decision packages.
- Open a flow for stage, next action, approvals, evidence, and timeline.
- Operate only with `qep.quality_flows.operate`; view with `.read`.

## Dashboards

Persona dashboards show **honest empty** when not bound to a System of Record — this is intentional, not an outage.

## Support

Report production defects through the operational incident process. Enhancements are Version 1.2 / Product Board only.
