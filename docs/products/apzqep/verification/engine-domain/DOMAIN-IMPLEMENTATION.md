# Domain Implementation — APZQEP-ENG-040A

## Package

`packages/qep-verification` — `@apzhub/qep-verification` **0.1.0**

Programme marker: `APZQEP-ENG-040A IMPLEMENTED AWAITING OWNER ACCEPTANCE`

## Aggregate

| Aggregate | Module |
| --------- | ------ |
| `Verification` | `src/domain/verification/verification.ts` |

## Entities / structures

| Entity | Representation |
| ------ | -------------- |
| Verification | Aggregate root |
| VerificationHistory | Append-only history |
| VerificationMetadata | Extensible string map |
| VerificationDecision | Completion decision snapshot |

## Value objects

VerificationId (`ver_*`) · Status · Outcome · Subject · Authority · Context · Scope · Priority · Origin · Rationale · Reason · Comment · ResultSummary · Timestamp · Version

## Lifecycle

```text
draft → requested → assigned → in_progress → verified | rejected
                                              ↘ expired / superseded / retired / withdrawn
rejected | expired → requested (re-open)
terminals: withdrawn · cancelled · retired · superseded
```

Status ≠ Outcome. See [LIFECYCLE.md](./LIFECYCLE.md).

## Policies (persistence-independent)

Authority · subject · reference · outcome-required-on-completion · no-final-outcome-before-completion · rationale-for-outcome · mutability · supersession · version helper

## Domain services

`VerificationLifecycleService` · `ValidationService` · `OutcomeService` · `AuthorityService` · `PolicyService` — pure, fact-driven, no I/O.

## Domain events (builders only)

`qep.verification.created|requested|assigned|started|completed|verified|failed|rejected|expired|withdrawn|superseded|cancelled|retired`

## Ownership boundary

Verification owns Verification Records and Decisions only. Does **not** own Requirements, Trace Links, Coverage, Impact, Evidence, Certification, AI, or MCP.

## Architecture fidelity

Implements APZQEP-ARCH-009 without duplicating the architecture pack. Full architecture remains at [architecture/verification/](../../architecture/verification/README.md).
