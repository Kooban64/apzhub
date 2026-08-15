# SPR-ADOPT-002 — Friction log

| Field  | Value                                                                             |
| ------ | --------------------------------------------------------------------------------- |
| Sprint | [SPR-ADOPT-002](../../sprint/SPR-ADOPT-002-commercial-pillar-operator-dogfood.md) |
| Status | **CLOSED** (pass complete)                                                        |
| Date   | 2026-08-15                                                                        |

| ID          | Severity | Pillar | Friction                                                                        | Disposition                                                              |
| ----------- | -------- | ------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| ADOPT-002-1 | Blocker  | Host   | Web not listening on :3300 → Caddy 502                                          | Ops: start `pnpm --filter @apzhub/web dev` (no production build on host) |
| ADOPT-002-2 | Blocker  | APZPEN | Turbopack could not resolve Faraday/Greenbone `*.js` imports → API 500s         | **Fixed** — extensionless imports + transpilePackages                    |
| ADOPT-002-3 | Blocker  | APZPRD | `@apzhub/config/governance/plane-config-diagnostics` deep import unresolved     | **Fixed** — import `@apzhub/config/governance`                           |
| ADOPT-002-4 | High     | All    | Classic `dev@apzhub.local` had org subscriptions but **no user product grants** | **Fixed** — org console grants + `ensure-demo-personas` seeds grants     |
| ADOPT-002-5 | Medium   | APZPRD | Projects list returned CONFIGURATION_ERROR 500 when Plane adapter disabled      | **Fixed** — empty collection when adapter not configured                 |
| ADOPT-002-6 | Low      | Host   | Plane adapter disabled on this host → empty project list                        | Expected ops config; documented in APZPRD operator guide                 |
| ADOPT-002-7 | Info     | Auth   | Authentik containers still running (legacy coexistence)                         | Untouched — BetterAuth-only for APZHUB; retire still not Owner GO        |
