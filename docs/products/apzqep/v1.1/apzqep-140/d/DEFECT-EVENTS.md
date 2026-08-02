# Defect Events

| Event                       | When                     |
| --------------------------- | ------------------------ |
| `qep.defect.created`        | Create                   |
| `qep.defect.updated`        | Patch                    |
| `qep.defect.assigned`       | Assign                   |
| `qep.defect.fixed`          | Fixed / ready_for_retest |
| `qep.defect.verified`       | Verified                 |
| `qep.defect.closed`         | Closed                   |
| `qep.defect.reopened`       | Closed → new             |
| `qep.defect.status_changed` | Other lifecycle          |

Consumed by QKI processors and notification processors (internal channel).
