# APZQEP-120-S12 — Engineering Notes

| Field           | Value                                |
| --------------- | ------------------------------------ |
| Slice           | S12                                  |
| Title           | Notification & Subscription Platform |
| Package         | `@apzhub/qep-notification` **0.1.0** |
| Classification  | Product Engineering                  |
| Timestamp (UTC) | 20260802T161211Z                     |

## Architecture decisions

1. **New package** `@apzhub/qep-notification` — does not thaw or redesign frozen APZNOTIFY packages (`notification-core`, etc.).
2. **Subscriber pattern** — processors register onto `@apzhub/platform-processing` via `resolveAll` fan-out alongside Evidence (S10) and QKI (S11).
3. **No business service calls** — facts come from event envelopes / payloads only.
4. **Classification metadata** standardised (severity, priority, category, audience, expiry, correlationId).
5. **Internal channel only** — other channels registered as unimplemented extension points.
6. **S08 bridge** — optional `enqueueNotificationDeliveryIntent` for durable delivery intents.
7. **S09 retry/DLQ** — processors return `retry` / `dead_letter` / `acknowledged`.

## Package layout

```text
packages/qep-notification/src/
  domain/           classification + types
  subscription/     registry, manager, resolution
  preferences/      preference store + evaluation
  policy/           policy + routing
  channel/          port, internal, registry
  template/         registry + resolution
  delivery/         engine, status, history, audit, metrics, diagnostics, outbox-bridge
  processors/       Evidence event subscribers + bundle
  compose.ts        createNotificationSubscriptionPlatform
```

## Out of scope (held)

Email / SMS / Push / Slack / Teams / Webhook / Mobile providers · Command Palette · AI · QI · Dashboards · External notification SaaS.

## Next

APZQEP-120-S13 Command Palette (requires Owner Authorisation Pack).
