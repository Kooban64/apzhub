# Domain Model — Verification Bounded Context

> **Programme:** APZQEP-ENG-040A  
> **Architecture:** APZQEP-ARCH-009 **ACCEPTED**  
> **Package:** `packages/qep-verification/src/domain/verification`

## Aggregate root

| Object         | Kind           | Notes                                                                                                                         |
| -------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `Verification` | Aggregate root | Governed decision record over a subject artefact; owns status, optional outcome, authority, context, scope, history, revision |

## Supporting entities / structures

| Object                 | Kind                | Notes                                                                        |
| ---------------------- | ------------------- | ---------------------------------------------------------------------------- |
| `VerificationHistory`  | Append-only history | Immutable entries (`kind`, `summary`, `at`, `by`)                            |
| `VerificationMetadata` | Extensible map      | Bounded string key/value map (max 64 entries)                                |
| `VerificationDecision` | Decision snapshot   | Outcome + decidedAt/By + optional rationale/comment — set only on completion |

## Identity & classification

| Object                         | Kind                                                         |
| ------------------------------ | ------------------------------------------------------------ |
| `VerificationId`               | Value object (`ver_*`)                                       |
| `VerificationStatus`           | Lifecycle position (status ≠ outcome)                        |
| `VerificationOutcome`          | Decision reached (independent of status)                     |
| `VerificationSubjectReference` | Subject kind + artefact id (+ optional version/baseline/URI) |
| `VerificationAuthority`        | Authority kind + actor id                                    |
| `VerificationContext`          | Baseline / content-version / immutability flags              |
| `VerificationScope`            | Product / project / release / baseline / tenant_global       |
| `VerificationPriority`         | critical · high · medium · low                               |
| `VerificationOrigin`           | user · import · system_rule · ai_suggestion · migration      |
| `VerificationRationale`        | Bounded text                                                 |
| `VerificationReason`           | Bounded text                                                 |
| `VerificationComment`          | Bounded text                                                 |
| `VerificationResultSummary`    | Bounded text                                                 |
| `VerificationTimestamp`        | ISO timestamp VO                                             |
| `VerificationVersion`          | Revision helper                                              |

## Construction

`createVerification` always creates a Verification in **`draft`** with **no outcome**. Factories enforce identity, subject, authority, and create-time policies in the domain layer. No infrastructure or application orchestration is required to construct valid instances.

## Status ≠ Outcome

| Concept     | Meaning                                                                                                   |
| ----------- | --------------------------------------------------------------------------------------------------------- |
| **Status**  | Lifecycle position (`draft` … `verified` / `rejected` / terminal)                                         |
| **Outcome** | Decision value (`verified`, `failed`, `waived`, …) — set only on completion (or interim on `in_progress`) |

A Verification may be `in_progress` with no final outcome. Only `verified` / `rejected` finalise an outcome.

## Ownership boundary

Verification owns Verification Records and Decisions only. It does **not** own Requirements, Trace Links, test artefacts, Evidence content, or Certification artefacts. Those remain owned by their domains; Verification **references** them as subjects.

## Explicit non-goals (ENG-040A)

- No persistence mapping or repositories
- No REST / gateway APIs
- No Workbench / React
- No Event Bus wiring (builders only)
- No Coverage, Impact, Evidence, Certification, AI, or MCP
