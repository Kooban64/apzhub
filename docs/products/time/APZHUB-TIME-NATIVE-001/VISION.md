# Vision — APZ Time (Native Platform Refresh)

| Field     | Value                  |
| --------- | ---------------------- |
| Programme | APZHUB-TIME-NATIVE-001 |
| Status    | **STARTED**            |
| Timestamp | 20260804T191500Z       |

## Product statement

**APZ Time** is APZHUB’s time-tracking product. It is experienced as a native
workspace capability alongside Projects, Support, Documents, Analytics,
Workflow, and Law.

How the capability is implemented (Kimai CE behind a Service Connector) is an
internal detail. It is never part of the user’s mental model.

## Outcomes

1. Users track time, approve entries, and report effort entirely inside APZHUB.
2. One login — APZHUB Identity — no secondary engine session.
3. Roles and permissions are APZHUB roles; backend role names never appear.
4. Navigation, notifications, search, and quality/release flows feel identical
   in pattern to other APZHUB products.
5. Every product change is certified through APZQEP.

## Non-goals (this programme)

- Exposing or documenting Kimai to end users
- Rebuilding time-tracking business logic outside the adapter pattern
- Reopening APZQEP foundations

## Relationship to 1.0.0

Production **1.0.0** remains the current release baseline. This programme
closes native-experience and governance gaps and binds Time development to
APZQEP daily use under ADOPT-001 Phase 1.
