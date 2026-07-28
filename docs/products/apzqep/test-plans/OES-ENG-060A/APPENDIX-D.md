# APZQEP-OES-ENG-060A — APPENDIX D — Domain Event Catalogue

| Event | Command(s) |
| ----- | ---------- |
| `qep.plan.created` | createTestPlan, cloneTestPlan, supersedePlan (successor) |
| `qep.plan.updated` | update*, transferOwnership, item mutations (if no finer event) |
| `qep.plan.review.requested` | submitForReview |
| `qep.plan.approved` | approvePlan |
| `qep.plan.rejected` | rejectPlan |
| `qep.plan.ready` | markReady |
| `qep.plan.started` | startExecution |
| `qep.plan.completed` | completePlan |
| `qep.plan.archived` | archivePlan |
| `qep.plan.cancelled` | cancelPlan |
| `qep.plan.superseded` | supersedePlan (source) |
| `qep.plan.item.added` | addPlanItem |
| `qep.plan.item.updated` | updatePlanItem, reorderPlanItems |
| `qep.plan.item.removed` | removePlanItem |

Minimum envelope fields: `type`, `planId`, `tenantId`, `actorId`, `occurredAt`, `revision`.

No transport or persistence specified.
