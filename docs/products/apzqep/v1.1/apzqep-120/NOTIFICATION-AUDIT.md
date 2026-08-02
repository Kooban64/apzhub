# Notification Audit — APZQEP-120-S12

| Field   | Value                                |
| ------- | ------------------------------------ |
| Package | `@apzhub/qep-notification` **0.1.0** |

## Purpose

Immutable-style audit trail of notification decisions and delivery outcomes.

## Recorded actions (examples)

| Action                | When               |
| --------------------- | ------------------ |
| delivered             | Channel success    |
| delivery_failed       | Channel failure    |
| suppressed            | Policy blocked     |
| preference_suppressed | Preference blocked |

## Fields

| Field          | Purpose                       |
| -------------- | ----------------------------- |
| auditId        | Unique audit entry            |
| notificationId | Related notification          |
| deliveryId     | Related delivery (optional)   |
| action         | What happened                 |
| detail         | Reason / channel / error      |
| at             | ISO-8601 timestamp            |
| correlationId  | Originating event correlation |

## Metrics (observability — no dashboards in S12)

- notifications sent / failed / suppressed
- retry count / dead letter count
- delivery latency
- channel usage
- subscription matches
- template renders
- delivery success rate
