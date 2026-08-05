# Composition Model — My Work

| Field     | Value                         |
| --------- | ----------------------------- |
| Programme | APZHUB-CAPABILITY-001-ENG-001 |
| Status    | **ACTIVE**                    |
| Timestamp | 20260805T103000Z              |

## Statement

My Work is a **read-only fan-in** of product list surfaces. The composition service projects work cards into queues. It does not persist business entities.

```text
Client → GET /api/v1/my-work → MyWorkCompositionService
  → Projects | Support | Time | QEP | Workflow (product services)
  → Work cards (references) → Queues
```

## Work card (projection)

| Field        | Meaning                                      |
| ------------ | -------------------------------------------- |
| id           | Stable composition card id (not a new SoR)   |
| product      | Owning product label (secondary in UI)       |
| kind         | Work kind (task, request, timesheet, …)      |
| sourceId     | Authoritative id in owning product           |
| title        | Display title from product                   |
| lifecycle    | Shared lifecycle projection                  |
| href         | Deep link into owning product workspace      |
| dueAt        | Optional due instant                         |
| priority     | Optional priority hint                       |
| updatedAt    | Optional freshness                           |
| queueHints   | Which ENG-001 queues this card may appear in |
| nativeStatus | Product-native status (opaque to users)      |

## ENG-001 queues

| Queue             | Intent                                   |
| ----------------- | ---------------------------------------- |
| needsMyAttention  | Act or acknowledge now                   |
| dueToday          | Commitment / soft obligation lands today |
| waitingForOthers  | I am blocked on someone else             |
| recentlyCompleted | Finite personal completion trail         |

## Failure mode

Provider failures yield **partial composition**. Missing providers omit their cards; the surface remains calm (empty sections allowed).

## Non-ownership

| Concern            | Owner        |
| ------------------ | ------------ |
| Task state         | APZ Projects |
| Support request    | APZ Support  |
| Timesheet          | APZ Time     |
| Quality execution  | APZQEP       |
| Workflow approval  | Workflow     |
| My Work projection | APZHUB       |
