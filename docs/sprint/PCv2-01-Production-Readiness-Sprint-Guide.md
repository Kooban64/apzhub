# PCv2-01 — Production Readiness & Operational Hardening Sprint Guide

> **Sprint:** PCv2-01  
> **Phase:** Platform Core v2 — Phase 1  
> **Status:** **Planning complete** — await owner approval before implementation  
> **Authority:** [PCS-001 Owner Approval](../strategy/PCS-001-owner-approval.md) · [Platform Core v2 Roadmap](../roadmap/APZHUB-Platform-Core-v2-Roadmap.md) · [PC-001 Certification](../reviews/APZHUB-Platform-Core-Certification.md)

---

## Initiative

**Production Readiness & Operational Hardening** closes the highest-risk gaps between Platform Core v1.0 certification and supervised pilot deployment. This sprint strengthens security posture, operational diagnostics, tenant isolation verification, and deployment documentation — **without** implementing workers, dedicated API gateway, Vault, SOC/SIEM, HA, commercial licensing, or OSS integrations.

Owner-approved sequencing places **PCv2-02 (Workers)** and **M17 (CI/CD)** immediately after PCv2-01. This sprint prepares the platform for those milestones; it does not deliver them.

---

## Objectives

1. **Security hardening** — move CSP from Report-Only to enforced (post-audit); strengthen headers, secrets validation, rate limiting, session posture, and tenant validation.
2. **Operational maturity** — extend health/readiness/recovery flows; consolidate diagnostics; publish incident handling guidance.
3. **Deployment readiness** — single-source app bootstrap; production deployment guide; upgrade/rollback strategy; production checklist.
4. **Isolation assurance** — RLS and tenant-context integration tests across platform and law schemas.
5. **Commercial foundation** — tenant onboarding design and monitoring hooks (not full commercial provisioning — PCv2-03).
6. **Quality** — all quality gates green; no regression against PC-001 certification criteria.

---

## Scope

### In scope

| Area                       | Deliverables                                                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Security**               | CSP enforcement, header posture, env/secrets validation, app-level rate limits, session hardening, API guard audit, tenant validation |
| **Operations**             | Health/readiness/liveness enhancement, recovery guidance, consolidated diagnostics, incident runbook updates                          |
| **Infrastructure (light)** | Caddy edge rate-limit **configuration** (not gateway service); env validation; bootstrap package                                      |
| **Platform**               | Audit completeness review; commercial readiness hooks; tenant onboarding **design**                                                   |
| **Documentation**          | Deployment guide, operations guide updates, production checklist, upgrade/rollback strategy                                           |
| **Testing**                | RLS integration tests; production smoke E2E; security header tests                                                                    |

### Out of scope (explicit)

| Item                                               | Deferred to                                  |
| -------------------------------------------------- | -------------------------------------------- |
| Background workers & outbox processing             | **PCv2-02**                                  |
| Outbox queues (implementation)                     | **PCv2-02**                                  |
| Dedicated API Gateway service                      | **PCv2-09**                                  |
| Vault / external secret manager                    | **PCv2-04**                                  |
| SOC/SIEM integration                               | **PCv2-05**                                  |
| High availability & DR automation                  | **PCv2-06**                                  |
| Full observability stack (Prometheus/Grafana/Loki) | **PCv2-07**                                  |
| Commercial licensing & metering                    | **PCv2-10**                                  |
| Commercial provisioning workflows                  | **PCv2-03**                                  |
| GitHub Actions CI pipeline (full)                  | **M17** (after PCv2-02 per owner sequencing) |
| Financial Engine extraction                        | **FIN-002+** (not approved)                  |
| Banking, Exchange, new verticals                   | Not approved                                 |
| OSS integrations (Plane, Kimai, etc.)              | Post-M17 waves                               |

### Planning dependencies (reference only)

PCv2-01 architecture must **not block** PCv2-02 workers or M17 CI. Interfaces and bootstrap patterns must accommodate future worker processes and pipeline stages without redesign.

---

## Success criteria

| #     | Criterion                                                                      | Verification                                                     |
| ----- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| SC-01 | CSP enforced in production (`Content-Security-Policy`, not Report-Only)        | Header inspection; CSP unit/integration tests                    |
| SC-02 | CSP violation reporting endpoint operational                                   | `POST /api/platform/v1/security/csp-report` receives reports     |
| SC-03 | Security headers complete on web + law-platform                                | XFO, XCTO, Referrer-Policy, HSTS (prod), Permissions-Policy, CSP |
| SC-04 | Environment validation fails closed on missing/weak secrets                    | `EnvironmentValidationService` + startup guard                   |
| SC-05 | Rate limiting on auth and privileged platform API routes                       | 429 responses; `X-RateLimit-*` headers                           |
| SC-06 | Session hardening documented and enforced (cookie flags, expiry)               | Auth config review + tests                                       |
| SC-07 | Tenant validation on all platform API routes carrying tenant context           | Guard audit checklist 100%                                       |
| SC-08 | RLS integration tests pass (cross-tenant denial)                               | New integration test suite                                       |
| SC-09 | Shared `@apzhub/platform-bootstrap` (or equivalent) used by web + law-platform | TD-M16-C01 closed                                                |
| SC-10 | Production deployment guide published                                          | `docs/governance/`                                               |
| SC-11 | Production checklist published                                                 | Operator sign-off document                                       |
| SC-12 | Upgrade and rollback strategy documented                                       | Versioned migration runbook                                      |
| SC-13 | Incident handling guide updated for PCv2-01 posture                            | M8-06 guide extended                                             |
| SC-14 | All quality gates green                                                        | lint, typecheck, build, test, coverage ≥80%                      |
| SC-15 | PCv2-01 readiness review **READY** or **READY WITH OBSERVATIONS**              | Owner gate                                                       |

---

## Dependencies

### Prerequisites (met)

| Dependency                          | Status                         |
| ----------------------------------- | ------------------------------ |
| PC-001 Platform Core Certification  | ✅ CERTIFIED WITH OBSERVATIONS |
| PCS-001 Strategy approved           | ✅ Owner approved 2026-07-08   |
| M8-06 Security & Resilience         | ✅ Complete                    |
| `@apzhub/platform-security` package | ✅ Delivered                   |

### External dependencies

| Dependency  | Required for      | PCv2-01 action                                  |
| ----------- | ----------------- | ----------------------------------------------- |
| PostgreSQL  | RLS tests         | Test database in CI (M17); local docker for dev |
| Redis       | Rate limiting     | Existing `REDIS_URL`                            |
| Caddy       | Edge rate limits  | Config documentation only                       |
| Better Auth | Session hardening | Config review                                   |

### Downstream dependencies (PCv2-01 must enable)

| Milestone           | What PCv2-01 provides                                           |
| ------------------- | --------------------------------------------------------------- |
| **PCv2-02 Workers** | Stable bootstrap, health probes, env validation, audit patterns |
| **M17 CI/CD**       | Production checklist, smoke tests, documented gates             |
| **OSS Wave 1**      | Hardened security and ops baseline                              |

---

## Deliverables

| #    | Deliverable                          | Location                                                         |
| ---- | ------------------------------------ | ---------------------------------------------------------------- |
| D-01 | Sprint guide (this document)         | `docs/sprint/PCv2-01-Production-Readiness-Sprint-Guide.md`       |
| D-02 | Engineering backlog                  | `docs/backlog/PCv2-01-Backlog.md`                                |
| D-03 | Target architecture                  | `docs/architecture/PCv2-01-Production-Readiness-Architecture.md` |
| D-04 | Readiness review                     | `docs/reviews/PCv2-01-Readiness-Review.md`                       |
| D-05 | ADR-0046 (proposed)                  | CSP enforcement & production security posture                    |
| D-06 | Shared bootstrap package             | `packages/platform-bootstrap/` (implementation)                  |
| D-07 | CSP enforcement + violation endpoint | apps/web, apps/law-platform                                      |
| D-08 | RLS integration test suite           | `testing/integration/`                                           |
| D-09 | Production Deployment Guide          | `docs/governance/APZHUB-Production-Deployment-Guide.md`          |
| D-10 | Production Operations Checklist      | `docs/governance/APZHUB-Production-Operations-Checklist.md`      |
| D-11 | Upgrade & Rollback Guide             | `docs/governance/APZHUB-Platform-Upgrade-Rollback-Guide.md`      |
| D-12 | PCv2-01 completion report            | `docs/sprint/PCv2-01-completion-report.md`                       |

---

## Architecture references

| Document                                                                                                       | Relevance                              |
| -------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| [Platform Core Reference Architecture](../architecture/APZHUB-Platform-Core-Reference-Architecture.md)         | Canonical layers                       |
| [Platform Security Reference Architecture](../architecture/APZHUB-Platform-Security-Reference-Architecture.md) | M8-06 security baseline                |
| [Operational Resilience Architecture](../architecture/APZHUB-Operational-Resilience-Architecture.md)           | Health/readiness/recovery              |
| [PCv2-01 Production Readiness Architecture](../architecture/PCv2-01-Production-Readiness-Architecture.md)      | Target state                           |
| [Document 013 — Security](../013-security-architecture-zero-trust-framework.md)                                | Zero Trust                             |
| [Document 014 — Observability](../014-observability-monitoring-telemetry-health-framework.md)                  | Health hierarchy                       |
| [Document 015 — Quality](../015-software-quality-testing-qa-cicd-release-management-framework.md)              | Quality gates                          |
| [Technical Debt Register](../architecture/APZHUB-Platform-Technical-Debt-Register.md)                          | TD-M16-C01, TD-P09, TD-P10, TD-M16-M02 |

---

## Story prefix

Engineering stories use prefix **PRH-** (Production Readiness Hardening): `PRH-001` through `PRH-018`.

See [PCv2-01 Backlog](../backlog/PCv2-01-Backlog.md).

---

## Risk assessment

| ID       | Risk                                          | Likelihood | Impact | Mitigation                                                         |
| -------- | --------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------ |
| R-PRH-01 | CSP enforcement breaks Next.js inline scripts | High       | High   | PRH-002 dedicated audit; staged enforce; violation reporting first |
| R-PRH-02 | Rate limiting blocks legitimate traffic       | Medium     | Medium | Conservative defaults; ops tuning docs; Redis fallback             |
| R-PRH-03 | Bootstrap consolidation causes app drift      | Medium     | High   | Parity tests web vs law-platform; incremental extraction           |
| R-PRH-04 | RLS tests flaky in CI                         | Medium     | Medium | Dedicated test DB; isolate tenants; defer full CI to M17           |
| R-PRH-05 | Scope creep into workers/gateway              | Medium     | High   | Sprint guide out-of-scope list; story review gate                  |
| R-PRH-06 | CSP blocks law-platform Swagger/third-party   | Medium     | Medium | Per-app CSP profiles documented in ADR                             |
| R-PRH-07 | Secrets validation blocks dev environments    | Low        | Medium | `NODE_ENV`-aware validation tiers                                  |
| R-PRH-08 | Production docs diverge from reality          | Medium     | Medium | Checklist verified against staging deploy                          |

---

## Quality gates

Every PRH story must pass before merge:

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test
pnpm test:coverage   # ≥80% maintained
```

Additional gates for PCv2-01 closeout:

- RLS integration tests pass locally
- Production smoke Playwright suite pass locally (CI in M17)
- Security header regression tests pass
- No new critical/high debt without register entry

---

## Implementation constraints

1. **No Platform Core redesign** — extend M8 packages; do not replace IAM, Workbench, or Runtime.
2. **No product business logic** — law-platform receives hardening only.
3. **Manifest-first** — new platform surfaces follow SDK patterns.
4. **Self-hosted first** — no cloud-only dependencies.
5. **Coexistence** — do not disrupt legacy `apz-stack` (see `ENVIRONMENT.md`).

---

## Stop conditions

### Planning stop (this milestone)

Stop when D-01 through D-04 are complete and quality gates pass with **no code changes**.

**Status:** Planning package complete — await owner approval before PRH-001.

### Implementation stop (future)

Stop after PCv2-01 completion report accepted. Do **not** begin PCv2-02 until owner approves.

---

## Recommended execution order

```text
PRH-001 Architecture & ADR
    ↓
PRH-002 CSP audit → PRH-003 Headers → PRH-004 Secrets/env
    ↓
PRH-005 Rate limiting → PRH-006 Session → PRH-007 Tenant/RLS
    ↓
PRH-008 Bootstrap package → PRH-009 API guard audit
    ↓
PRH-010 Diagnostics → PRH-011 Incident/recovery docs
    ↓
PRH-012 Deployment guide → PRH-013 Upgrade/rollback → PRH-014 Checklist
    ↓
PRH-015 Commercial readiness hooks → PRH-016 Audit review
    ↓
PRH-017 E2E smoke → PRH-018 Readiness review & closeout
```

---

## Approvals required

| Gate                         | Approver     | Status                                           |
| ---------------------------- | ------------ | ------------------------------------------------ |
| PCv2-01 planning package     | Owner        | ✅ Complete — **awaiting sprint guide approval** |
| PCv2-01 sprint guide         | Owner        | ⏳ Awaiting                                      |
| PRH-001 ADR-0046             | Architecture | Pending implementation                           |
| PCv2-01 implementation start | Owner        | ⏳ After sprint guide approval                   |
| PCv2-02 start                | Owner        | After PCv2-01 closeout                           |

---

## References

- [PCv2-01 Backlog](../backlog/PCv2-01-Backlog.md)
- [PCv2-01 Architecture](../architecture/PCv2-01-Production-Readiness-Architecture.md)
- [PCv2-01 Readiness Review](../reviews/PCv2-01-Readiness-Review.md)
- [PCS-001 Owner Approval](../strategy/PCS-001-owner-approval.md)
