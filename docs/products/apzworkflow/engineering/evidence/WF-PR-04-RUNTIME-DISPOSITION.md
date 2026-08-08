# WF-PR-04 — Runtime / runs plane disposition

| Field  | Value            |
| ------ | ---------------- |
| ID     | **WF-PR-04**     |
| Status | **Closed**       |
| Date   | 20260808T132000Z |

## Disposition (Version 1.0 Production Ready)

The commercial **runs** plane is a **non-SoR MVP / operator surface**, not the business-process System of Record.

| Plane                                         | Role in V1.0 PR                                                        |
| --------------------------------------------- | ---------------------------------------------------------------------- |
| Business journeys / templates / instances     | **SoR** — platform Postgres                                            |
| Workflow definition SoR (`/api/v1/workflows`) | **SoR** — platform Postgres                                            |
| Runs / schedules execute                      | **Gated** — `providerExecuteSupported=false`, `executionEnabled=false` |
| n8n adapter                                   | **CERTIFIED_FOUNDATION** read-only                                     |

## Matching behaviour (WF-P1-02)

- HTTP `POST /api/v1/workflow/runs` → **409** `PROVIDER_EXECUTE_NOT_SUPPORTED` when execute unsupported
- UI Start run hidden + gated disclosure
- Capabilities / readiness expose execute limitation

No half-enabled execute. Unlock requires separate Owner Auth (out of inventory).
