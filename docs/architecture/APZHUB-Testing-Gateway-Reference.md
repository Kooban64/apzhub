# APZHUB — Testing Gateway Reference

**Milestone:** APZTCMS-011  
**Entry point:** `PlatformServiceGateway.testing`  
**Contract:** `TestingPlatformGateway`  
**Status:** Implemented when testing bundle is wired into `createPlatformServices`

---

## Nested surface

Testing capabilities are grouped under **`gateway.testing.*`** to avoid colliding with platform-wide names and to mirror the Support nested pattern (`gateway.support`, `gateway.supportOrganizations`, …).

```typescript
gateway.testing.plans.list(ctx);
gateway.testing.executions.start(ctx, executionId);
gateway.testing.certification.evaluateGates(ctx, certificationId);
gateway.testing.dashboard.getDashboardSummary(ctx);
gateway.testing.reporting.listReportPlaceholders(ctx);
```

### Full accessor tree

| Path                       | Pipeline service key      | Resource type (authz)       |
| -------------------------- | ------------------------- | --------------------------- |
| `testing.plans`            | `testingPlan`             | `testing_plan`              |
| `testing.suites`           | `testingSuite`            | `testing_suite`             |
| `testing.cases`            | `testingCase`             | `testing_case`              |
| `testing.requirements`     | `testingRequirement`      | `testing_requirement`       |
| `testing.executions`       | `testingExecution`        | `testing_execution`         |
| `testing.evidence`         | `testingEvidence`         | `testing_evidence`          |
| `testing.automation`       | `testingAutomation`       | `testing_automation`        |
| `testing.coverage`         | `testingCoverage`         | `testing_coverage`          |
| `testing.defects`          | `testingDefect`           | `testing_defect`            |
| `testing.quality`          | `testingQuality`          | `testing_quality`           |
| `testing.certification`    | `testingCertification`    | `testing_certification`     |
| `testing.releaseReadiness` | `testingReleaseReadiness` | `testing_release_readiness` |
| `testing.traceability`     | `testingTraceability`     | `testing_traceability`      |
| `testing.approvals`        | `testingApproval`         | `testing_approval`          |
| `testing.dashboard`        | `testingDashboard`        | `testing_dashboard`         |
| `testing.reporting`        | `testingReporting`        | `testing_reporting`         |

Pipeline wrapping is applied in `wrapTestingPlatformGatewayWithPipeline` when the testing bundle is registered on `createPlatformServices({ testing })`.

---

## Enabled behaviour

1. Caller builds `ServiceRequestContext` (tenant, user, correlation ID).
2. Optional: `gateway.assertContext(ctx)`.
3. Invoke nested accessor method — execution flows through `RequestPipeline`.
4. Production authz resolves operation via `operation-authorization-map.ts`.
5. Platform impl delegates to domain service; errors mapped to `PlatformServiceError`.

---

## Disabled behaviour

When `createPlatformServices` is called **without** a `testing` bundle (or `TESTING_SERVICE_ENABLED` is not `"true"` at the app bootstrap layer):

```typescript
gateway.testing.plans.list(ctx);
// throws PlatformServiceError {
//   category: "configuration",
//   code: "PROVIDER_CAPABILITY_UNSUPPORTED",
//   message: "Testing service is not enabled",
//   retryable: false,
// }
```

This is intentional — no stub implementations, no silent no-op gateway, no in-memory production fallback.

Compare: Support surfaces throw similarly when no support provider is registered.

---

## Bootstrap wiring

```typescript
import {
  createPlatformServices,
  createTestingPlatformServicesForProduction,
  isTestingServiceEnabled,
} from "@apzhub/platform-services";

const testing = isTestingServiceEnabled()
  ? createTestingPlatformServicesForProduction({ postgresDb })
  : undefined;

const { gateway } = createPlatformServices({
  testing,
  accessResolver,
  authorizationMode: "production",
});
```

See [Testing Bootstrap Configuration Guide](./APZHUB-Testing-Bootstrap-Configuration-Guide.md).

---

## Future HTTP mapping (APZTCMS-012)

Indicative route prefix: `/api/v1/testing-*` → same gateway accessors. OpenAPI operation IDs should align with pipeline service keys (`testingPlan.list`, etc.).

---

## Related

- [Platform Service Gateway](../specs/APZHUB-Platform-Service-Gateway.md)
- [Testing Operation Permission Map](./APZHUB-Testing-Operation-Permission-Map.md)
- [Testing Platform Service Architecture](./APZHUB-Testing-Platform-Service-Architecture.md)
