# PCv2-01 — Readiness Review

> **Review date:** 2026-07-08  
> **Scope:** PCv2-01 Production Readiness & Operational Hardening — sprint planning package  
> **Type:** Planning review — **no implementation**  
> **Authority:** [PC-001 Certification](./APZHUB-Platform-Core-Certification.md) · [PCS-001 Owner Approval](../strategy/PCS-001-owner-approval.md)

---

## Executive summary

The PCv2-01 planning package (sprint guide, backlog, target architecture) is **complete and internally consistent**. It correctly focuses on production security hardening, operational documentation, bootstrap consolidation, and RLS verification — while explicitly deferring workers, gateway service, Vault, SOC/SIEM, HA, and OSS integrations per owner sequencing.

The proposed sprint is **ready for owner approval** to begin implementation (PRH-001), subject to observations below.

**Verdict:** **READY WITH OBSERVATIONS**

---

## Readiness assessment

| Area | Status | Notes |
|------|--------|-------|
| Strategic alignment (PCS-001) | ✅ Ready | PCv2-01 authorized; sequencing preserved |
| Platform Core v1 baseline | ✅ Ready | PC-001 certified; M8-06 security delivered |
| Sprint guide completeness | ✅ Ready | Objectives, scope, success criteria, risks, gates |
| Backlog granularity | ✅ Ready | 18 stories with acceptance criteria |
| Target architecture | ✅ Ready | Flows documented; dependencies on PCv2-02 clear |
| CSP enforcement plan | ⚠️ Observation | High risk (R-PRH-01); PRH-002 must lead with audit |
| CI/CD automation | ⏳ Deferred | Correctly deferred to M17 per owner sequencing |
| Workers / outbox | ⏳ Deferred | Correctly deferred to PCv2-02 |
| Vault / gateway | ⏳ Deferred | PCv2-04 / PCv2-09 |
| Test infrastructure for RLS | ⚠️ Observation | Integration DB setup needed before PRH-007 |
| Staging environment | ⚠️ Observation | Required for PRH-012/013/014 validation |
| ADR-0046 | ⏳ Pending | Created in PRH-001 during implementation |

---

## Strengths

| # | Strength |
|---|----------|
| S1 | **Correct scope boundary** — does not implement workers, gateway, or Vault despite naming overlap in v2 roadmap |
| S2 | **Owner sequencing honoured** — M17 after PCv2-02; PCv2-01 does not claim CI delivery |
| S3 | **Addresses PC-001 observations** — CSP, bootstrap duplication, RLS tests, rate limits |
| S4 | **Operational documentation included** — deployment, checklist, upgrade/rollback not deferred |
| S5 | **18-story backlog is executable** — clear dependencies and effort estimates |
| S6 | **Dual-app parity** — PRH-008 explicitly closes TD-M16-C01 |
| S7 | **Prepares PCv2-02** — outbox diagnostic hook planned without implementing workers |
| S8 | **Commercial readiness design-only** — avoids PCv2-03 scope creep |

---

## Risks (planning phase)

| ID | Risk | Severity | Mitigation in plan |
|----|------|----------|-------------------|
| R-01 | CSP breaks Next.js | High | PRH-002 audit-first; staged enforcement |
| R-02 | Bootstrap refactor regression | High | PRH-008 parity tests; incremental |
| R-03 | RLS tests without CI | Medium | Local/staging gate; M17 follows |
| R-04 | Sprint duration underestimate | Medium | ~18–25 days sequential; parallelise docs only |
| R-05 | Operator docs untested | Medium | PRH-014 staging validation |
| R-06 | Rate limit tuning | Low | Conservative defaults; ops guide |

---

## Missing capabilities (acceptable for PCv2-01)

| Capability | Status | Next milestone |
|------------|--------|----------------|
| Outbox worker processing | Deferred | PCv2-02 |
| GitHub Actions CI | Deferred | M17 |
| Vault secrets | Deferred | PCv2-04 |
| API Gateway service | Deferred | PCv2-09 |
| Prometheus/Grafana/Loki | Deferred | PCv2-07 |
| Commercial provisioning | Design only | PCv2-03 |
| OSS integrations | Deferred | Post-M17 |

None block PCv2-01 approval.

---

## Open decisions (resolve in PRH-001)

| ID | Decision | Recommendation |
|----|----------|----------------|
| Q-PRH-01 | Package name: `@apzhub/platform-bootstrap` vs extend `platform-runtime`? | **New package** — bootstrap is app-layer orchestration |
| Q-PRH-02 | CSP per-app policies (web vs law-platform)? | **Yes** — law may need relaxed `connect-src` for dev tools |
| Q-PRH-03 | Rate limit defaults for auth routes? | **20/min/IP** login; **120/min** platform APIs |
| Q-PRH-04 | RLS test database: docker compose profile vs dedicated test schema? | **Docker compose test profile** |
| Q-PRH-05 | CSP report endpoint auth? | **Unauthenticated POST** with size limit; no PII in reports |

---

## Recommended sequencing (confirmed)

```text
Owner approve PCv2-01 sprint guide
    ↓
PRH-001 → PRH-002 (CSP audit critical path)
    ↓
PRH-003–007 security hardening
    ↓
PRH-008 bootstrap (can start after PRH-001 in parallel with PRH-003)
    ↓
PRH-009–018 operations, docs, verification
    ↓
PCv2-01 closeout → PCv2-02 Workers (owner approval)
```

---

## Alignment check

| Source | Alignment |
|--------|-----------|
| PCS-001 owner approval | ✅ PCv2-01 authorized; workers next |
| PC-001 certification observations | ✅ Addressed in backlog |
| M8-06 security baseline | ✅ Extended, not replaced |
| Document 013 Zero Trust | ✅ Fail closed, guard audit |
| Document 015 quality | ✅ Full gate requirement |
| Technical debt register | ✅ TD-M16-C01, TD-P09, TD-P10 targeted |
| User PCv2-01 planning scope | ✅ No workers, gateway, Vault, OSS |

---

## Verdict

# READY WITH OBSERVATIONS

The PCv2-01 sprint planning package is **ready for owner approval** to begin implementation.

**Observations (non-blocking):**

1. PRH-002 CSP audit must complete before enforcement — highest technical risk.
2. Staging environment required before PRH-012–014 sign-off.
3. RLS integration test infrastructure should be set up early (PRH-001 or PRH-007 prep).
4. Full CI pipeline correctly deferred to M17 — document local gate script in PRH-017.

**Do not begin PRH-001** until owner explicitly approves this sprint guide.

---

## References

- [PCv2-01 Sprint Guide](../sprint/PCv2-01-Production-Readiness-Sprint-Guide.md)
- [PCv2-01 Backlog](../backlog/PCv2-01-Backlog.md)
- [PCv2-01 Architecture](../architecture/PCv2-01-Production-Readiness-Architecture.md)
