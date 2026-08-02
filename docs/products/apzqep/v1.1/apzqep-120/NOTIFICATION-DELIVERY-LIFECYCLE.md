# Notification Delivery Lifecycle — APZQEP-120-S12

| Field   | Value                                |
| ------- | ------------------------------------ |
| Package | `@apzhub/qep-notification` **0.1.0** |

> Distinct from S08 Outbox [DELIVERY-LIFECYCLE.md](./DELIVERY-LIFECYCLE.md). This document covers **notification** delivery status.

## Statuses

| Status       | Meaning                         |
| ------------ | ------------------------------- |
| pending      | Created, not yet routed         |
| routed       | Channel selected                |
| delivering   | Channel invoke in progress      |
| delivered    | Channel acknowledged success    |
| acknowledged | Recipient acknowledged (future) |
| failed       | Permanent channel failure       |
| retrying     | Transient failure — S09 retry   |
| dead_letter  | Exhausted / permanent           |
| expired      | Past classification expiry      |
| suppressed   | Preference or policy blocked    |

## Reliability integration

| Concern        | Mechanism                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------- |
| Retry          | Processor returns `retry` → S09 engine                                                            |
| Dead letter    | Processor returns `dead_letter` → S09 DLQ                                                         |
| Durable intent | Optional `enqueueNotificationDeliveryIntent` → S08 Outbox (`qep.notification.delivery.requested`) |
| Failure class  | transient / permanent / policy / expired                                                          |
| Audit          | Every deliver / suppress / fail                                                                   |

## Sequence (happy path)

```text
Domain Event
  → Notification Processor (S09 fan-out)
    → Resolve subscriptions
    → Policy + preferences
    → Render template
    → Route to channel(s)
    → Internal Channel deliver
    → Status = delivered + audit + metrics
```
