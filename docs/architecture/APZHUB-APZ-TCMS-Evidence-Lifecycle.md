# APZ TCMS — Evidence Lifecycle

**Milestone:** APZTCMS-006

---

## States

| State       | Meaning                                       |
| ----------- | --------------------------------------------- |
| `pending`   | Metadata registered; capture not confirmed    |
| `captured`  | Bound via storage provider / capture recorded |
| `submitted` | Submitted for verification                    |
| `verified`  | Content/metadata checked                      |
| `rejected`  | Failed verification / review                  |
| `approved`  | Accepted as formal evidence                   |
| `archived`  | Soft-closed                                   |

---

## Service operations

`registerEvidence` → pending  
`captureEvidence` / `putViaStorage` → captured (+ storageRef)  
`submitEvidence` → submitted  
`verifyEvidence` → verified  
`approveEvidence` / `rejectEvidence` → approved / rejected  
`archiveEvidence` → archived

Illegal transitions fail with domain validation errors. Audit/history is recorded via domain events and related execution history when linked to an execution.

---

## Explicit exclusions

No HTTP upload endpoints, no cloud object-store SDK, no Workbench attachment UI.
