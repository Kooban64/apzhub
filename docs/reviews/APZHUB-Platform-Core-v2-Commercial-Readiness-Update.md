# APZHUB Platform Core v2 — Commercial Readiness Update

**Milestone:** PRH-011  
**Date:** 2026-07-09  
**Supersedes:** [Platform Core Commercial Assessment](./APZHUB-Platform-Core-Commercial-Assessment.md) for post-PRH-010 posture

---

## Executive summary

Platform Core v2 (PRH-001–PRH-010) materially improves **operational readiness** and **production validation** compared to PC-001. Commercial posture remains **Pilot / Internal Validation Ready** — not multi-tenant SaaS GA.

**Updated commercial posture:** **Pilot Ready (internal)** · **Production GA requires PCv2-02+**

---

## Improvements since PC-001

| Area                  | PC-001                 | Post PRH-010                                    |
| --------------------- | ---------------------- | ----------------------------------------------- |
| Bootstrap             | Duplicated across apps | ✅ Canonical `@apzhub/platform-bootstrap`       |
| Security hardening    | Foundation             | ✅ CSP, headers, traffic, session (PRH-002–006) |
| Tenant isolation      | Partial                | ✅ Membership validation + RLS tests (PRH-007)  |
| Operations visibility | Console only           | ✅ Control plane + verification (PRH-008)       |
| Lifecycle management  | Runtime manifest only  | ✅ Platform lifecycle manager (PRH-009)         |
| Failure validation    | Limited                | ✅ Reliability validation PASS (PRH-010)        |

---

## Commercial readiness matrix

| Requirement                     | Status       | Notes                                     |
| ------------------------------- | ------------ | ----------------------------------------- |
| Internal product validation     | ✅ Ready     | Law Platform certified path               |
| Single-org pilot                | ✅ Ready     | With documented observations              |
| Multi-tenant SaaS GA            | ❌ Not ready | Workers, CI, vault, HA deferred           |
| Enterprise SLA                  | ❌ Not ready | Observability stack incomplete            |
| Independent product development | ✅ Ready     | Manifest + platform services model proven |

---

## Remaining commercial blockers

| Blocker                          | Milestone |
| -------------------------------- | --------- |
| Outbox workers (TD-P18)          | PCv2-02   |
| GitHub Actions CI (TD-M16-M02)   | M17       |
| Vault / secret management        | PCv2-04+  |
| HA / DR automation               | PCv2-06+  |
| Commercial onboarding automation | PCv2-03+  |

---

## Recommendation

Proceed to **OSS integration roadmap** only after owner acceptance of Platform Core v2 certification. Commercial GA remains gated on PCv2-02 (Workers) and M17 (CI/CD).

---

## Related

- [Platform Core v2 Certification](./APZHUB-Platform-Core-v2-Certification.md)
- [Technical Debt Review](./APZHUB-Platform-Core-v2-Technical-Debt-Review.md)
