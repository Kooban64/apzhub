# Support Runbook — Evidence Management

## Triage

1. Confirm capability path (`/api/v1/qep/evidence` or Workbench).
2. Capture correlation ID.
3. Classify: authz (403), unavailable (503), validation (400), conflict (409), data loss after restart (limitation).
4. Escalate storage/durability requests to Owner — **out of OPS-001 support fix scope**.

## Standard responses

| Ask                                      | Response                                                           |
| ---------------------------------------- | ------------------------------------------------------------------ |
| “Where is my Evidence after reboot?”     | Memory runtime — data is not durable until storage selection.      |
| “Is Evidence certified?”                 | Engineering-complete; OPS-001 assessed; Certification not started. |
| “Can you turn on Postgres for Evidence?” | Requires Owner-authorised storage programme (ADR-0088).            |

## Contacts / ownership

- Platform QEP engineering for gateway/REST
- Owner for storage / certification authorisation
