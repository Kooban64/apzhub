# APZQEP-OES-ENG-060B — APPENDIX E — Owner Acceptance Checklist & Reference Patterns

## Owner Acceptance Checklist

| ID    | Criterion                                                  | Expected |
| ----- | ---------------------------------------------------------- | -------- |
| AC-01 | Document 000                                               | PASS     |
| AC-02 | OES-000                                                    | PASS     |
| AC-03 | OES-001                                                    | PASS     |
| AC-04 | Reviewable under OES-002                                   | PASS     |
| AC-05 | Certified Domain consumed as immutable                     | PASS     |
| AC-06 | Repository architecture                                    | PASS     |
| AC-07 | Persistence architecture (no SQL)                          | PASS     |
| AC-08 | Command architecture                                       | PASS     |
| AC-09 | Query architecture                                         | PASS     |
| AC-10 | REST resource catalogue                                    | PASS     |
| AC-11 | Search architecture                                        | PASS     |
| AC-12 | Permission architecture                                    | PASS     |
| AC-13 | Audit architecture                                         | PASS     |
| AC-14 | Observability architecture                                 | PASS     |
| AC-15 | Event publication                                          | PASS     |
| AC-16 | No business rules in Infra OES                             | PASS     |
| AC-17 | No production code                                         | PASS     |
| AC-18 | Reusable orchestration patterns (no shared business logic) | PASS     |
| AC-19 | Workbench / AI / MCP excluded                              | PASS     |
| AC-20 | COMPLETE + Owner Summary + Completion Report               | PASS     |

## Owner decision options

| Decision        | Effect                                                                                  |
| --------------- | --------------------------------------------------------------------------------------- |
| **ACCEPTED**    | Infrastructure OES baselined; implementation requires separate **ENG-060B** Instruction |
| **REJECTED**    | Remediate specification                                                                 |
| **CONDITIONAL** | Owner records conditions                                                                |

## Reference orchestration patterns (non-normative summary)

For future capabilities (Execution, Runs, Suites, Evidence, Certification):

1. Same layering: REST → App → Domain → Repo port → Postgres.
2. Same concurrency: `revision` + `expectedRevision`.
3. Same side-effect order: persist → audit → events → search.
4. Same naming: `/api/v1/qep/{resource}`, `qep.{capability}.*` permissions/events.
5. **Never** extract Domain invariants into a shared business library.

## Decision pending

Await Owner Engineering Specification Review.
