# APZ TCMS — Certification Audit Model

**Milestone:** APZTCMS-009

---

## Immutable records

| Store | Contents |
| --- | --- |
| `testing_certification_audit` | Transitions, gate evaluations, approvals, recommendations, overrides, comments |
| `testing_certification_history` | State transition history |
| Approval history | Via approval history table when used |

Each entry: timestamp, actor user id, event type, summary, details JSON. **No update/delete** of audit payloads after append.

---

## Services

- `CertificationAuditService.append` / `list`  
- `CertificationHistoryService` for transition timelines  

Domain event collector records parallel in-process events — **not** an Event Bus.  
