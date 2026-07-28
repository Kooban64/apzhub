# Domain Services — Verification

> **Programme:** APZQEP-ENG-040A  
> **Architecture:** APZQEP-ARCH-009 **ACCEPTED**  
> **Source:** `verification-domain-service.ts`

All services are **pure** — no repositories, databases, HTTP, or Platform Services.

## VerificationLifecycleService

| Method             | Role                                       |
| ------------------ | ------------------------------------------ |
| `isTerminal`       | Whether status has no outbound transitions |
| `canTransition`    | Soft check for allowed transition          |
| `assertTransition` | Hard assert; throws on illegal transition  |

## ValidationService

| Method                | Role                        |
| --------------------- | --------------------------- |
| `validateCreateInput` | Subject + authority present |

## OutcomeService

| Method             | Role                                         |
| ------------------ | -------------------------------------------- |
| `isSuccessOutcome` | `verified` · `partially_verified` · `waived` |
| `isFailureOutcome` | `failed` · `blocked` · `inconclusive`        |
| `isInterimOutcome` | `blocked` · `deferred`                       |

## AuthorityService

| Method                   | Role                      |
| ------------------------ | ------------------------- |
| `assertAuthorityPresent` | Non-empty authority actor |

## PolicyService

| Method                | Role                                                |
| --------------------- | --------------------------------------------------- |
| `runCreatePolicies`   | Create-time structural policies                     |
| `runCompletePolicies` | Outcome required / no premature outcome / rationale |

## Aggregate as primary API

Lifecycle mutations live on the aggregate module (`createVerification`, `requestVerification`, …). Domain services support validation and classification; they do not orchestrate persistence or APIs.

## Explicit non-goals

- No application-layer orchestration
- No connector / backend calls
- No permission checks (Platform Authz owns that later)
