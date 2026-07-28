# Lifecycle — Verification Aggregate

> **Programme:** APZQEP-ENG-040A  
> **Architecture:** APZQEP-ARCH-009 **ACCEPTED**  
> **Source:** `verification-lifecycle-state.ts`

## Status catalogue

`draft` · `requested` · `assigned` · `in_progress` · `verified` · `rejected` · `expired` · `withdrawn` · `superseded` · `cancelled` · `retired`

## Permitted transitions

```text
draft        → requested | cancelled | retired
requested    → assigned | in_progress | cancelled | withdrawn
assigned     → in_progress | cancelled | withdrawn
in_progress  → verified | rejected | cancelled | withdrawn
verified     → expired | superseded | retired | withdrawn
rejected     → superseded | retired | requested   (re-open)
expired      → superseded | retired | requested   (re-open)
withdrawn, cancelled, retired, superseded → (terminal — no further transitions)
```

## Behavioural rules

| Rule                  | Detail                                                                                                   |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| Create                | Always starts in `draft`; no outcome                                                                     |
| Completion            | `verifyVerification` → `verified` + success outcome; `rejectVerification` → `rejected` + failure outcome |
| Outcome required      | `verified` / `rejected` must carry an outcome                                                            |
| Mutable window        | Field updates allowed only in `draft` · `requested` · `assigned` · `in_progress`                         |
| Terminal immutability | `withdrawn` · `cancelled` · `retired` · `superseded` are immutable                                       |
| No delete             | History preserved; supersession records successor id                                                     |
| Re-open               | `rejected` / `expired` may return to `requested`                                                         |

## Aggregate operations

| Operation               | Target status | Events                                                    |
| ----------------------- | ------------- | --------------------------------------------------------- |
| `createVerification`    | `draft`       | `created`                                                 |
| `requestVerification`   | `requested`   | `requested`                                               |
| `assignVerification`    | `assigned`    | `assigned`                                                |
| `startVerification`     | `in_progress` | `started`                                                 |
| `verifyVerification`    | `verified`    | `verified` + `completed`                                  |
| `rejectVerification`    | `rejected`    | `rejected` + `completed` (+ `failed` if outcome=`failed`) |
| `expireVerification`    | `expired`     | `expired`                                                 |
| `withdrawVerification`  | `withdrawn`   | `withdrawn`                                               |
| `supersedeVerification` | `superseded`  | `superseded`                                              |
| `cancelVerification`    | `cancelled`   | `cancelled`                                               |
| `retireVerification`    | `retired`     | `retired`                                                 |

## Status ≠ Outcome

Lifecycle status is never used as a substitute for outcome. Outcomes are decision values; statuses are process positions. See [DOMAIN-MODEL.md](./DOMAIN-MODEL.md).
