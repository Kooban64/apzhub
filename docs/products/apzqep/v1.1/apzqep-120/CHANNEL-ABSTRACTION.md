# Channel Abstraction — APZQEP-120-S12

| Field   | Value                                |
| ------- | ------------------------------------ |
| Package | `@apzhub/qep-notification` **0.1.0** |

## Port

```text
ChannelProvider
  channelId
  displayName
  implemented: boolean
  deliver(input) → ok | retryable failure
```

Future providers implement `ChannelProvider` only. No redesign of the Notification Platform.

## Implemented (S12)

| Channel ID | Provider                      |
| ---------- | ----------------------------- |
| `internal` | Internal Notification Channel |

## Extension points (registered, not implemented)

| Channel ID        | Display name    |
| ----------------- | --------------- |
| `email`           | Email           |
| `sms`             | SMS             |
| `push`            | Push            |
| `microsoft_teams` | Microsoft Teams |
| `slack`           | Slack           |
| `webhook`         | Webhook         |
| `mobile`          | Mobile          |

Unimplemented providers return permanent failure (`channel.not_implemented:*`).
