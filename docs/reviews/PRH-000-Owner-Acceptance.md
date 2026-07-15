# PRH-000 — Owner Acceptance

> **Milestone:** PRH-000 — Production Readiness Acceptance  
> **Sprint:** PCv2-01 — Production Readiness & Operational Hardening  
> **Type:** Governance — **no implementation**  
> **Authority:** [PCS-001 Owner Approval](../strategy/PCS-001-owner-approval.md) · [PCv2-01 Readiness Review](./PCv2-01-Readiness-Review.md)

---

## Approval

| Field | Value |
|-------|-------|
| **Approval date** | 2026-07-08 |
| **Approver** | Owner |
| **Decision** | **APPROVED** — PCv2-01 sprint authorised for implementation |
| **Planning verdict** | READY WITH OBSERVATIONS (accepted) |
| **First implementation story** | PRH-001 — Architecture & ADR |

This document is the **contractual baseline** for PCv2-01. Implementation must conform to the frozen baseline in [PRH-000 Implementation Baseline](./PRH-000-Implementation-Baseline.md). Scope changes require a new owner acceptance.

---

## Scope accepted

The owner accepts the PCv2-01 scope as defined in [PCv2-01 Sprint Guide](../sprint/PCv2-01-Production-Readiness-Sprint-Guide.md) and [PCv2-01 Backlog](../backlog/PCv2-01-Backlog.md).

### Security

| Item | Acceptance |
|------|------------|
| CSP enforcement (post-audit) | ✅ Accepted |
| CSP violation reporting endpoint | ✅ Accepted |
| Security headers hardening | ✅ Accepted |
| Secrets / environment validation (env-tier) | ✅ Accepted |
| Application-level rate limiting | ✅ Accepted |
| Session hardening (Better Auth) | ✅ Accepted |
| Tenant validation + API guard audit | ✅ Accepted |
| RLS integration tests (cross-tenant denial) | ✅ Accepted |

### Operations

| Item | Acceptance |
|------|------------|
| Health / readiness / liveness enhancement | ✅ Accepted |
| Consolidated diagnostics extension | ✅ Accepted |
| Incident handling guide updates | ✅ Accepted |
| Recovery guidance alignment | ✅ Accepted |

### Infrastructure (light)

| Item | Acceptance |
|------|------------|
| Caddy edge rate-limit configuration (docs only) | ✅ Accepted |
| Shared app bootstrap package (`@apzhub/platform-bootstrap` proposed) | ✅ Accepted |
| Environment validation at startup | ✅ Accepted |

### Platform

| Item | Acceptance |
|------|------------|
| Audit completeness review | ✅ Accepted |
| Commercial readiness **design** only | ✅ Accepted |
| Tenant onboarding design document | ✅ Accepted |
| Monitoring hooks in diagnostics | ✅ Accepted |

### Documentation

| Item | Acceptance |
|------|------------|
| Production Deployment Guide | ✅ Accepted |
| Production Operations Checklist | ✅ Accepted |
| Upgrade & Rollback Guide | ✅ Accepted |
| Operations / security guide updates | ✅ Accepted |

### Testing

| Item | Acceptance |
|------|------------|
| RLS integration test suite | ✅ Accepted |
| Production smoke E2E (local; CI deferred to M17) | ✅ Accepted |
| Security header regression tests | ✅ Accepted |

### Engineering stories

| Range | Acceptance |
|-------|------------|
| PRH-001 through PRH-018 | ✅ Accepted as frozen backlog |

---

## Scope excluded

The owner confirms these items remain **out of scope** for PCv2-01. They are planning dependencies only.

| Item | Deferred to |
|------|-------------|
| Background workers & outbox processing | **PCv2-02** |
| Outbox queue implementation | **PCv2-02** |
| Dedicated API Gateway service | **PCv2-09** |
| Vault / external secret manager | **PCv2-04** |
| SOC/SIEM integration | **PCv2-05** |
| High availability & DR automation | **PCv2-06** |
| Full observability stack (Prometheus/Grafana/Loki) | **PCv2-07** |
| Commercial licensing & metering | **PCv2-10** |
| Commercial provisioning workflows | **PCv2-03** |
| GitHub Actions CI pipeline (full) | **M17** |
| Financial Engine extraction | **Not approved** |
| Banking, Exchange, new verticals | **Not approved** |
| OSS integrations (Plane, Kimai, etc.) | Post-M17 waves |

---

## Dependencies

### Prerequisites (met)

| Dependency | Status |
|------------|--------|
| PC-001 Platform Core Certification | ✅ CERTIFIED WITH OBSERVATIONS |
| PCS-001 Strategy | ✅ Owner approved 2026-07-08 |
| M8-06 Security & Operational Resilience | ✅ Complete |
| `@apzhub/platform-security` | ✅ Delivered |
| PCv2-01 planning package (D-01–D-04) | ✅ Complete |
| PCv2-01 Readiness Review | ✅ READY WITH OBSERVATIONS |

### External dependencies (accepted risk)

| Dependency | Required for | Owner acceptance |
|------------|--------------|------------------|
| PostgreSQL | RLS tests, platform data | ✅ Accepted |
| Redis | Rate limiting backend | ✅ Accepted |
| Caddy | Edge TLS; optional rate-limit config docs | ✅ Accepted |
| Better Auth | Session hardening | ✅ Accepted |
| Staging environment | Ops doc validation (PRH-012–014) | ✅ Accepted as operator responsibility |

### Downstream enablement (PCv2-01 must not block)

| Milestone | Expectation |
|-----------|-------------|
| **PCv2-02 Workers** | Stable bootstrap, health probes, env validation, audit patterns |
| **M17 CI/CD** | Production checklist, smoke tests, documented gates |
| **OSS Wave 1** | Hardened security and ops baseline |

---

## Risk acceptance

The owner accepts the following risks and mitigations as documented in planning:

| ID | Risk | Severity | Mitigation accepted |
|----|------|----------|---------------------|
| R-PRH-01 | CSP enforcement breaks Next.js inline scripts | High | PRH-002 audit-first; staged enforcement |
| R-PRH-02 | Rate limiting blocks legitimate traffic | Medium | Conservative defaults; ops tuning docs |
| R-PRH-03 | Bootstrap consolidation causes app drift | High | Parity tests; incremental extraction |
| R-PRH-04 | RLS tests flaky without full CI | Medium | Local/staging gate; M17 follows |
| R-PRH-05 | Scope creep into workers/gateway | Medium | Frozen backlog; story review gate |
| R-PRH-06 | CSP blocks law-platform third-party assets | Medium | Per-app CSP profiles (ADR-0046) |
| R-PRH-07 | Secrets validation blocks dev environments | Medium | `NODE_ENV`-aware validation tiers |
| R-PRH-08 | Production docs diverge from reality | Medium | Staging validation (PRH-014) |

### Accepted observations (non-blocking)

1. CSP audit (PRH-002) must precede enforcement — highest technical risk.
2. Staging environment required before PRH-012–014 sign-off.
3. RLS integration test infrastructure should be prepared early (PRH-007).
4. Full CI pipeline deferred to M17 — local gate script in PRH-017.

---

## Quality gate expectations

Every PRH story merge and PCv2-01 closeout must pass:

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test
pnpm test:coverage   # ≥80% maintained
```

### Additional closeout gates

| Gate | Requirement |
|------|-------------|
| RLS integration tests | Pass locally |
| Production smoke E2E | Pass locally (CI wiring in M17) |
| Security header regression | Pass |
| PC-001 certification criteria | No regression |
| Technical debt | New critical/high debt requires register entry |

---

## Success criteria

The owner accepts success criteria SC-01 through SC-15 from the [PCv2-01 Sprint Guide](../sprint/PCv2-01-Production-Readiness-Sprint-Guide.md):

| # | Criterion |
|---|-----------|
| SC-01 | CSP enforced in production |
| SC-02 | CSP violation reporting endpoint operational |
| SC-03 | Security headers complete on web + law-platform |
| SC-04 | Environment validation fails closed on weak/missing secrets |
| SC-05 | Rate limiting on auth and privileged platform API routes |
| SC-06 | Session hardening documented and enforced |
| SC-07 | Tenant validation on all platform API routes with tenant context |
| SC-08 | RLS integration tests pass (cross-tenant denial) |
| SC-09 | Shared bootstrap package used by web + law-platform (TD-M16-C01 closed) |
| SC-10 | Production deployment guide published |
| SC-11 | Production checklist published |
| SC-12 | Upgrade and rollback strategy documented |
| SC-13 | Incident handling guide updated |
| SC-14 | All quality gates green |
| SC-15 | PCv2-01 closeout readiness review READY or READY WITH OBSERVATIONS |

---

## Stop conditions

### PRH-000 (this milestone)

Stop when owner acceptance documentation is complete. **Status: complete.**

### Implementation

| Condition | Action |
|-----------|--------|
| PRH-000 approved | PRH-001 may begin |
| All PRH-001–PRH-018 complete | PCv2-01 closeout (PRH-018) |
| PCv2-01 completion report accepted | Stop — await owner approval for PCv2-02 |
| Scope change requested | Stop — new owner acceptance required |
| Quality gate failure on main | Stop — remediate before continuing |

**Do not begin PCv2-02** until PCv2-01 closeout is owner-approved.

---

## Authorisation statement

> The owner approves PCv2-01 — Production Readiness & Operational Hardening for implementation under the frozen baseline established by PRH-000. Engineering may proceed with **PRH-001** subject to the constraints, exclusions, and quality gates above.

---

## References

- [PRH-000 Implementation Baseline](./PRH-000-Implementation-Baseline.md)
- [PRH-000 Sprint Baseline](../releases/PRH-000-Sprint-Baseline.md)
- [PCv2-01 Sprint Guide](../sprint/PCv2-01-Production-Readiness-Sprint-Guide.md)
- [PCv2-01 Backlog](../backlog/PCv2-01-Backlog.md)
- [PCv2-01 Architecture](../architecture/PCv2-01-Production-Readiness-Architecture.md)
- [PRH-000 Completion Report](../sprint/PRH-000-completion-report.md)
