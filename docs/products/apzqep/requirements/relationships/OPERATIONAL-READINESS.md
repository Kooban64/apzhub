# Operational Readiness — ENG-020F Part 3

## Enablement

1. Apply migrations **0077** then **0078** (Part 2) if not already applied.
2. Deploy `@apzhub/qep-requirements` **0.10.0** + `apps/web` with Relationships Workbench.
3. Grant permissions: `qep.requirements.relationships.{view,create,modify,transition,retire}` as required.
4. Ensure search lifecycle hook `onRelationshipUpserted` remains wired (Part 2 bootstrap).

## Configuration

No new environment variables. Uses existing Platform auth, tenant context, and QEP gateway.

## Search projection

Entity type `requirement_relationship`. Indexes are projections; Workbench always reloads SoR detail after selection.

## Audit actions

`qep.requirements_relationship.*` (create, activated, deprecated, retired, field changes). History summaries also appear in the inspector from domain history.

## Observability

- Server: application `onObservation` (Part 2).
- Frontend: `emitQepWorkbenchTelemetry` events (`relationships.list.load`, `.create`, `.supersede`, lifecycle).

## Common failures

| Symptom                   | Check                                               |
| ------------------------- | --------------------------------------------------- |
| Empty actions / read-only | Permissions + lifecycle; inspect `availableActions` |
| Create rejected           | Self-ref, duplicate, rationale, pin/scope facts     |
| Revision conflict         | Reload detail; re-apply edit                        |
| Search stale              | Select result → detail fetch from SoR               |

## Rollback

Revert `apps/web` Workbench routes/components; leave Part 2 persistence intact. Do not drop relationship tables without Owner approval.

## Smoke test

1. Open Relationships sidebar entry.
2. Create draft relationship.
3. Activate.
4. Open from Requirement panel.
5. Confirm retired relationships show immutable banner.

## Known limitations

- No graph visualisation (by design).
- No bulk mutation UI (no safe bulk API).
- Playwright suite is route smoke; full mutation E2E covered by component tests with mocks.
- Project/release scope existence remains reference-shape validated (Part 2).
