# `@apzhub/integration-faraday`

APZPEN Faraday path (SPR-APZPEN-ENT-001). Engine branding is hidden from operators.

## Capabilities

| Capability         | API                                                                                                                           |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Findings normalize | `normalizeFaradayPayload(payload)` — Faraday `{ vulns: [...] }` or simplified `{ findings: [...] }`                           |
| Health             | `probeFaradayHealth(baseUrl?)` — without `FARADAY_URL`: `{ ok: false, detail: "compose not deployed — ingest via artefact" }` |

## Ingest

**Primary ENT-001 path:** export Faraday JSON → `~/apztools/security/out/faraday/` → APZPEN list (`GET …/providers/faraday/artefacts`) and optional path ingest when `APZPEN_FARADAY_ARTEFACT_INGEST=true`. Also paste/upload via provider ingest (`toolId: faraday`). Live API sync is not required for ingest.

Optional compose scaffold (profile-gated, Owner-enabled): `infrastructure/docker/clusters/faraday/`. Prefer upstream Faraday CE compose + `FARADAY_URL` probe when an instance is running.

## Ops

Set `FARADAY_URL` only when a Faraday instance is reachable; otherwise health stays planned / artefact-ingest.
