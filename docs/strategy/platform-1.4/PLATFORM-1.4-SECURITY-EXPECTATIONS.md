# Platform 1.4 Security Expectations

## Preserve (mandatory)

Deny-by-default · authenticated requests · ProductionAuthorizationProvider · tenant isolation · organisation isolation · least privilege · secure sessions · secrets isolation · configuration validation · input validation · rate limiting · abuse prevention · audit · redaction · safe diagnostics · replay authorisation · privileged admin controls · provider credential boundaries.

## Candidate 1.4 security work (planning only)

| Item                               | Notes                                         |
| ---------------------------------- | --------------------------------------------- |
| Delivery admin privilege catalogue | Extend existing catalogues; no parallel authz |
| Provider credential vaulting       | Required before E06; secrets never in repo    |
| Replay/DLQ privileged actions      | Audit + authz                                 |
| External delivery enablement flag  | Deny-by-default retained                      |

## Explicit

Do **not** introduce a parallel authorisation system. Do **not** put provider secrets in `.env.example` as real values.
