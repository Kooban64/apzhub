# APZHUB Plane Diagnostics Design

**Milestone:** OSS-101-02  
**Status:** Design + adapter operations delivered (OSS-101-09) — configuration diagnostics (OSS-101-02) + live probe (OSS-101-04+) + certification/readiness/reports (OSS-101-09)

---

## Purpose

Define diagnostics for Plane integration at the capability boundary. OSS-101-02 implements **configuration-only** diagnostics; live engine probe deferred to OSS-101-04.

---

## Diagnostic layers

| Layer | OSS phase | Responsibility |
|-------|-----------|----------------|
| **Configuration diagnostics** | OSS-101-02 ✅ | URL/token/workspace present; integration flag |
| **Adapter health probe** | OSS-101-04 | HTTP round-trip, engine version |
| **Operations control plane** | OSS-101-09 | Aggregated connector health |
| **Consolidated diagnostics** | OSS-101-09 | Bootstrap extension `projectsDiagnostics` |

---

## Configuration diagnostics (implemented)

**Module:** `packages/config/src/governance/plane-config-diagnostics.ts`  
**API:** `getPlaneConfigurationDiagnostics(env?)`

### Output schema

```typescript
interface PlaneConfigurationDiagnostics {
  integrationEnabled: boolean;
  connectionConfigured: boolean;    // BASE_URL + API_BASE_URL
  apiTokenPresent: boolean;         // token set (not validated against Plane)
  workspaceConfigured: boolean;     // PLANE_WORKSPACE_ID set
  healthStatus: 'disabled' | 'misconfigured' | 'configured' | 'not_probed';
  versionCompatibility: {
    status: 'not_checked' | 'compatible' | 'incompatible';
    supportedRange: { min: '0.23.0'; max: '0.24.x' };
    note: string;
  };
  issues: string[];
}
```

### Health status rules

| Condition | `healthStatus` |
|-----------|----------------|
| `PLANE_INTEGRATION_ENABLED=false` | `disabled` |
| Enabled + validation failures | `misconfigured` |
| Enabled + URLs + token present | `configured` |
| Live probe not run | Never `healthy`/`unavailable` at this layer |

**OSS-101-02 does not call Plane HTTP APIs.**

---

## Version compatibility design

| Phase | Behaviour |
|-------|-----------|
| OSS-101-02 | Declare supported range constant; status `not_checked` |
| OSS-101-04 | Adapter health probe reads Plane version header/API |
| OSS-101-09 | Report incompatible version to control plane; governance block optional |

**Pinned range (initial):** `0.23.0` – `0.24.x` — finalized at OSS-101-02 environment pin.

---

## Future adapter health probe (OSS-101-04)

```text
PlaneAdapter.health()
  → GET {PLANE_API_BASE_URL}/health/ or workspace probe
  → Measure latency
  → Capture engine version
  → Return AdapterHealthResult → operations control plane
```

Mapped to control plane capability `projects` / connector `plane`.

---

## Consolidated diagnostics extension (planned)

```typescript
// apps/web/lib/operational-diagnostics.ts (OSS-101-09)
projectsDiagnostics: {
  capability: 'projects',
  connector: 'plane',
  configuration: getPlaneConfigurationDiagnostics(),
  // adapter: await planeAdapter.health() — OSS-101-04+
}
```

Extends `OperationalDiagnosticsExtensions` per bootstrap architecture.

---

## Operator visibility

| Surface | Content |
|---------|---------|
| Configuration API | Registry metadata + masked values |
| Security diagnostics | Secret presence for `PLANE_API_TOKEN`, `PLANE_WEBHOOK_SECRET` |
| Control plane (future) | Connector latency, sync lag, error rate |

Secrets never appear unmasked in diagnostics output.

---

## Related

- [Plane Configuration Notes](../governance/APZHUB-Plane-Configuration-Notes.md)
- [PlaneAdapter Specification](../specs/APZHUB-PlaneAdapter-Specification.md)
- [Capability Health Model](../architecture/APZHUB-Capability-Health-Model.md)
