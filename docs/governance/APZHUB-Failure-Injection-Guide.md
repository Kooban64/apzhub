# APZHUB Failure Injection Guide

**Milestone:** PRH-010  
**Audience:** Platform engineers and QA

---

## Purpose

Describe controlled failure scenarios used to validate Platform Core reliability without live infrastructure changes.

---

## Fixture library

Import from `@apzhub/platform-lifecycle`:

| Helper                               | Simulates                              |
| ------------------------------------ | -------------------------------------- |
| `createHealthyConsolidatedFixture()` | Baseline healthy platform              |
| `withDatabaseUnavailable()`          | PostgreSQL dependency failure          |
| `withRedisUnavailable()`             | Redis dependency failure               |
| `withMissingConfiguration()`         | Invalid environment configuration      |
| `withAuthorizationFailure()`         | Authorization diagnostics absent       |
| `withTenantGuardFailure()`           | API permission enforcement disabled    |
| `withTrafficGovernanceDisabled()`    | Traffic governance off                 |
| `withProductFailure()`               | Law Platform / Trust Accounting absent |
| `withReadinessDegraded()`            | Readiness probe degraded               |

Location: `packages/platform-lifecycle/src/failure-fixtures.ts`

---

## Example usage

```typescript
import {
  createHealthyConsolidatedFixture,
  createLifecycleValidationInput,
  withDatabaseUnavailable,
} from "@apzhub/platform-lifecycle";
import { buildPlatformLifecycleSnapshot } from "@apzhub/platform-lifecycle";

const snapshot = buildPlatformLifecycleSnapshot(
  createLifecycleValidationInput(
    withDatabaseUnavailable(createHealthyConsolidatedFixture()),
  ),
);

expect(snapshot.currentState).toBe("configuration-ready");
```

---

## Validated failure domains

- Startup failures (bootstrap, configuration, identity, authorization)
- Dependency failures (database, Redis)
- Readiness and health degradation
- Maintenance and graceful shutdown
- Recovery transitions
- Version incompatibility
- Product partial availability

---

## Constraints

- Use fixtures for unit/integration validation only.
- Do not inject failures into production runtime without operator approval.
- Do not embed secrets in failure messages — use generic operator text.

---

## Related

- [Platform Reliability Architecture](../architecture/APZHUB-Platform-Reliability-Architecture.md)
- [Operational Recovery Guide](./APZHUB-Operational-Recovery-Guide.md)
