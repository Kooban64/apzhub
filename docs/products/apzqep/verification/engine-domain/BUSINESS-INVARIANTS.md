# Business Invariants — Verification Domain

> **Programme:** APZQEP-ENG-040A  
> **Architecture:** APZQEP-ARCH-009 **ACCEPTED**

Violations raise `VerificationInvariantViolation`.

## Identity & tenancy

1. Verification id must be `ver_*`.
2. Create requires non-empty `tenantId`, `createdBy`, `correlationId`.
3. Every change requires non-empty `changedBy`.

## Subject & authority

4. Every Verification has exactly one subject reference with a non-empty `artefactId`.
5. `external_reference` subjects require `externalUri`.
6. Authority with non-empty `actorId` is required at create.

## Status ≠ Outcome

7. Create always yields `draft` with **no** outcome.
8. `draft` / `requested` / `assigned` must never carry an outcome.
9. `in_progress` may only carry interim outcomes (`blocked`, `deferred`).
10. `verified` / `rejected` **require** an outcome.
11. Success path (`verifyVerification`) accepts only success outcomes; reject path accepts only failure outcomes.

## Lifecycle

12. Only transitions listed in [LIFECYCLE.md](./LIFECYCLE.md) are allowed.
13. Terminal statuses (`withdrawn`, `cancelled`, `retired`, `superseded`) admit no further transitions.
14. Field updates are allowed only while status is in the mutable window.
15. No delete; history is append-only.

## Rationale

16. Outcomes `failed`, `waived`, and `partially_verified` require rationale.

## Supersession

17. A Verification cannot supersede itself.
18. Supersession records `successorVerificationId`.

## History & revision

19. Every successful mutation increments `revision` and appends a history entry.
20. Metadata / text VOs enforce length and entry bounds (see [VALUE-OBJECTS.md](./VALUE-OBJECTS.md)).

## Ownership

21. Verification does not mutate Requirements, Trace Links, Evidence, or Certification SoRs.
22. AI origin (`ai_suggestion`) never grants decision authority by itself.
