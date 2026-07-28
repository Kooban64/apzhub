# Permissions — APZQEP-ENG-050B

## Catalogue

| Permission                       | Use                                    |
| -------------------------------- | -------------------------------------- |
| `qep.specification.create`       | Create                                 |
| `qep.specification.read`         | Get / list / versions / relationships  |
| `qep.specification.update`       | Draft update, relationships, supersede |
| `qep.specification.review`       | Submit for review                      |
| `qep.specification.approve`      | Approve                                |
| `qep.specification.reject`       | Reject                                 |
| `qep.specification.withdraw`     | Withdraw                               |
| `qep.specification.retire`       | Retire                                 |
| `qep.specification.cancel`       | Cancel                                 |
| `qep.specification.search`       | Search                                 |
| `qep.specification.history.view` | History                                |

## Ownership

Permissions are owned by Platform Authorization. Infrastructure consumes grants via RequestPipeline and application-level `assertAnyPermission`.
