# APZHUB — Testing Operation Permission Map

**Milestone:** APZTCMS-011  
**Canonical source:** `packages/platform-services/src/authorization/operation-authorization-map.ts`  
**Status:** Explicit map — never derived from reflection or fragile string parsing alone

---

## Concept

Each platform service operation exposed through the `RequestPipeline` must have a declared mapping:

```typescript
interface OperationAuthorizationMapping {
  readonly service: string; // pipeline key, e.g. "testingPlan"
  readonly operation: string; // method name, e.g. "list"
  readonly resourceType: AuthorizationResourceType;
  readonly action: AuthorizationActionName;
  readonly requiredPermission: PlatformPermissionKey;
  readonly resourceIdArgIndex?: number; // 0-based after context arg
}
```

The pipeline resolves `${service}.${operation}` against `OPERATION_AUTHORIZATION_MAPPINGS` before invoking the implementation.

---

## Testing resource types

| Resource type               | Pipeline service prefix   |
| --------------------------- | ------------------------- |
| `testing_plan`              | `testingPlan`             |
| `testing_suite`             | `testingSuite`            |
| `testing_case`              | `testingCase`             |
| `testing_requirement`       | `testingRequirement`      |
| `testing_execution`         | `testingExecution`        |
| `testing_evidence`          | `testingEvidence`         |
| `testing_automation`        | `testingAutomation`       |
| `testing_coverage`          | `testingCoverage`         |
| `testing_defect`            | `testingDefect`           |
| `testing_quality`           | `testingQuality`          |
| `testing_certification`     | `testingCertification`    |
| `testing_release_readiness` | `testingReleaseReadiness` |
| `testing_traceability`      | `testingTraceability`     |
| `testing_approval`          | `testingApproval`         |
| `testing_dashboard`         | `testingDashboard`        |
| `testing_reporting`         | `testingReporting`        |

---

## Representative mappings

| Service                   | Operation                | Permission                     |
| ------------------------- | ------------------------ | ------------------------------ |
| `testingPlan`             | `list`                   | `testing.plans.list`           |
| `testingPlan`             | `create`                 | `testing.plans.create`         |
| `testingExecution`        | `start`                  | `testing.executions.execute`   |
| `testingExecution`        | `approve`                | `approval.decide`              |
| `testingEvidence`         | `registerEvidence`       | `evidence.register`            |
| `testingCertification`    | `evaluateGates`          | `certification.gates.evaluate` |
| `testingCertification`    | `approve`                | `certification.approve`        |
| `testingAutomation`       | `importResult`           | `automation.import`            |
| `testingCoverage`         | `recompute`              | `coverage.compute`             |
| `testingDefect`           | `link`                   | `defects.link`                 |
| `testingQuality`          | `computeSnapshot`        | `quality.compute`              |
| `testingReleaseReadiness` | `calculateForPlan`       | `release.compute`              |
| `testingDashboard`        | `getDashboardSummary`    | `dashboard.view`               |
| `testingReporting`        | `listReportPlaceholders` | `reporting.view`               |

Full matrix: `testingPlanOps` … `testingReportingOps` arrays in `operation-authorization-map.ts` (APZTCMS-011).

---

## Lookup API

```typescript
import {
  resolveOperationAuthorization,
  extractResourceId,
  OPERATION_AUTHORIZATION_MAPPINGS,
} from "@apzhub/platform-services";
```

Tests: `testing-operation-authorization.test.ts` — verifies testing entries resolve and required permissions are catalogued.

---

## Maintenance rules

1. Adding a method to a platform testing service contract **requires** a new map entry before merge.
2. Permission key must exist in `PLATFORM_SERVICE_PERMISSION_CATALOGUE` (merged from `APZ_TCMS_PERMISSIONS`).
3. Resource ID index must match method signature (context stripped).
4. Do not map domain-only internal helpers — platform public methods only.

---

## Related

- [Platform Service Authorization](./APZHUB-Platform-Service-Authorization.md)
- [Testing Permission Catalogue](./APZHUB-Testing-Permission-Catalogue.md)
- [Testing Gateway Reference](./APZHUB-Testing-Gateway-Reference.md)
