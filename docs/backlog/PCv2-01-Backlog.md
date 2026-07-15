# PCv2-01 — Production Readiness & Operational Hardening Backlog

> **Sprint:** PCv2-01  
> **Story prefix:** PRH-  
> **Mode:** Planning complete — **await owner approval before PRH-001**  
> **Authority:** [PCv2-01 Sprint Guide](../sprint/PCv2-01-Production-Readiness-Sprint-Guide.md)

---

## Development workflow

```text
Sprint guide approval (owner)
        ↓
PRH-001 Architecture & ADR
        ↓
Security hardening stories (PRH-002–007)
        ↓
Bootstrap & guard stories (PRH-008–009)
        ↓
Operations & documentation (PRH-010–016)
        ↓
Verification & closeout (PRH-017–018)
```

**Rule:** Complete one story before beginning the next unless explicitly parallelised.

### Effort scale

| Label | Estimate |
|-------|----------|
| S | 0.5–1 day |
| M | 1–2 days |
| L | 2–3 days |
| XL | 3–5 days |

---

## Suggested implementation order

```text
PRH-001 → PRH-002 → PRH-003 → PRH-004 → PRH-005 → PRH-006 → PRH-007
    → PRH-008 → PRH-009 → PRH-010 → PRH-011 → PRH-012 → PRH-013 → PRH-014
    → PRH-015 → PRH-016 → PRH-017 → PRH-018
```

---

## PRH-001 — Architecture & ADR

| Field | Value |
|-------|-------|
| **Objective** | Authorise PCv2-01 through ADR and target architecture acceptance |
| **Acceptance criteria** | ADR-0046 accepted; PCv2-01 architecture reviewed; open questions resolved |
| **Dependencies** | PCv2-01 planning package; PCS-001 approval |
| **Estimated effort** | M |
| **Risk** | Low — documentation gate |
| **Testing** | N/A |
| **Documentation** | ADR-0046; update `docs/README.md` ADR index |

---

## PRH-002 — CSP audit & enforcement

| Field | Value |
|-------|-------|
| **Objective** | Audit inline scripts/styles; enforce CSP in production |
| **Acceptance criteria** | CSP Report-Only removed in prod; enforced policy documented; no console CSP violations on core flows; violation endpoint live |
| **Dependencies** | PRH-001 |
| **Estimated effort** | L |
| **Risk** | **High** — Next.js inline script compatibility (R-PRH-01) |
| **Testing** | Unit tests for CSP builder; Playwright smoke on login/shell/workbench |
| **Documentation** | CSP policy table in Security Operations Guide |

**Scope:** `apps/web`, `apps/law-platform`; `POST /api/platform/v1/security/csp-report`.

---

## PRH-003 — Security headers hardening

| Field | Value |
|-------|-------|
| **Objective** | Align headers across apps with `@apzhub/platform-security` posture |
| **Acceptance criteria** | All mandated headers present; `Cross-Origin-Opener-Policy` / `Cross-Origin-Resource-Policy` evaluated; header diagnostics match reality |
| **Dependencies** | PRH-001 |
| **Estimated effort** | S |
| **Risk** | Low |
| **Testing** | Header integration tests per app |
| **Documentation** | Update Security Reference Architecture header table |

---

## PRH-004 — Secrets & environment validation hardening

| Field | Value |
|-------|-------|
| **Objective** | Fail closed on weak/missing production secrets; tiered dev validation |
| **Acceptance criteria** | Production startup aborts on validation fail; dev warns only; no secrets in logs; `BETTER_AUTH_SECRET` length enforced |
| **Dependencies** | PRH-001 |
| **Estimated effort** | M |
| **Risk** | Medium — dev friction (R-PRH-07) |
| **Testing** | Unit tests for `EnvironmentValidationService` tiers |
| **Documentation** | Production Deployment Guide env section |

**Note:** Vault integration is **PCv2-04** — env vars remain authoritative in PCv2-01.

---

## PRH-005 — Rate limiting expansion

| Field | Value |
|-------|-------|
| **Objective** | Apply rate limits to auth and privileged platform API routes |
| **Acceptance criteria** | Login/register/password routes limited; `/api/platform/v1/*` guarded; 429 + `X-RateLimit-*` headers; Redis backend when available |
| **Dependencies** | PRH-004 |
| **Estimated effort** | M |
| **Risk** | Medium — false positives (R-PRH-02) |
| **Testing** | Unit tests for limiter; integration test 429 path |
| **Documentation** | Security Operations Guide rate limit section |

**Out of scope:** Dedicated API gateway (PCv2-09). Optional Caddy edge config documented in PRH-012 only.

---

## PRH-006 — Session hardening

| Field | Value |
|-------|-------|
| **Objective** | Harden Better Auth session configuration for production |
| **Acceptance criteria** | Secure cookie flags in prod; session expiry documented; `ALLOW_DEV_REGISTRATION` blocked in prod; session fixation mitigations reviewed |
| **Dependencies** | PRH-004 |
| **Estimated effort** | M |
| **Risk** | Medium |
| **Testing** | Auth session unit tests; cookie attribute inspection in E2E |
| **Documentation** | IAM quick reference update; deployment guide |

---

## PRH-007 — Tenant validation & RLS audit

| Field | Value |
|-------|-------|
| **Objective** | Verify tenant context on APIs; add RLS integration tests |
| **Acceptance criteria** | ALS/session tenant wired on all law API routes (TD-P09); cross-tenant read/write denied in tests (TD-P10); platform API guard audit 100% |
| **Dependencies** | PRH-006 |
| **Estimated effort** | L |
| **Risk** | Medium — test flakiness (R-PRH-04) |
| **Testing** | **Mandatory** RLS integration suite; platform API guard contract tests |
| **Documentation** | Tenant Architecture addendum; test runbook |

---

## PRH-008 — App bootstrap consolidation

| Field | Value |
|-------|-------|
| **Objective** | Extract shared bootstrap from `web` and `law-platform` into platform package |
| **Acceptance criteria** | `@apzhub/platform-bootstrap` (or equivalent); both apps use shared `ensurePlatformReady`; TD-M16-C01 closed; parity tests pass |
| **Dependencies** | PRH-001 |
| **Estimated effort** | L |
| **Risk** | **High** — dual-app drift (R-PRH-03) |
| **Testing** | Parity tests; existing hydration tests still pass |
| **Documentation** | Runtime Development Guide update |

**Includes:** `runtime-init`, hydration orchestration helpers, shared health loader patterns.

---

## PRH-009 — Platform API guard consistency audit

| Field | Value |
|-------|-------|
| **Objective** | Ensure all privileged `/api/platform/v1/*` routes use `requirePlatformSession` / `requirePlatformPermission` |
| **Acceptance criteria** | Audit checklist complete; gaps fixed; 401/403 standard envelope on all routes |
| **Dependencies** | PRH-007 |
| **Estimated effort** | M |
| **Risk** | Low |
| **Testing** | API contract tests for 401/403 paths |
| **Documentation** | API Framework compliance note in architecture doc |

---

## PRH-010 — Operations diagnostics enhancement

| Field | Value |
|-------|-------|
| **Objective** | Extend consolidated diagnostics for production operators |
| **Acceptance criteria** | Operations summary includes CSP mode, rate limit backend, env validation tier, bootstrap package version; Health section shows bootstrap parity |
| **Dependencies** | PRH-008 |
| **Estimated effort** | M |
| **Risk** | Low |
| **Testing** | Diagnostics API snapshot tests |
| **Documentation** | Security Diagnostics Guide update |

---

## PRH-011 — Incident handling & recovery guides

| Field | Value |
|-------|-------|
| **Objective** | Update incident and recovery documentation for PCv2-01 posture |
| **Acceptance criteria** | Incident Response Guide covers CSP violations, rate limit floods, env validation failures; Disaster Recovery Overview references new checklists |
| **Dependencies** | PRH-002, PRH-005, PRH-010 |
| **Estimated effort** | S |
| **Risk** | Low |
| **Testing** | N/A — doc review |
| **Documentation** | `APZHUB-Incident-Response-Guide.md`, `APZHUB-Disaster-Recovery-Overview.md` |

---

## PRH-012 — Production deployment guide

| Field | Value |
|-------|-------|
| **Objective** | Publish definitive self-hosted production deployment guide |
| **Acceptance criteria** | Covers PostgreSQL, Redis, Caddy, env vars, migrations, health probes, ports (`ENVIRONMENT.md` aligned); staging + production profiles |
| **Dependencies** | PRH-004, PRH-008 |
| **Estimated effort** | M |
| **Risk** | Medium — doc drift (R-PRH-08) |
| **Testing** | Staging deploy walkthrough (manual acceptance) |
| **Documentation** | `docs/governance/APZHUB-Production-Deployment-Guide.md` |

---

## PRH-013 — Upgrade & rollback strategy

| Field | Value |
|-------|-------|
| **Objective** | Document version upgrade and rollback procedures |
| **Acceptance criteria** | Migration order documented; rollback steps for failed migration; backup before upgrade; correlation with Drizzle journal |
| **Dependencies** | PRH-012 |
| **Estimated effort** | M |
| **Risk** | Medium |
| **Testing** | Rollback drill on staging (manual) |
| **Documentation** | `docs/governance/APZHUB-Platform-Upgrade-Rollback-Guide.md` |

---

## PRH-014 — Production operations checklist

| Field | Value |
|-------|-------|
| **Objective** | Operator sign-off checklist before production traffic |
| **Acceptance criteria** | Checklist covers security, health, readiness, env, backups, rate limits, CSP, RLS tests, diagnostics |
| **Dependencies** | PRH-011, PRH-012, PRH-013 |
| **Estimated effort** | S |
| **Risk** | Low |
| **Testing** | Checklist validated against staging |
| **Documentation** | `docs/governance/APZHUB-Production-Operations-Checklist.md` |

---

## PRH-015 — Commercial readiness foundation

| Field | Value |
|-------|-------|
| **Objective** | Design tenant onboarding flow and monitoring hooks (not full provisioning) |
| **Acceptance criteria** | Tenant onboarding design doc; monitoring hook points in health/diagnostics; governance enablement sequence documented for pilot |
| **Dependencies** | PRH-010 |
| **Estimated effort** | M |
| **Risk** | Low — design only; scope creep to PCv2-03 |
| **Testing** | N/A |
| **Documentation** | `docs/architecture/APZHUB-Tenant-Onboarding-Design.md` (new) |

**Out of scope:** Billing, licensing, automated SaaS signup (PCv2-03, PCv2-10).

---

## PRH-016 — Audit completeness review

| Field | Value |
|-------|-------|
| **Objective** | Verify platform and framework audit coverage for production |
| **Acceptance criteria** | Audit gap report; critical paths (auth, authz, tenant, admin) emit audit signals; Operations Console audit section accurate |
| **Dependencies** | PRH-009 |
| **Estimated effort** | M |
| **Risk** | Low |
| **Testing** | Audit event contract tests |
| **Documentation** | Audit gap report in completion doc |

---

## PRH-017 — Production smoke E2E tests

| Field | Value |
|-------|-------|
| **Objective** | Playwright production smoke suite for critical paths |
| **Acceptance criteria** | Smoke covers login, shell render, health API, platform diagnostics (admin), law home; runs locally; CI wiring deferred to M17 |
| **Dependencies** | PRH-002–009 |
| **Estimated effort** | L |
| **Risk** | Medium — TD-T04 (CI not green until M17) |
| **Testing** | `testing/e2e/production-smoke/` |
| **Documentation** | Testing guide addendum |

---

## PRH-018 — Readiness review & sprint closeout

| Field | Value |
|-------|-------|
| **Objective** | Formal PCv2-01 closeout and handoff to PCv2-02 |
| **Acceptance criteria** | All PRH stories complete; quality gates green; completion report; readiness review updated; debt register updated |
| **Dependencies** | PRH-001–017 |
| **Estimated effort** | S |
| **Risk** | Low |
| **Testing** | Full quality gate run |
| **Documentation** | `docs/sprint/PCv2-01-completion-report.md`; update `CHANGELOG.md`, indexes |

---

## Story summary

| ID | Title | Effort | Risk |
|----|-------|--------|------|
| PRH-001 | Architecture & ADR | M | Low |
| PRH-002 | CSP audit & enforcement | L | High |
| PRH-003 | Security headers | S | Low |
| PRH-004 | Secrets & env validation | M | Medium |
| PRH-005 | Rate limiting expansion | M | Medium |
| PRH-006 | Session hardening | M | Medium |
| PRH-007 | Tenant validation & RLS | L | Medium |
| PRH-008 | Bootstrap consolidation | L | High |
| PRH-009 | API guard audit | M | Low |
| PRH-010 | Diagnostics enhancement | M | Low |
| PRH-011 | Incident & recovery guides | S | Low |
| PRH-012 | Deployment guide | M | Medium |
| PRH-013 | Upgrade & rollback | M | Medium |
| PRH-014 | Production checklist | S | Low |
| PRH-015 | Commercial readiness design | M | Low |
| PRH-016 | Audit completeness | M | Low |
| PRH-017 | Production smoke E2E | L | Medium |
| PRH-018 | Closeout | S | Low |

**Estimated total:** ~18–25 engineering days (single engineer, sequential).

---

## Explicitly excluded stories

| Story | Reason | Target |
|-------|--------|--------|
| Outbox worker service | Out of PCv2-01 scope | PCv2-02 |
| Event replay / DLQ | Out of scope | PCv2-02 |
| GitHub Actions CI | Owner sequencing | M17 |
| Vault adapter | Out of scope | PCv2-04 |
| API Gateway service | Out of scope | PCv2-09 |
| Prometheus/Grafana | Out of scope | PCv2-07 |
| Plane/Kimai integration | Out of scope | OSS Wave 1 post-M17 |
