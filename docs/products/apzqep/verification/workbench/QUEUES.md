# Queues — APZQEP-ENG-040C

Queues are **read models / presentation filters** over list APIs. They do not own business rules.

## Implemented

| Queue            | Server filter / presentation                        |
| ---------------- | --------------------------------------------------- |
| My Work          | `status=assigned` + presentation assignee filter    |
| Assigned         | `status=assigned`                                   |
| Requested        | `status=requested`                                  |
| Awaiting Review  | `status=in_progress`                                |
| Rejected         | `status=rejected`                                   |
| Expired          | `status=expired`                                    |
| Completed        | `status=verified`                                   |
| Overdue          | assigned + `metadata.dueAt` past now (presentation) |
| Recently Updated | unfiltered list (server sort by updatedAt)          |

My Queue route: `/workspace/qep/verification/queue`  
Team Queue route: `/workspace/qep/verification/team`
