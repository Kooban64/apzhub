# SPR-ADOPT-003 — Friction log

| ID  | Severity | Area             | Observation                                                                            | Disposition                                                               |
| --- | -------- | ---------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| F1  | Low      | Projects routing | `GET /api/v1/projects/readiness` collided with `[projectId]`                           | **Fixed** — Phase H · static `app/api/v1/projects/readiness/route.ts`     |
| F2  | Low      | Support health   | No `/api/v1/support/health` route; list via `/api/v1/support-requests` works           | Deferred — optional symmetry with Projects/Time health                    |
| F3  | Info     | Honesty statuses | Time / Analytics / Workflow provider health may report `degraded` while auth+API valid | Accepted — foundation honesty; not a dogfood blocker                      |
| F4  | Info     | Coexistence      | Engines still the shared host listeners until APZHUB LTS cutover                       | Owner rule — leave legacy alone; migrate when APZHUB LTS stacks are ready |

No High/Blocker items found for BetterAuth commercial journeys on this pass.
