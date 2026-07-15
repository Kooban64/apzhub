# APZHUB Platform Lifecycle Developer Guide

**Milestone:** PRH-009  
**Audience:** Platform engineers extending capabilities or products

---

## Register a capability

Add an entry to `LIFECYCLE_CAPABILITY_REGISTRATIONS` in:

`packages/platform-lifecycle/src/registrations.ts`

Required fields:

- `capabilityId` — stable identifier (match operations control plane where applicable)
- `name`, `owner`, `version`
- `dependencies` — upstream capability IDs
- `sequenceOrder` — startup sequence (lower starts first)
- `minPlatformVersion` — optional semver constraint

Then extend `readinessForCapability()` in `participation-evaluator.ts` to map consolidated diagnostics to readiness.

---

## Register a product

Add an entry to `LIFECYCLE_PRODUCT_REGISTRATIONS`. Products participate in lifecycle gates but never own platform state transitions.

---

## Consume lifecycle snapshot

```typescript
import { buildPlatformLifecycleSnapshot } from "@apzhub/platform-lifecycle";

const snapshot = buildPlatformLifecycleSnapshot({
  consolidated,
  bootstrapReady: true,
  platformVersion: "0.1.0-foundation",
  buildNumber: "local",
  environment: "test",
});
```

For runtime operator actions, use `getSharedPlatformLifecycleManager()` from `@apzhub/platform-lifecycle/server`.

---

## Control plane integration

`buildOperationsControlPlaneSnapshot()` includes a `lifecycle` section when `@apzhub/platform-lifecycle` is available. Pass `lifecycleRuntime` from the shared manager for operator override state.

---

## Testing

Add tests in `packages/platform-lifecycle/src/platform-lifecycle.test.ts`:

- Deterministic state derivation
- Dependency ordering
- Maintenance / shutdown / recovery actions
- Capability and product registration uniqueness

---

## Related

- [Platform Lifecycle Architecture](../architecture/APZHUB-Platform-Lifecycle-Architecture.md)
- [Capability Health Model](../architecture/APZHUB-Capability-Health-Model.md)
