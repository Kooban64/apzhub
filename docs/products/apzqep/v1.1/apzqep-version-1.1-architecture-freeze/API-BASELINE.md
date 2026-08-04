# API Baseline — APZQEP Version 1.1

Frozen SDK surface on `createPlatformOrchestration()` (composition root):

| Surface                    | Responsibility (frozen)               |
| -------------------------- | ------------------------------------- |
| `kernel`                   | Lifecycle / readiness                 |
| `capabilities`             | Capability catalogue                  |
| `contracts` / `lifecycles` | Contract / lifecycle registries       |
| `triggers`                 | Normalized trigger routing            |
| `qualityFlows`             | Quality Flow definitions / instances  |
| `impact`                   | Impact correlation                    |
| `policySelection`          | Policy & quality selection            |
| `governance`               | Governance decisions                  |
| `approvals`                | Approval bundles                      |
| `decisions`                | Decision packages                     |
| `events`                   | Event Backbone (transport only)       |
| `automationCoordination`   | Automation intents (no execution)     |
| `sourceChange`             | Source identity packages (no SCM ops) |
| `enrichment`               | Advisory enrichment                   |
| `evidenceIntegration`      | Evidence refs + report views          |
| `executiveExperience`      | Executive projections                 |
| `operational`              | Descriptive operational readiness     |
| `workspaceExperience`      | Operator workspace composition        |

Logical operational path hints (QO-016) remain descriptive GET surfaces only —
not a redesignable HTTP product API in V1.1.
