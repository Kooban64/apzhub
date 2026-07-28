# Permissions — APZQEP-ENG-060B

## Catalogue

| Permission              | Use                                         |
| ----------------------- | ------------------------------------------- |
| `qep.plan.create`       | Create                                      |
| `qep.plan.read`         | Get / list / versions / history / readiness |
| `qep.plan.update`       | Draft content, metadata updates             |
| `qep.plan.assign`       | Ownership transfer, assignment updates      |
| `qep.plan.schedule`     | Schedule updates                            |
| `qep.plan.submit`       | Submit for review                           |
| `qep.plan.approve`      | Approve                                     |
| `qep.plan.reject`       | Reject                                      |
| `qep.plan.ready`        | Mark ready for execution                    |
| `qep.plan.execute`      | Start execution                             |
| `qep.plan.complete`     | Complete                                    |
| `qep.plan.archive`      | Archive                                     |
| `qep.plan.cancel`       | Cancel                                      |
| `qep.plan.supersede`    | Supersede                                   |
| `qep.plan.clone`        | Clone                                       |
| `qep.plan.search`       | Search                                      |
| `qep.plan.history.view` | History                                     |

Item management (add/update/reorder/remove) authorises against `qep.plan.update`.

## Ownership

Permissions are owned by Platform Authorization (`packages/platform-services/src/authorization/`). Infrastructure consumes grants via RequestPipeline and application-level `assertPermission`/`assertAnyPermission` hooks. Contracts source of truth: `@apzhub/qep-contracts` `QEP_TEST_PLAN_PERMISSIONS`. Module manifest: `modules/qep-test-plans/module.yaml` (permissions catalogue only — no Workbench in this programme).
