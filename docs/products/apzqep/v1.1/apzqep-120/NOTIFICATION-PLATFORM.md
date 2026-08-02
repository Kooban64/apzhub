# Notification & Subscription Platform — APZQEP-120-S12

| Field     | Value                                |
| --------- | ------------------------------------ |
| Programme | APZQEP-120                           |
| Slice     | S12                                  |
| Package   | `@apzhub/qep-notification` **0.1.0** |
| Status    | **ACTIVE**                           |

## Principle

> Notifications are **subscribers**, not callers.

| Role              | Owner                                     |
| ----------------- | ----------------------------------------- |
| Publish facts     | Business domains                          |
| Deliver facts     | Event Platform (Outbox + Processing)      |
| Subscribe         | Notification & Subscription Platform      |
| Communicate facts | Channels (Internal first; adapters later) |

## Platform Architecture Rule

```text
Notifications SHALL subscribe to the Quality Knowledge Index or Domain Events.

Notifications SHALL NOT invoke business services directly.

Business domains publish facts.

Notification services communicate those facts.

Business services SHALL NEVER contain notification logic.
```

Not an Enterprise Standard.

## Pipeline

```text
Business Domain
  → Domain Events
    → Platform Outbox (S08)
      → Reliable Processing (S09)
        → Evidence Processors (S10)
        → Knowledge Index Processors (S11)
        → Notification Processors (S12)
              → Subscription Resolution
              → Preferences / Policy
              → Template Resolution
              → Channel Routing
                    → Internal Channel
```

## Classification metadata (mandatory)

| Field          | Values / purpose                                    |
| -------------- | --------------------------------------------------- |
| Severity       | info, warning, error, critical                      |
| Priority       | low, normal, high, urgent                           |
| Category       | evidence, suite, run, defect, security, platform, … |
| Audience       | user, role, team, project, tenant, global           |
| Expiry         | optional ISO-8601 validity                          |
| Correlation ID | link to originating domain event                    |

## Initial channel

**Internal Notification Channel** only. Extension points registered (unimplemented) for email, SMS, push, Teams, Slack, webhook, mobile.

## Related

- [SUBSCRIPTION-REGISTRY.md](./SUBSCRIPTION-REGISTRY.md)
- [CHANNEL-ABSTRACTION.md](./CHANNEL-ABSTRACTION.md)
- [NOTIFICATION-TEMPLATES.md](./NOTIFICATION-TEMPLATES.md)
- [NOTIFICATION-DELIVERY-LIFECYCLE.md](./NOTIFICATION-DELIVERY-LIFECYCLE.md)
- [NOTIFICATION-AUDIT.md](./NOTIFICATION-AUDIT.md)
