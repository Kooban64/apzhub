# APZHUB Notification Bootstrap Guide

**Milestone:** APZNOTIFY-002

```ts
import {
  createNotificationPlatformServicesForProduction,
  createPlatformServices,
  isNotificationServiceEnabled,
} from "@apzhub/platform-services";

if (isNotificationServiceEnabled(process.env)) {
  const notification = createNotificationPlatformServicesForProduction({
    postgresDb: getDb(),
  });
  const bundle = createPlatformServices({ notification, /* authz… */ });
  // bundle.gateway.notification.*
}
```

Production requires PostgreSQL. Tests must pass `allowInMemoryPersistence: true` — no silent fallback.
