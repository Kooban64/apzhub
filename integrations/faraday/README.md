# `@apzhub/integration-faraday`

APZPEN Faraday path (SPR-APZPEN-ENT-001). Engine branding is hidden from operators.

## Capabilities

| Capability         | API                                                                                                                           |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Findings normalize | `normalizeFaradayPayload(payload)` — Faraday `{ vulns: [...] }` or simplified `{ findings: [...] }`                           |
| Health             | `probeFaradayHealth(baseUrl?)` — without `FARADAY_URL`: `{ ok: false, detail: "compose not deployed — ingest via artefact" }` |

## Ingest

Compose is not deployed yet. Export Faraday JSON (or simplified findings) and ingest via APZPEN provider ingest (`toolId: faraday`). Live sync lands in a later ENT-001 slice.

## Ops

Set `FARADAY_URL` only when a Faraday instance is reachable; otherwise health stays planned / artefact-ingest.
