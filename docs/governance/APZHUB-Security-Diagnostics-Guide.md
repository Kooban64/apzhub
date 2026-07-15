# APZHUB Security Diagnostics Guide (M8-06)

## Endpoints

| Endpoint | Auth | Permission |
|----------|------|------------|
| `GET /api/platform/v1/security` | Session | Authenticated user |
| `GET /api/platform/v1/security/diagnostics` | Session | `platform.nav.administration.view` |
| `GET /api/platform/v1/system/health` | None | Public probe |
| `GET /api/platform/v1/system/readiness` | None | Public probe |
| `GET /api/platform/v1/system/liveness` | None | Public probe |

## Security diagnostics shape

```json
{
  "headers": { "xFrameOptions": true, "crossOriginOpenerPolicy": true, "contentSecurityPolicy": "report-only" },
  "httpHeaders": { "compliant": true, "missing": [], "recommendations": [] },
  "environment": {
    "valid": true,
    "tier": "strict",
    "checks": [],
    "configuration": {
      "healthy": true,
      "missingVariables": [],
      "deprecatedVariables": [],
      "secretStatus": []
    }
  },
  "session": {
    "sessionValidation": "active",
    "cookieSecure": true,
    "cookieHttpOnly": true,
    "sessionDiagnostics": {
      "healthy": true,
      "tenantBinding": { "enabled": true, "bound": true }
    }
  },
  "environment": { "valid": true, "checks": [] },
  "rateLimit": { "backend": "redis", "enabled": true, "defaultLimitPerMinute": 120 },
  "trafficGovernance": {
    "activePolicy": { "id": "platform-privileged", "service": "platform" },
    "throttle": { "active": true, "burstWindowSeconds": 10 },
    "recommendations": []
  },
  "apiGuard": { "sessionRequired": true, "permissionEnforcement": true }
}
```

## Consolidated diagnostics

Includes: `runtime`, `identity`, `authorization`, `operations`, `personalisation`, `governance`, `api`, `workbench`, `lawPlatform`, `trustAccounting`, `security`, `resilience`, `persistence`.

Source: `@apzhub/platform-security` + app-layer loaders in `apps/web/lib/operational-diagnostics.ts`.

## Operations Console

- **Diagnostics** — full consolidated JSON
- **Security** — headers + environment checks
- **Resilience** — probes + recovery guidance

## Package

```typescript
import { getSharedPlatformSecurityService } from "@apzhub/platform-security";

const service = getSharedPlatformSecurityService();
const security = service.securityDiagnostics.getSecurityDiagnostics();
const consolidated = await service.operationalDiagnostics.getConsolidatedDiagnostics();
```
