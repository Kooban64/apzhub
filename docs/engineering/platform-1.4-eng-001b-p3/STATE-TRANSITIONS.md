# State Transitions (Implemented)

Authoritative: `NOTIFICATION_DELIVERY_TRANSITIONS`.

| From                     | To                | Path                           |
| ------------------------ | ----------------- | ------------------------------ |
| queued / retry_scheduled | processing        | claim                          |
| processing               | delivered         | success completion             |
| processing               | retry_scheduled   | transient + attempts remaining |
| processing               | permanent_failure | permanent / exhausted          |
| processing               | expired           | intent expiry (fenced)         |

Invalid transitions rejected via fencing / assert. Terminal states immutable (no reverse). Manual replay excluded.
