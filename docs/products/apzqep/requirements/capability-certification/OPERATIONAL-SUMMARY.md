# Requirements Operational Summary

## Deploy / enable

1. Apply migrations **0072 → 0078** in order (versioning, baselines, relationships).
2. Deploy `@apzhub/qep-requirements` **1.0.0** with `apps/web` and `modules/qep-requirements` **1.0.0**.
3. Configure permissions for Requirements, Baselines, and Relationships catalogues.
4. Verify search hooks for requirement / baseline / relationship projections.

## Configuration

No new environment variables introduced by certification. Uses Platform auth, tenant context, database, and existing QEP gateway wiring.

## Audit

Platform audit actions for requirement, content version, baseline, and relationship mutations. Domain history summaries appear in Workbench inspectors where exposed.

## Observability

- Server: application `onObservation` hooks (relationships/baselines/services).
- Client: `emitQepWorkbenchTelemetry` for Workbench load/mutation outcomes.
- Correlate via Platform correlation IDs.

## Common failure modes

| Symptom | Likely cause |
| ------- | ------------ |
| Read-only actions | Missing permission or empty `availableActions` |
| Revision conflict | Concurrent edit — reload and retry |
| Search result stale | Projection lag — open detail from SoR |
| Immutable edit blocked | Retired/deprecated/baseline-locked context |

## Rollback

- Application rollback: redeploy prior package/app revision.
- Do **not** reverse migrations without Owner-approved data plan.
- Relationship/baseline tables are SoR — preserve data.

## Smoke (post-deploy)

1. List Requirements; open detail.  
2. Inspect Content Versions.  
3. Open Baselines list; inspect locked baseline (read-only).  
4. Relationships: list → create draft → activate.  
5. Confirm retired/deprecated relationship shows immutable banner.

## Detailed slice runbooks

- Baselines: [../baselines/OPERATIONAL-READINESS.md](../baselines/OPERATIONAL-READINESS.md)  
- Relationships: [../relationships/OPERATIONAL-READINESS.md](../relationships/OPERATIONAL-READINESS.md)
