# Permissions

| Permission | Use |
| ---------- | --- |
| `qep.verification.view` | Read Verifications / lists |
| `qep.verification.create` | Create |
| `qep.verification.request` | draft → requested |
| `qep.verification.assign` | Assign |
| `qep.verification.start` | Start |
| `qep.verification.complete` | Complete (verify) |
| `qep.verification.reject` | Reject |
| `qep.verification.expire` | Expire |
| `qep.verification.withdraw` | Withdraw |
| `qep.verification.supersede` | Supersede |
| `qep.verification.cancel` | Cancel |
| `qep.verification.retire` | Retire |
| `qep.verification.modify` | Metadata / rationale / priority updates |
| `qep.verification.history.view` | Domain history |
| `qep.verification.search` | Search Verifications (projection) |

Wildcard `qep.verification.*` grants the family where the authorisation map permits.

Registered in `modules/qep-verification/module.yaml`, Platform permission catalogue / operation-authorization-map, and application service checks.
