# Queries — Verification Application Service

| Query | Permission | Purpose |
| --- | --- | --- |
| `getVerification` | `qep.verification.view` | Detail by id |
| `listVerifications` | `qep.verification.view` | Filtered/paginated list (`status`, `outcome`, subject, authority, limit/offset) |
| `listBySubject` | `qep.verification.view` | Verifications for a subject kind + artefact id |
| `listHistory` | `qep.verification.history.view` | Append-only domain history |
| `supersessionChain` | `qep.verification.view` | Supersession chain traversal |

Platform Service surface exposes `listVerifications`, `getVerification`, `getVerificationHistory`, `listVerificationsBySubject` (and command counterparts). REST currently ships list/get/history plus lifecycle command routes; subject-oriented list is available via Platform Service / application query.
