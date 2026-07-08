# LAW — Trust Developer Guide

> **Audience:** Engineers extending or integrating Trust Accounting  
> **Milestone:** LAW-015 — delivered  
> **Last updated:** 2026-07-08

---

## 1. Overview

Trust Accounting lives in `apps/law-platform/lib/trust/` with REST exposure at `/api/law/v1/trust/*` in `apps/web/lib/api/trust/`. The workbench UI is in `apps/law-platform/components/trust/`.

Read first:

- [LAW-Trust-Reference-Architecture](../architecture/LAW-Trust-Reference-Architecture.md)
- [LAW-Trust-Domain-Reference](../architecture/LAW-Trust-Domain-Reference.md)

---

## 2. Service boundaries

| Service                           | Mutates ledger? | Calls                         |
| --------------------------------- | :-------------: | ----------------------------- |
| `TrustLedgerService`              |       Yes       | Repositories only             |
| `TrustTransactionWorkflowService` |   Via ledger    | Ledger, approval, audit       |
| `TrustAllocationService`          |  No (assigns)   | Ledger read, allocation repo  |
| `TrustReconciliationService`      |       No        | Ledger, allocations           |
| `TrustInterestService`            |  Via workflow   | Ledger, rules repo            |
| `TrustTransferService`            |   Via ledger    | Ledger, allocations, approval |
| `TrustReportingService`           |       No        | All read repos                |
| `TrustApprovalService`            |       No        | Approval repo, rules          |

**Rule:** UI and API handlers orchestrate — they do not contain posting rules.

---

## 3. Repository model

### Modes

```bash
LAW_REPOSITORY_MODE=memory   # default in tests
LAW_REPOSITORY_MODE=postgres # integration / production path
```

### Bundle access

```typescript
// API layer
import { withTrustServiceBundle } from "@/lib/api/trust";

// Direct (tests)
import {
  getSharedTrustServiceBundle,
  createLawPersistenceContext,
} from "@apzhub/law-platform/api";
```

### Workbench

`getSharedTrustWorkbench()` — separate in-memory singleton for UI. **Not** the same instance as API memory bundle unless explicitly unified (deferred).

---

## 4. Workflow lifecycle

### Create and post deposit

```text
1. workflowService.createDraft({ trustAccountType: "deposit", ... })
2. workflowService.validateDraft(tenantId, draftId, actorUserId)
3. workflowService.postDraft({ tenantId, draftId, actorUserId })
4. allocationService.allocate({ tenantId, trustTransactionId, actorUserId })  // if needed
```

### API equivalent

```http
POST /api/law/v1/trust/transactions
POST /api/law/v1/trust/transactions/{trustTransactionId}/post
```

Headers: session cookie + `x-tenant-id`.

---

## 5. Approval lifecycle

1. High-risk operation creates `TrustApprovalRequest` (status `submitted`)
2. Approver with role calls `approvalService.approve()` or API `POST /approvals/{id}/approve`
3. Workflow continues to post only after approval

Configure rules via `TrustApprovalService` (in-memory; persisted in postgres mode).

Permissions: `legal.trust.manage` for approve/reject.

---

## 6. API usage

Base: `/api/law/v1/trust`

| Task               | Method | Path                              |
| ------------------ | ------ | --------------------------------- |
| Open account       | POST   | `/accounts`                       |
| List transactions  | GET    | `/transactions?trustAccountId=`   |
| Run reconciliation | POST   | `/reconciliation?trustAccountId=` |
| Generate report    | POST   | `/reports`                        |
| Export CSV         | GET    | `/reports/{id}/export?format=csv` |
| Diagnostics        | GET    | `/diagnostics`                    |

Standard Law API envelopes apply. See [legal-api-developer-guide](./legal-api-developer-guide.md) for auth and tenant patterns.

Validation test reference: `apps/web/lib/api/trust/trust-api-workflow-validation.test.ts`.

---

## 7. Reporting

```typescript
import { TrustReportingService } from "@apzhub/law-platform/api";

reportingService.generateReport({
  tenantId,
  trustAccountId,
  reportType: "trial_balance",
  generatedByUserId: actorId,
});
```

Report types: see `TRUST_REPORT_TYPES` in `trust-reporting-types.ts`.

### Export (presentation)

```typescript
import {
  exportTrustReportToCsv,
  exportTrustReportToHtml,
} from "@apzhub/law-platform/api";

const csv = exportTrustReportToCsv(report);
```

No accounting logic in export module.

---

## 8. Extension points

| Extension          | Mechanism                                                                            |
| ------------------ | ------------------------------------------------------------------------------------ |
| New report type    | Add to `TRUST_REPORT_TYPES`, payload builder in reporting service, export column map |
| Compliance profile | `ComplianceProfileId` on account + validator hooks                                   |
| Approval rule      | Register rule in `TrustApprovalService`                                              |
| Workbench view     | Register route in `trust-routes.ts`, page component, `module.yaml` nav               |
| API endpoint       | Handler in `trust-api-handlers.ts`, route under `app/api/law/v1/trust/`              |
| Postgres adapter   | Implement repository interface in `postgres-trust-*`                                 |

Do **not** bypass services to call repositories from UI.

---

## 9. Testing

| Layer               | Location                                                                      |
| ------------------- | ----------------------------------------------------------------------------- |
| Unit                | `apps/law-platform/lib/trust/*.test.ts`                                       |
| API                 | `apps/web/lib/api/trust/trust-api.test.ts`                                    |
| Workflow validation | `trust-api-workflow-validation.test.ts`                                       |
| UI                  | `apps/law-platform/components/trust/*.test.tsx`                               |
| E2E                 | `testing/playwright/e2e/law-015-trust-workflow.spec.ts` (`pnpm test:e2e:law`) |

Reset between tests: `resetTrustApiRepositories()`, `resetSharedTrustWorkbench()`.

---

## 10. Local development

```bash
pnpm dev:law          # @apzhub/law-platform on :3301 — Trust workbench
pnpm --filter @apzhub/web dev  # :3300 — Trust API
```

Trust workbench: `/workspace/law/trust`

---

## 11. Related documents

- [LAW-015-11 Trust API Notes](../architecture/LAW-015-11-Trust-API-Notes.md)
- [LAW-015-12 Trust Export Notes](../architecture/LAW-015-12-Trust-Export-Notes.md)
- [LAW-Trust-Permissions](../specs/LAW-Trust-Permissions.md)
- [LAW-Trust-Operations-Guide](../operator/LAW-Trust-Operations-Guide.md)
