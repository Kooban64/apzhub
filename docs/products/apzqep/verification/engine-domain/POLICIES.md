# Policies — Verification Domain

> **Programme:** APZQEP-ENG-040A  
> **Architecture:** APZQEP-ARCH-009 **ACCEPTED**  
> **Source:** `verification-policy.ts` · `PolicyService` in `verification-domain-service.ts`

All policies are **pure** and **persistence-independent**. They assert invariants; they do not perform I/O.

## Create-time policies

| Policy | Rule |
| ------ | ---- |
| `assertHasSubject` | Subject reference with non-empty `artefactId` required |
| `assertAuthority` | Authority with non-empty `actorId` required |
| `assertReference` | `external_reference` subjects require `externalUri` |

Applied via `PolicyService.runCreatePolicies` from `createVerification`.

## Completion policies

| Policy | Rule |
| ------ | ---- |
| `assertOutcomeRequiredForCompletion` | `verified` / `rejected` require an outcome |
| `assertNoFinalOutcomeBeforeCompletion` | `draft` / `requested` / `assigned` must not carry outcome; `in_progress` may only carry interim (`blocked`, `deferred`) |
| `assertRationaleForOutcome` | Outcomes `failed`, `waived`, `partially_verified` require rationale |

Applied via `PolicyService.runCompletePolicies` from `verifyVerification` / `rejectVerification`.

## Outcome pairing

| Completion path | Allowed outcomes |
| --------------- | ---------------- |
| `verifyVerification` → `verified` | `verified`, `partially_verified`, `waived` |
| `rejectVerification` → `rejected` | `failed`, `blocked`, `inconclusive` |

## Mutability policies

| Policy | Rule |
| ------ | ---- |
| `assertMutable` | Terminal statuses (`withdrawn`, `cancelled`, `retired`, `superseded`) are immutable |
| `assertImmutableWhenSupersededOrRetired` | Explicit guard for superseded/retired |
| Aggregate `assertUpdatable` | Updates only in `draft` · `requested` · `assigned` · `in_progress` |

## Supersession

| Policy | Rule |
| ------ | ---- |
| `assertSupersession` | Successor id must differ from self |

## Versioning helper

| Policy | Rule |
| ------ | ---- |
| `assertVersion` | Expected revision must match actual (for future optimistic concurrency callers) |

## Out of scope for ENG-040A

- Persistence existence checks against Requirements / Traceability stores
- Permission enforcement (Platform Authz)
- Event Bus publish / subscribe
- AI authority promotion workflows
