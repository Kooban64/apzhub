# Phase 3 — Hardening Defect Log

| Field          | Value                                                                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Release        | APZ-PROJECTS-RELEASE-3.0                                                                                                                        |
| Severity scale | Critical · High · Medium · Low                                                                                                                  |
| Disposition    | **CLOSED with RC1** — remaining Medium/Low → [RELEASE-3.1-OPERATIONAL-IMPROVEMENT-BACKLOG.md](./RELEASE-3.1-OPERATIONAL-IMPROVEMENT-BACKLOG.md) |

## Open at close (moved to 3.1 backlog)

| ID       | Severity | Class                        | Summary                                                                 |
| -------- | -------- | ---------------------------- | ----------------------------------------------------------------------- |
| HD-H1-01 | Medium   | Product (narrow)             | Controlled project-name input remounts while operational queries settle |
| HD-H1-02 | Medium   | Certification Infrastructure | Long UI-cert journeys intermittent under route mocks                    |
| HD-H1-03 | Medium   | Certification Infrastructure | Prod `failFast` discovery env for E2E standalone                        |
| HD-H1-04 | Low      | Host coexistence             | `next build` vs long-lived `:3300` next-dev                             |
| HD-H1-05 | Medium   | Certification Infrastructure | Session drop under long Playwright sequences                            |
| HD-H5-01 | Medium   | Certification Infrastructure | WebKit shared storageState hydration                                    |

## Closed in Release 3.0

| ID          | Severity         | Resolution               |
| ----------- | ---------------- | ------------------------ |
| HD-H2-01    | Critical → Fixed | Document titles          |
| HD-H2-02    | Critical → Fixed | Identity listbox ARIA    |
| HD-H2-03    | High → Fixed     | Lifecycle gaps null-safe |
| HD-H2-04    | Medium → Fixed   | Quick Action Escape      |
| HD-H2-05    | Low → Fixed      | ErrorState contrast      |
| HD-H2-06    | Medium → Fixed   | Mobile ops fixed nav     |
| HD-H1-B1…B3 | High → Fixed     | Build / E2E host         |
