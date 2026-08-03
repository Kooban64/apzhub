# OUTSTANDING-ISSUES-DISPOSITION — PBR-APZQEP-162

| Field     | Value            |
| --------- | ---------------- |
| Timestamp | 20260803T174024Z |

| ID        | Issue                                                      | Classification                    | Wave 2 blocker?                                                        |
| --------- | ---------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------- |
| OI-162-01 | Repository/webhook stores process-local (in-memory)        | OPERATIONAL / durability residual | **No** — do not claim production-durable SCM state                     |
| OI-162-02 | Live GitHub API optional (`APZHUB_SCM_GITHUB_LIVE`)        | NON-BLOCKING RESIDUAL             | **No** — offline CI honest                                             |
| OI-162-03 | Remote webhook registration ops-deferred                   | OPERATIONS ITEM                   | **No** — verified ingress + offline registration sufficient for Wave 2 |
| OI-162-04 | Other SCM providers are placeholders                       | FUTURE WAVE                       | **No** — no false readiness claims                                     |
| OI-162-05 | OE-002…OE-009 outside Wave 2; OE-012 CLOSED via APZQEP-162 | FUTURE WAVE / CLOSED              | **No**                                                                 |
| OI-162-06 | Engine reject-path reads `x-github-delivery` header name   | NON-BLOCKING RESIDUAL             | **No** — minor; not material contract contamination                    |
| OI-162-07 | Project-level isolation not first-class on SCM entities    | FUTURE WAVE                       | **No** — tenant isolation present                                      |
| OI-162-08 | Some webhook edge cases lack dedicated automated tests     | NON-BLOCKING RESIDUAL             | **No** — core signature/idempotency tested                             |
| OI-162-09 | Remote `git push` failed (no repo access / token)          | OPERATIONS ITEM                   | **No** for architecture; Owner must push                               |
| OE-008    | Unrelated `qep-defects` production typecheck               | INVALID as Wave 2 blocker         | **No** — pre-existing                                                  |

No **BLOCKER** issues identified for Wave 2 certification.
