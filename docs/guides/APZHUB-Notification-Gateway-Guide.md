# APZHUB Notification Gateway Guide

**Milestone:** APZNOTIFY-002

Consume notifications only via `PlatformServiceGateway.notification` — never import persistence or core from modules.

```ts
const ntf = await gateway.notification.notifications.create(ctx, {
  title: "Hello",
  channelKinds: ["in_app"],
});
await gateway.notification.notifications.transition(ctx, {
  notificationId: ntf.id,
  to: "pending",
});
const health = await gateway.notification.diagnostics.health(ctx);
// health.deliveryEnabled === false
```

Every call traverses RequestPipeline → Authorization → thin impl → Notification Core.
