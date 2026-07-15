# PRH-000 — Sprint Baseline

> **Sprint:** PCv2-01 — Production Readiness & Operational Hardening  
> **Governance milestone:** PRH-000 — Production Readiness Acceptance  
> **Baseline date:** 2026-07-08  
> **Status:** **Approved** — implementation authorised  
> **Type:** Sprint baseline summary — no implementation details

---

## Why this sprint exists

Platform Core v1.0 is **certified with observations** (PC-001). M8-06 delivered security and operational resilience foundations, but the platform is not yet ready for supervised pilot deployment.

PCv2-01 closes the highest-risk gaps between certification and pilot readiness:

- Security posture remains incomplete (CSP is Report-Only; rate limits partial; RLS untested).
- Operational documentation for production deployment is insufficient.
- Application bootstrap is duplicated across `web` and `law-platform`.
- Tenant isolation requires integration-level verification.

This sprint hardens production readiness **without** implementing workers, gateway services, Vault, or OSS integrations — per owner-approved sequencing (PCS-001).

---

## Expected outcome

After PCv2-01 completes, APZHUB will have:

1. **Enforced production security** — CSP, headers, secrets validation, rate limits, session hardening, tenant guards.
2. **Verified tenant isolation** — RLS integration tests demonstrating cross-tenant denial.
3. **Unified application bootstrap** — shared package eliminating dual-app drift.
4. **Operator-ready documentation** — deployment guide, checklist, upgrade/rollback, incident handling.
5. **Commercial foundation (design)** — tenant onboarding design and monitoring hooks for pilot customers.
6. **Unchanged architecture layers** — Platform Core extended, not redesigned.

The platform will be ready for **supervised single-org pilot deployment** with accepted operational risk. Full SaaS automation, workers, and CI remain subsequent milestones.

---

## Definition of Done

PCv2-01 is **done** when all of the following are true:

| # | Criterion |
|---|-----------|
| 1 | All stories PRH-001 through PRH-018 are complete per frozen acceptance criteria |
| 2 | ADR-0046 (CSP & production security posture) is accepted |
| 3 | Success criteria SC-01 through SC-15 are met |
| 4 | Quality gates pass: `lint`, `typecheck`, `build`, `test`, `test:coverage` (≥80%) |
| 5 | RLS integration tests pass locally |
| 6 | Production smoke E2E passes locally |
| 7 | Production documentation published and staging-validated |
| 8 | Technical debt register updated (TD-M16-C01, TD-P09, TD-P10 closed) |
| 9 | PCv2-01 completion report published |
| 10 | PCv2-01 closeout readiness review is READY or READY WITH OBSERVATIONS |
| 11 | No scope items from the excluded list were implemented |
| 12 | Platform Core v1 certification criteria show no regression |

---

## Definition of Production Ready (PCv2-01)

For the purposes of this sprint, **Production Ready** means:

| Dimension | PCv2-01 standard |
|-----------|------------------|
| **Security** | Zero Trust fail-closed on secrets; CSP enforced; rate limits on sensitive routes; sessions hardened; API guard on all privileged routes |
| **Isolation** | Tenant context validated; RLS cross-tenant denial proven by integration tests |
| **Operations** | Liveness, readiness, health, and consolidated diagnostics operational; incident/recovery guides current |
| **Deployment** | Documented self-hosted deployment path; operator checklist; upgrade/rollback procedures |
| **Quality** | Full test pyramid green locally; coverage ≥80%; no critical unfixed regressions |
| **Observability** | Health hierarchy and diagnostics (light); full metrics stack deferred to PCv2-07 |
| **Async processing** | Outbox schema exists; worker processing deferred to PCv2-02 |
| **CI/CD** | Local gates documented; GitHub Actions deferred to M17 |
| **Commercial** | Onboarding design and monitoring hooks only; provisioning deferred to PCv2-03 |

Production Ready **does not** mean: HA, automated DR, Vault, SOC/SIEM, commercial licensing, or OSS integrations.

---

## Success metrics

| Metric | Target | Verification |
|--------|--------|--------------|
| CSP mode in production | `Content-Security-Policy` enforced | Header inspection |
| Privileged API guard coverage | 100% | PRH-009 audit checklist |
| RLS cross-tenant tests | 100% pass | Integration suite |
| Bootstrap duplication | 0 (TD-M16-C01 closed) | Single shared package |
| Production docs published | 3 guides + checklist | Governance folder |
| Quality gate pass rate | 100% at closeout | CI commands |
| Test coverage | ≥80% | `pnpm test:coverage` |
| Production smoke E2E | Pass locally | PRH-017 suite |
| Scope creep incidents | 0 excluded items shipped | Closeout review |
| PC-001 regression | 0 new critical observations | Certification criteria check |

---

## Sequencing context

```text
PCS-001 (approved)
    ↓
PCv2-01 planning (complete)
    ↓
PRH-000 owner acceptance (approved 2026-07-08)
    ↓
PRH-001–PRH-018 implementation  ← current authorisation
    ↓
PCv2-01 closeout
    ↓
PCv2-02 Workers (owner gate)
    ↓
M17 CI/CD
    ↓
OSS Waves
```

---

## Governance references

| Document | Purpose |
|----------|---------|
| [PRH-000 Owner Acceptance](../reviews/PRH-000-Owner-Acceptance.md) | Owner approval and contractual scope |
| [PRH-000 Implementation Baseline](../reviews/PRH-000-Implementation-Baseline.md) | Frozen architecture, backlog, criteria |
| [PCv2-01 Sprint Guide](../sprint/PCv2-01-Production-Readiness-Sprint-Guide.md) | Execution blueprint |
| [PCv2-01 Backlog](../backlog/PCv2-01-Backlog.md) | Engineering stories |

---

_No release tag is associated with PRH-000. PCv2-01 closeout may produce a release review document; tagging remains at owner discretion._
