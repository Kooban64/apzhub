# Event Catalogue Baseline — APZQEP Version 1.1

All Wave 5 events are **past-tense facts**. No command events.

Source of truth in code: `packages/platform-orchestration/src/contracts/events.ts`.

| Family       | Event types                                                                                                                            |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| Kernel       | `orchestration.kernel.created/ready/paused/stopped/failed`, `orchestration.capability.registered`, `orchestration.contract.registered` |
| Trigger      | `orchestration.trigger.received/ignored/routed/rejected`                                                                               |
| Quality Flow | `orchestration.quality_flow.definition_registered/versioned`, `instance_created`, `state_transitioned`, `instance_paused/resumed`      |
| Impact       | `orchestration.impact_correlation.created`                                                                                             |
| Policy       | `orchestration.policy_selection.decision_produced`                                                                                     |
| Governance   | `orchestration.governance.decision_produced`                                                                                           |
| Approval     | `orchestration.approval.bundle_created`, `decision_submitted`                                                                          |
| Decision     | `orchestration.decision.package_created`                                                                                               |
| Automation   | `automation.coordination.created/updated/completed`, `automation.intent.identified`                                                    |
| Source       | `source.change.associated`, `source.package.created/updated`, `source.identity.normalized`                                             |
| Enrichment   | `quality.enrichment.created/completed`, `advisory.insight.attached`, `enrichment.package.created`                                      |
| Evidence     | `evidence.integration.created`, `evidence.package.completed`, `report.generated`, `report.profile.applied`                             |
| Executive    | `executive.experience.created`, `executive.package.completed`, `executive.persona.applied`, `executive.projection.updated`             |
| Operational  | `operational.readiness.created`, `health.contract.updated`, `readiness.contract.published`, `operational.package.completed`            |
| Workspace    | `workspace.experience.created`, `workspace.package.completed`, `workspace.layout.updated`, `workspace.navigation.composed`             |

Enhancement programmes may register **additional** past-tense event types through
the Event Backbone registry. They must not redefine frozen V1.1 event semantics.
