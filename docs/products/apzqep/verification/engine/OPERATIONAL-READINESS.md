# Operational Readiness — APZQEP-ENG-040B

## Smoke test checklist

| # | Check | Expected |
| --- | --- | --- |
| 1 | Migrations **0081** / **0082** applied | Tables `qep_verification`, `qep_verification_history` with RLS |
| 2 | `GET /api/v1/qep/verifications` (authorised) | Paginated list (empty OK) |
| 3 | `POST /api/v1/qep/verifications` | Creates draft; returns DTO |
| 4 | Lifecycle: request → assign → start → complete | Status/outcome evolve per domain rules |
| 5 | `GET .../{id}/history` | Append-only domain history |
| 6 | Permission denial | 403 without required `qep.verification.*` |
| 7 | Search upsert hook | `verification_record` projected; retired/superseded/cancelled removed |
| 8 | Workbench routes | **Absent** — no Workbench under ENG-040B |

## Enablement

- Package `@apzhub/qep-verification` **0.2.0**
- Module stub `qep-verification` **0.2.0** (permissions; **no** Workbench routes)
- Platform Services Verification facet enabled with Postgres persistence in production
- Permissions granted per role as required

## Rollback

- Revert package/module to prior version; drop or leave migrations per Owner ops policy
- Search projection entity `verification_record` ceases updates when hooks unwired
- No Workbench schemas introduced

## Limitations

- Default subject resolver is permissive until Requirements/Trace adapters are composition-wired
- No Playwright Workbench E2E (Workbench **NOT AUTHORISED**)
- Coverage / Impact / Evidence / Certification / AI / MCP **NOT AUTHORISED**
- ENG-040B awaits Owner Acceptance
