# APZQEP-OES-ENG-060B — APPENDIX A — Command ↔ Domain Traceability

| Application command | Domain function          | Events (typical)                                     |
| ------------------- | ------------------------ | ---------------------------------------------------- |
| CreatePlan          | `createTestPlan`         | `qep.plan.created`                                   |
| UpdatePlanContent   | `updateTestPlanContent`  | `qep.plan.updated`                                   |
| UpdatePlanMetadata  | `updateTestPlanMetadata` | `qep.plan.updated`                                   |
| TransferOwnership   | `transferOwnership`      | `qep.plan.updated`                                   |
| UpdateAssignment    | `updateAssignment`       | `qep.plan.updated`                                   |
| UpdateSchedule      | `updateSchedule`         | `qep.plan.updated`                                   |
| AddPlanItem         | `addPlanItem`            | `qep.plan.item.added`                                |
| UpdatePlanItem      | `updatePlanItem`         | `qep.plan.item.updated`                              |
| RemovePlanItem      | `removePlanItem`         | `qep.plan.item.removed`                              |
| ReorderPlanItems    | `reorderPlanItems`       | `qep.plan.item.updated`                              |
| SubmitForReview     | `submitForReview`        | `qep.plan.review.requested`                          |
| ApprovePlan         | `approvePlan`            | `qep.plan.approved`                                  |
| RejectPlan          | `rejectPlan`             | `qep.plan.rejected`                                  |
| ReturnToDraft       | `returnToDraft`          | `qep.plan.updated`                                   |
| MarkReady           | `markReady`              | `qep.plan.ready`                                     |
| StartExecution      | `startExecution`         | `qep.plan.started`                                   |
| CompletePlan        | `completePlan`           | `qep.plan.completed`                                 |
| ArchivePlan         | `archivePlan`            | `qep.plan.archived`                                  |
| CancelPlan          | `cancelPlan`             | `qep.plan.cancelled`                                 |
| SupersedePlan       | `supersedePlan`          | `qep.plan.superseded` + successor `qep.plan.created` |
| ClonePlan           | `cloneTestPlan`          | `qep.plan.created` (successor)                       |

**RestoreFromArchive:** not authorised (v1).
