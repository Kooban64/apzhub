# SPR-ADOPT-002 — Evidence

| Field     | Value                                                     |
| --------- | --------------------------------------------------------- |
| Timestamp | 2026-08-15T11:00Z                                         |
| Host      | apz-portal coexistence host                               |
| AuthN     | BetterAuth (`dev@apzhub.local`)                           |
| Authentik | Containers left running; **not** used for APZHUB journeys |

## Host posture

| Check                       | Result                                     |
| --------------------------- | ------------------------------------------ |
| `GET /api/health` (:3300)   | healthy (DB/Redis/runtime) after web start |
| Caddy `:3080/api/health`    | 200 once web listening                     |
| BetterAuth sign-in/email    | 200 — session issued                       |
| Authentik docker containers | Still Up — untouched                       |

## Pillar probes (after fixes + grants)

| Probe                                                 | HTTP | Notes                                                                    |
| ----------------------------------------------------- | ---- | ------------------------------------------------------------------------ |
| `GET /api/v1/projects/health`                         | 200  | `authN=betterauth`, `authentikUsed=false`, Plane disabled                |
| `GET /api/v1/projects`                                | 200  | Empty list when adapter disabled (no 500)                                |
| `GET /api/v1/apzpen/engagements`                      | 200  | List OK                                                                  |
| `POST /api/v1/apzpen/engagements`                     | 200  | Created `ADOPT-002 dogfood engagement`                                   |
| `GET /api/v1/apzpen/providers/health`                 | 200  | Greenbone/MobSF ok; Faraday artefact path honesty                        |
| `GET /api/v1/qep/security-assurance`                  | 200  | Dual entitlement; status `unavailable` (no engagement link yet) — honest |
| `GET /api/v1/qep/mcp`                                 | 200  | Tool catalogue                                                           |
| `GET /api/v1/qep/knowledge` / `risk` / `integrations` | 200  | Empty ledgers OK                                                         |
| `GET /api/v1/qep/continuous-verification/signals`     | 200  | Empty signals                                                            |
| `GET /api/v1/qep/continuous-cert/signals`             | 200  | Empty signals                                                            |

## Code / config fixes landed

1. Faraday + Greenbone extensionless relative imports (Turbopack).
2. `transpilePackages` + `serverExternalPackages` for integrations / drizzle-orm.
3. Projects health handler imports `@apzhub/config/governance`.
4. Classic dogfood user product grants in `ensure-demo-personas`.
5. Projects list soft-empty when Plane not configured.
6. Direct `drizzle-orm` dependency on `@apzhub/web`.

## Tests

`vitest`: faraday export-client, greenbone gmp-client, projects engine-health-payload — **7/7 passed**.
