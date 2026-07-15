# Platform Governance — Developer Onboarding (M8-05)

## Quick start

```typescript
import { getSharedGovernanceService } from "@apzhub/platform-governance";
import { resolveSessionGovernance } from "@apzhub/platform-governance/server";

const snapshot = await resolveSessionGovernance({
  userId: session.user.id,
  tenantId: session.tenantId,
  productKey: "law-platform",
});

if (!snapshot.featureFlags["law.trust.accounting"]) {
  // hide trust surfaces
}
```

## Server hydration

```typescript
import { createPlatformGovernanceContext } from "@/lib/session-governance-context";

const governance = await createPlatformGovernanceContext(session, "platform");
```

Law Platform: `createLawPlatformGovernanceContext(session)`.

## Enablement

```typescript
await service.governance.setEnablement({
  scopeType: "tenant",
  scopeKey: tenantId,
  targetType: "product",
  targetKey: "law-platform",
  enabled: true,
});
```

## Provisioning

```typescript
await service.provisioning.provisionTenant({ tenantId, productKeys: ["law-platform"] });
```

## Feature flags

```typescript
await service.featureFlags.setOverride({
  flagKey: "law.trust.accounting",
  scopeType: "tenant",
  scopeKey: tenantId,
  enabled: false,
});
```

## Testing

```typescript
import { createInMemoryGovernanceService, resetSharedGovernanceService } from "@apzhub/platform-governance";

resetSharedGovernanceService();
const { service } = createInMemoryGovernanceService();
```

## References

- [Governance Reference Architecture](../architecture/APZHUB-Platform-Governance-Reference-Architecture.md)
- [ADR-0044](../adr/ADR-0044-platform-governance-provisioning-framework.md)
