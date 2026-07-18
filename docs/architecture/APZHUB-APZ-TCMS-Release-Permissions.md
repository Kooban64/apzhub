# APZHUB APZ TCMS — Release Permissions

**Milestone:** APZTCMS-014

## Catalogue (selected)

| Namespace             | Keys                                                                                                |
| --------------------- | --------------------------------------------------------------------------------------------------- |
| `release.*`           | view, create, update, submit, approve, reject, withdraw, archive, restore, admin (+ legacy compute) |
| `release.approvals.*` | view, request, decide, admin                                                                        |
| `release.readiness.*` | view, evaluate, admin                                                                               |
| `release.audit.*`     | view, admin                                                                                         |
| `release.risk.*`      | view, evaluate, admin                                                                               |

Mapped to RequestPipeline operations on service `testingReleaseGovernance`.

No role UI in this milestone.
