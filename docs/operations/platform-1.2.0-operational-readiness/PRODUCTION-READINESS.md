# Production Readiness — Platform 1.2.0

> **Programme:** APZHUB-OPS-001  
> **Date:** 2026-07-22

## Overall classification

# PRODUCTION READY WITH ACTIONS

## What prevents immediate production deployment

1. **Deployable application artefact missing** — no Dockerfile; prod compose has no `web` service.
2. **Edge TLS / hostname configuration incomplete** in `Caddyfile.prod`.
3. **Production environment hardening not evidenced** for the cutover target (secrets, AuthZ `production`, registration off).
4. **Scheduled platform PostgreSQL backup on production path not evidenced**.
5. **On-call ownership** for P1/P2 manual triage not confirmed in this assessment.
6. **Shared-host capacity/coexistence** requires live audit + Owner Change gate immediately before cutover.

## Must complete before production

| #   | Action                                                                                                               | Owner class           |
| --- | -------------------------------------------------------------------------------------------------------------------- | --------------------- |
| A1  | Build/publish app image (or Owner-approved deploy method) and wire into prod topology with Caddy upstream            | Operations / Release  |
| A2  | Configure production TLS hostnames at approved edge                                                                  | Operations            |
| A3  | Production env: secrets, `AUTHORIZATION_PROVIDER_MODE=production`, disable dev registration, postgres entity mapping | Operations / Security |
| A4  | Enable/verify automated platform PG backup; staging/prod restore drill under Change                                  | Operations            |
| A5  | Live host coexistence audit + disk headroom check                                                                    | Operations            |
| A6  | Assign on-call to alert catalogue; walk P1 runbooks                                                                  | Support               |
| A7  | File Change + rollback plan; run `pnpm test:production-smoke` post-deploy                                            | Release               |
| A8  | Owner sign-off on PRWL marketing constraints; keep Workflow Execute gated                                            | Owner                 |

## May safely complete after production

| #   | Item                                                                                             |
| --- | ------------------------------------------------------------------------------------------------ |
| B1  | CD pipeline automation                                                                           |
| B2  | Dependency/CVE scanning in CI (Dependabot/CodeQL/Trivy/`pnpm audit`)                             |
| B3  | Live Observe alert evaluation/delivery (new programme; PL12-KL-02)                               |
| B4  | Formal performance SLO baseline programme                                                        |
| B5  | Align remaining ops docs still citing 1.1.0 → 1.2.0                                              |
| B6  | Email SoR · FIN-001 · Search live drain GA · Support realtime — **only** with new Owner Approval |
| B7  | ENVIRONMENT.md production status refresh after cutover                                           |

## Explicitly not required / not authorised for cutover

- Platform 1.3
- Architecture redesign
- Engineering remediation of certification flaky tests
- Unlocking Workflow Execute
- Implementing Email SoR or FIN-001

## Follow-on

**APZHUB-OPS-002** implemented actions A1–A8 in-repository. See [platform-1.2.0-production-readiness](../platform-1.2.0-production-readiness/README.md).
