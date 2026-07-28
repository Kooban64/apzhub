# Security Review — Platform 1.2.0

> **Programme:** APZHUB-OPS-001  
> **Status:** **PARTIAL**

## Controls present

| Area                   | Evidence                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| Authentication         | Better Auth (`BETTER_AUTH_*`) · `@apzhub/auth`                                             |
| Authorization          | `AUTHORIZATION_PROVIDER_MODE` — must be **`production`** in prod (dev default `allow-all`) |
| Session management     | Better Auth + Redis session patterns; ops runbook `redis-session-storm.md`                 |
| Secret storage         | Env-based; `.env` gitignored; SECURITY-OPERATIONS forbids secrets in tickets/logs          |
| Security headers / CSP | `@apzhub/platform-security`                                                                |
| TLS policy             | Ops mandate edge TLS; host nginx provides TLS for legacy stack                             |
| Health public surface  | `/api/health` intentionally public for probes                                              |

## Gaps

| Gap                                                                    | Severity       |
| ---------------------------------------------------------------------- | -------------- |
| Prod AuthZ / registration defaults if `.env.example` copied blindly    | **High**       |
| No Dependabot / CodeQL / Trivy / `pnpm audit` in CI evidence           | Medium         |
| APZHUB prod Caddyfile lacks TLS host configuration                     | High (cutover) |
| Legacy `apzpg` exposed `0.0.0.0:54333` on shared host (ENVIRONMENT.md) | Medium (host)  |
| OWASP ASVS-style formal attestation not filed for this cutover         | Medium         |

## Before production

1. Issue production secrets (≥32-char `BETTER_AUTH_SECRET`); never reuse example values.
2. Set `AUTHORIZATION_PROVIDER_MODE=production`; disable `ALLOW_DEV_REGISTRATION`.
3. Terminate TLS at approved edge; verify security headers on gateway responses.
4. Confirm no secrets in repo, logs, or compose files.
5. Session invalidate/rotate procedure known to on-call.
