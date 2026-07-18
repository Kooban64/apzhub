# APZ TCMS — Recommendation Model

**Milestone:** APZTCMS-009  
**Service:** `CertificationRecommendationService`

---

## Advisory codes

| Code                  | Meaning                             |
| --------------------- | ----------------------------------- |
| `ready_for_review`    | Gates sufficient to enter review    |
| `ready_for_approval`  | Gates sufficient for human approval |
| `conditionally_ready` | Warnings / conditional path         |
| `not_ready`           | Failures remain                     |
| `blocked`             | Critical blockers                   |

Recommendations include `reasons[]` derived from gate outcomes and readiness inputs.

---

## Hard rules

- Recommendations are **advisory only**
- Must **never** auto-transition to `approved`
- Must **never** call approval APIs
- No AI / ML ranking

Auto-approve tokens in payloads are rejected (`auto_approve_forbidden`).
