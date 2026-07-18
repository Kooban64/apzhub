# APZ TCMS — Certification Engine Architecture

**Milestone:** APZTCMS-009  
**Packages:** contracts **0.6.0**, persistence **0.7.0**, services **0.5.0**

---

## Purpose

The Certification Engine is the authoritative **business workflow** for release certification. It evaluates quality gates, produces **advisory** recommendations, and records human approvals. Final approval is always human-authorised — never automatic, never AI.

---

## Factory

```ts
createCertificationEngineServices(deps);
createTestingDomainServices(deps); // → certification key
```

| Service                              | Role                                   |
| ------------------------------------ | -------------------------------------- |
| `CertificationService`               | Create/get/list certification records  |
| `CertificationWorkflowService`       | Validated lifecycle transitions        |
| `CertificationRuleService`           | Which gates apply                      |
| `CertificationGateService`           | Define + evaluate gates                |
| `CertificationEvidenceService`       | Link cert to domain artefacts          |
| `CertificationApprovalService`       | Multi-stage human approvals            |
| `CertificationAuditService`          | Immutable audit append/list            |
| `CertificationHistoryService`        | Transition history                     |
| `CertificationValidationService`     | Gates, order, transitions, permissions |
| `CertificationRecommendationService` | Advisory recommendations only          |

---

## Pipeline

```text
Quality / coverage / defects / executions / evidence
        │
        ▼
Gate evaluation (PASS|FAIL|WARNING|N/A|UNKNOWN) — explainable
        │
        ├─ Recommendation (advisory)
        ├─ Workflow transitions (validated state machine)
        └─ Human approval stages → Approved / Conditionally Approved / Rejected
```

Domain events via `DomainEventCollector` only — **no Event Bus**.

---

## Explicit exclusions

HTTP, Workbench UI, dashboards, AI recommendations, automatic approval, email/notifications, CI/CD, external compliance integrations.

---

## Related

[Certification Workflow](./APZHUB-APZ-TCMS-Certification-Workflow.md) · [Gate Evaluation Model](./APZHUB-APZ-TCMS-Gate-Evaluation-Model.md) · [Recommendation Model](./APZHUB-APZ-TCMS-Recommendation-Model.md) · [Approval Model](./APZHUB-APZ-TCMS-Certification-Approval-Model.md) · [Audit Model](./APZHUB-APZ-TCMS-Certification-Audit-Model.md)
