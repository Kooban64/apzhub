# APZQEP-OES-ENG-060B — APPENDIX C — REST Resource Summary

**Base:** `/api/v1/qep/plans`

| Method | Path | Operation concept |
| ------ | ---- | ----------------- |
| GET | `/api/v1/qep/plans` | List / search |
| POST | `/api/v1/qep/plans` | Create |
| GET | `/api/v1/qep/plans/{planId}` | Get |
| PATCH | `/api/v1/qep/plans/{planId}` | Update (+ `expectedRevision`) |
| POST | `/api/v1/qep/plans/{planId}/actions/{action}` | Lifecycle / governance |
| GET | `/api/v1/qep/plans/{planId}/items` | List items |
| POST | `/api/v1/qep/plans/{planId}/items` | Add item |
| PATCH | `/api/v1/qep/plans/{planId}/items/{itemId}` | Update item |
| DELETE | `/api/v1/qep/plans/{planId}/items/{itemId}` | Remove item |
| POST | `/api/v1/qep/plans/{planId}/items/reorder` | Reorder |
| GET | `/api/v1/qep/plans/{planId}/history` | History |
| GET | `/api/v1/qep/plans/{planId}/versions` | Versions |
| GET | `/api/v1/qep/plans/{planId}/compare` | Compare revisions |
| POST | `/api/v1/qep/plans/{planId}/clone` | Clone |

Actions include: `submit-for-review`, `approve`, `reject`, `return-to-draft`, `mark-ready`, `start-execution`, `complete`, `archive`, `cancel`, `supersede`, plus optional `assign` / `schedule` / `transfer-ownership`.

No controller code in this OES.
