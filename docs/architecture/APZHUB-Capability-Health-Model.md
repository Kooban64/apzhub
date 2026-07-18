# APZHUB Capability Health Model

**Milestone:** PRH-008  
**Status:** Authoritative capability health contract for operations

---

## Purpose

Define the standard health report every platform capability contributes to the Operations Control Plane.

---

## Health signals

All capabilities use the canonical signal enum from `@apzhub/platform-security`:

- `healthy` — operating normally
- `degraded` — functional with observations or partial dependency loss
- `unhealthy` — not safe for production traffic
- `unknown` — insufficient diagnostics to assess

Overall `status` is derived as the worst of `health` and `readiness`.

---

## Required report fields

```typescript
interface CapabilityHealthReport {
  capabilityId: string;
  name: string;
  owner: string;
  version: string;
  maturityLevel: "foundation" | "operational" | "production" | "experimental";
  status: HealthSignalStatus;
  health: HealthSignalStatus;
  readiness: HealthSignalStatus;
  configurationState: "valid" | "degraded" | "invalid" | "unknown";
  warnings: string[];
  recommendations: string[];
  dependencies: string[];
  lastValidation: string;
  diagnostics: Record<string, unknown>; // sanitized
}
```

---

## Registered capabilities (PRH-008)

| ID                            | Name                     | Owner                              | Maturity    |
| ----------------------------- | ------------------------ | ---------------------------------- | ----------- |
| `platform.runtime`            | Platform Runtime         | `@apzhub/platform-runtime`         | production  |
| `platform.bootstrap`          | Platform Bootstrap       | `@apzhub/platform-bootstrap`       | production  |
| `platform.identity`           | Platform Identity        | `@apzhub/platform-identity`        | operational |
| `platform.authorization`      | Platform Authorization   | `@apzhub/platform-authorization`   | operational |
| `platform.personalisation`    | Platform Personalisation | `@apzhub/platform-personalisation` | operational |
| `platform.governance`         | Platform Governance      | `@apzhub/platform-governance`      | operational |
| `platform.provisioning`       | Platform Provisioning    | `@apzhub/platform-identity`        | foundation  |
| `platform.security`           | Platform Security        | `@apzhub/platform-security`        | production  |
| `platform.configuration`      | Platform Configuration   | `@apzhub/config`                   | production  |
| `platform.traffic-governance` | Traffic Governance       | `@apzhub/platform-security`        | production  |
| `platform.session-security`   | Session Security         | `@apzhub/auth`                     | production  |
| `platform.tenant-isolation`   | Tenant Isolation         | `@apzhub/platform-identity`        | production  |
| `platform.persistence`        | Platform Persistence     | `@apzhub/config`                   | operational |
| `product.law-platform`        | Law Platform             | `apps/law-platform`                | operational |
| `product.trust-accounting`    | Trust Accounting         | Law trust module                   | operational |
| `platform.workbench`          | Workbench Framework      | `@apzhub/workbench-framework`      | operational |
| `platform.api-framework`      | API Framework            | `apps/web/lib/api`                 | operational |
| `platform.operations`         | Operations Control Plane | `@apzhub/platform-operations`      | production  |

---

## Rules

1. **No duplicate capability IDs** — one report per registered capability.
2. **No secrets in diagnostics** — masked configuration only via security diagnostics.
3. **Deterministic evaluation** — same consolidated input produces the same health signals.
4. **Dependency awareness** — degraded upstream dependencies propagate warnings to dependents.

Implementation: `packages/platform-operations/src/capability-health-builder.ts`
