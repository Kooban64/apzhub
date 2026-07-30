# Repository Integrity Report — APZQEP-RELEASE-003

| Field                        | Value                                              |
| ---------------------------- | -------------------------------------------------- |
| Branch                       | `main`                                             |
| Candidate commit             | `ce220a5d3cac706896299797bb56695037f85621`         |
| Package at candidate         | `@apzhub/qep-evidence` **1.0.0-rc.1**              |
| Local vs origin (at attempt) | Local ahead after merge of `9fff73c0`; push failed |
| Verdict                      | **PASS locally / FAIL remote persistence**         |

## Pre-release inspection (recorded)

| Item                                                 | Observation                                                     |
| ---------------------------------------------------- | --------------------------------------------------------------- |
| Staged at candidate commit                           | Evidence capability + programme packs + wiring only             |
| Excluded unrelated                                   | TE RELEASE-002 doc edits not included                           |
| Merge                                                | `origin/main` husky cleanup `9fff73c0` merged non-destructively |
| Working tree after revert of aborted 1.0.0 packaging | Clean at **1.0.0-rc.1**                                         |

## Persistence condition (FREEZE-003)

Still in force: no production deployment until remote commit equals local frozen candidate.
