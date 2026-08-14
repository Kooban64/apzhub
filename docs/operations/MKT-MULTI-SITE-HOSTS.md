# Multi-site marketing hosts — APZHUB / APZQA / APZPenTest

| Field  | Value                                               |
| ------ | --------------------------------------------------- |
| Status | **DOCUMENTED** 2026-08-10                           |
| App    | `@apzhub/web` on `:3300` (existing APZHUB bring-up) |

## Public hostnames

| Hostname                         | Brand                  | Internal routes                      |
| -------------------------------- | ---------------------- | ------------------------------------ |
| `apzhub.apzportal.apzor.com`     | Hub (outcome homepage) | `/`, `/services`, `/productivity`, … |
| `apzqa.apzportal.apzor.com`      | APZQA                  | rewritten → `/qa…`                   |
| `apzqep.apzportal.apzor.com`     | APZQA alias            | rewritten → `/qa…`                   |
| `apzpentest.apzportal.apzor.com` | APZPenTest             | rewritten → `/pentest…`              |

Path preview on the hub host (no DNS required): `/qa`, `/pentest`, `/productivity`.

## Product packaging

Aligned to [APZOR Commercial Pillars](../strategy/APZOR-COMMERCIAL-PILLARS.md):

| Commercial pillar   | Marketing host / path   | Catalogue id (today) | Notes                                   |
| ------------------- | ----------------------- | -------------------- | --------------------------------------- |
| **APZQEP**          | APZQA / APZQEP → `/qa`  | `qa`                 | Quality Engineering — not TCMS-only     |
| **APZPEN**          | APZPenTest → `/pentest` | `pentest`            | Security assurance + engagements        |
| **APZPRD**          | `/productivity`         | `productivity`       | **Composable** — never force full suite |
| Platform (internal) | APZHUB hub              | —                    | Not the sellable product                |

Do **not** spin four productivity brand hosts now — one suite page (`/productivity`) with entitlement-assembled experience per [APZPRD vision](../strategy/APZPRD-ENTERPRISE-PRODUCTIVITY-PLATFORM.md).

## Nginx (ops)

Point new A/AAAA (or wildcard) names at the same host, TLS terminate, proxy to `127.0.0.1:3300` like `05-apzhub-platform.conf`. Middleware host rewrite handles brand routing; Better Auth `APP_URL` / trusted origins must include each public host when enabled.

## Coexistence

Legacy `apz-stack` wildcard remains on `:8080`. Only dedicate the four names above (plus existing `apzhub`) to APZHUB `:3300` when DNS/certs are ready.
