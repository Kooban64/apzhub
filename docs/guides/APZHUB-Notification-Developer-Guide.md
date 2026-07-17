# APZHUB Notification Developer Guide

**Milestone:** APZNOTIFY-001

---

## Packages

```bash
@apzhub/notification-contracts   # types, enums, permissions, service port
@apzhub/notification-core        # lifecycle + validation + foundation
@apzhub/notification-persistence # memory + postgres factories
```

## Compose foundation

```ts
import { createNotificationFoundation } from "@apzhub/notification-core";
import { createNotificationPersistenceForTest } from "@apzhub/notification-persistence";

const repos = createNotificationPersistenceForTest({
  allowInMemoryPersistence: true, // tests only
});
const foundation = createNotificationFoundation({ repos });

foundation.validate({ notification });
foundation.canTransition("draft", "pending");
```

## Production persistence

```ts
import { createProductionNotificationPersistence } from "@apzhub/notification-persistence";

const repos = createProductionNotificationPersistence({ db });
```

PostgreSQL is mandatory in production. Calling postgres mode without `db` throws — no silent in-memory fallback.

## Boundaries

- Do not import these packages from apps/web Workbench or HTTP handlers yet
- Do not implement send/deliver providers here
- Do not publish to Event Bus from these packages

## Audit

```bash
pnpm audit:notification-foundation
```

## Next (not authorised)

**APZNOTIFY-002 — Notification Platform Services, Gateway & Authorization**
