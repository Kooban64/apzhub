# `@apzhub/integration-greenbone`

APZPEN Greenbone CE path (SPR-APZPEN-ENT-001). Engine branding is hidden from operators.

## Capabilities

| Capability         | API                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------- |
| Findings normalize | `normalizeGreenboneSimplified(payload)`                                                  |
| Health             | `probeGreenboneHealth(baseUrl?)` — default `http://127.0.0.1:9392` or `GREENBONE_UI_URL` |

## Ingest

APZPEN already accepts Greenbone simplified JSON via `provider-ingest` (`format: simplified`, `toolId: greenbone`). Prefer exporting artefacts to `~/apztools/security/out/greenbone/` then ingest through `/api/v1/apzpen/...`. Use this package’s normalize helper when building connector/adapters.

## Ops

Compose project: `apzqep-greenbone` — see `infrastructure/docker/clusters/greenbone/`.
