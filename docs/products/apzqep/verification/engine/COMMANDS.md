# Commands — Verification Application Service

| Command                 | Permission                   | Domain transition / effect                   |
| ----------------------- | ---------------------------- | -------------------------------------------- |
| `createVerification`    | `qep.verification.create`    | Create draft Verification (subject resolved) |
| `requestVerification`   | `qep.verification.request`   | draft → requested                            |
| `assignVerification`    | `qep.verification.assign`    | requested → assigned                         |
| `startVerification`     | `qep.verification.start`     | assigned → in_progress                       |
| `completeVerification`  | `qep.verification.complete`  | in_progress → verified (+ outcome)           |
| `rejectVerification`    | `qep.verification.reject`    | in_progress → rejected (+ outcome)           |
| `expireVerification`    | `qep.verification.expire`    | Expire eligible Verification                 |
| `withdrawVerification`  | `qep.verification.withdraw`  | Withdraw eligible Verification               |
| `supersedeVerification` | `qep.verification.supersede` | Supersede with successor id                  |
| `cancelVerification`    | `qep.verification.cancel`    | Cancel eligible Verification                 |
| `retireVerification`    | `qep.verification.retire`    | Retire eligible Verification                 |
| `updateMetadata`        | `qep.verification.modify`    | Metadata patch                               |
| `updateRationale`       | `qep.verification.modify`    | Rationale update                             |
| `updatePriority`        | `qep.verification.modify`    | Priority update                              |

All commands require tenant/actor context. Lifecycle legality is enforced by the ENG-040A domain layer, not by REST handlers.
