# Platform Personalisation — Developer Onboarding (M8-04)

## Quick start

```typescript
import { getSharedPersonalisationService } from "@apzhub/platform-personalisation";
import { resolveSessionPersonalisation } from "@apzhub/platform-personalisation/server";

const snapshot = await resolveSessionPersonalisation({ userId: session.user.id });
const theme = snapshot.preferences.appearance.theme;
```

## Server hydration (products)

```typescript
import { createPlatformPersonalisationContext } from "@/lib/session-personalisation-context";

const personalisation = await createPlatformPersonalisationContext(session);
// Pass initialTheme to shell provider
```

## Client theme sync

```tsx
import { PersonalisationThemeBridge } from "@/components/platform-personalisation/personalisation-theme-bridge";

<PersonalisationThemeBridge userId={userId} initialTheme={initialTheme} />;
```

## Workbench session store

```typescript
import { createPlatformPersonalisationSessionStore } from "@/lib/platform-personalisation/session-store";

<WorkbenchProvider sessionStore={createPlatformPersonalisationSessionStore()} ... />
```

## APIs

All routes require authenticated session. Use shared handlers from `@apzhub/platform-personalisation/server` in product API routes.

## Testing

```typescript
import {
  createInMemoryPersonalisationService,
  resetSharedPersonalisationService,
} from "@apzhub/platform-personalisation";

resetSharedPersonalisationService();
const { service } = createInMemoryPersonalisationService();
```

## Package layout

```
packages/platform-personalisation/src/
  personalisation-service.ts
  preference-service.ts
  favorites-service.ts
  recent-items-service.ts
  workbench-layout-service.ts
  repositories/
  postgres-personalisation-store.ts
  api-handlers.ts
  server.ts
```

## References

- [Personalisation Reference Architecture](../architecture/APZHUB-Platform-Personalisation-Reference-Architecture.md)
- [Preference Model](../architecture/APZHUB-Platform-Preference-Model.md)
- [ADR-0043](../adr/ADR-0043-platform-personalisation-framework.md)
