# APZHUB Traffic Governance Developer Guide (PRH-005)

## Platform APIs

Traffic governance is applied in Next.js middleware — no per-route code required.

```typescript
// apps/web/middleware.ts
import {
  enforceTrafficGovernance,
  shouldApplyTrafficGovernance,
} from "@apzhub/platform-security/traffic";
```

## Law APIs

Authenticated Law routes use the shared `withLawApiAuth` middleware:

```typescript
import { withLawApiAuth } from "@/lib/api";

export const GET = withLawApiAuth(async (request, context) => {
  // handler
});
```

Public Law endpoints (`/api/law/v1/health`, `/api/law/v1/openapi*`) are governed by `apps/web/middleware.ts`.

## Manual evaluation (tests/diagnostics)

```typescript
import { getSharedTrafficGovernanceService } from "@apzhub/platform-security";

const decision = await getSharedTrafficGovernanceService().evaluate({
  pathname: "/api/platform/v1/tenants",
  method: "GET",
  ip: "127.0.0.1",
  userId: "user-1",
  tenantId: "tenant-1",
  service: "platform",
});
```

## Do not

- Implement product-local rate limiters
- Parse rate limit headers manually in modules
- Bypass `withLawApiAuth` for authenticated Law endpoints
- Add gateway/WAF enforcement in PRH-005 scope

## References

- [Traffic Policy Guide](./APZHUB-Traffic-Policy-Guide.md)
- [Security Operations Guide](./APZHUB-Security-Operations-Guide.md)
