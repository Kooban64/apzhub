# APZHUB Session Security Developer Guide (PRH-006)

## Validating sessions in route handlers

```typescript
import { getValidatedSession } from "@apzhub/auth/server";

const session = await getValidatedSession(await headers());
```

Always use `getValidatedSession` — not raw Better Auth responses — for tenant enrichment.

## Law API routes

```typescript
import { withLawApiAuth } from "@/lib/api";

export const GET = withLawApiAuth(async (request, context) => {
  // context.user, context.tenantId, context.permissions
}, { requireAuth: true, requireTenant: true });
```

## Platform API guards

```typescript
import { requirePlatformSession, requirePlatformSessionWithTenant } from "@apzhub/platform-security";
```

## Middleware

Use the shared edge-safe helper — do not duplicate session fetch logic:

```typescript
import { fetchMiddlewareSession } from "@apzhub/auth/middleware-session";
```

## Validation helpers

```typescript
import { validateEnrichedSession, validateTenantSessionConsistency } from "@apzhub/auth/server";
```

## Do not

- Configure cookie flags in apps
- Parse session cookies manually
- Use development tenant fallbacks in production paths
- Expose session tokens in diagnostics or logs

## References

- [Session Policy Guide](./APZHUB-Session-Policy-Guide.md)
