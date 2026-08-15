# QEP — Leave verification/security dispatch in record_only

| Field     | Value                                |
| --------- | ------------------------------------ |
| Programme | SPR-APZQEP-210 · 210-E               |
| Priority  | INFO                                 |
| Related   | `APZHUB_*_DISPATCH_MODE=record_only` |

## Intent

Default safe posture: dispatch ledger records jobs without writing GitHub Actions workflows.

## When to leave record_only

- Shared hosts without `actions:write` PAT.
- Dogfood before production workflow authorisation.
- Pen-test / verify packs until owners approve live runners.

## When to leave record_only off

1. Confirm PAT scopes and target repos.
2. Unset `record_only` for the specific dispatch mode env vars (see `.env.example`).
3. Restart web; run one change through Quality Journey and confirm GHA/webhook fire.
4. Re-enable `record_only` immediately if unexpected writes occur.

## Honesty

Dispatch never certifies. Certification remains human dual-authority on Release Candidate.
