# Platform 1.4 POPIA and Compliance

## Principle

Technical controls ≠ formal legal compliance approval.

## Expectations

| Area                             | Expectation                                                       |
| -------------------------------- | ----------------------------------------------------------------- |
| Purpose limitation               | Notification Delivery purpose remains attention/transactional ops |
| Data minimisation                | Payload fields limited; redaction in diagnostics                  |
| Recipient accuracy               | Identity-owned recipient resolution                               |
| Data-subject rights              | Document support path; no claim of full automated DSAR product    |
| Retention / deletion             | Define retention for delivery attempts/DLQ                        |
| Cross-border                     | Document if external provider processes outside RSA               |
| Provider agreements              | Required before E06 production enablement                         |
| Incident evidence                | Ops runbooks                                                      |
| External notification enablement | **Requires formal compliance approval** after COMP-001            |

## Capabilities requiring formal compliance approval before production enablement

1. Any external transactional delivery provider (SMTP or equivalent).
2. Any cross-border provider processing.
3. Expansion to external recipients (currently excluded).

## Programme

Platform-1.4-COMP-001 — technical evidence pack + checklist for Owner/compliance review. Does not itself grant legal approval.
