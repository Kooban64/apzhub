# APZHUB Architecture Compliance Report

**Milestone:** PRH-011 — Platform Architecture Compliance & Certification  
**Date:** 2026-07-09  
**Type:** Validation and certification — no implementation  
**Authority:** [Engineering Constitution](../000-apzhub-engineering-constitution.md) · PRH-001–PRH-010 completion reports

---

## Executive summary

PRH-011 performs a complete architectural compliance review of Platform Core after PCv2-01 production readiness work (PRH-001–PRH-010). The review confirms **internal consistency**, **correct product consumption of Platform Core**, and **no critical architectural bypasses**.

**Compliance verdict:** **COMPLIANT WITH OBSERVATIONS**

One dependency-cycle violation was remediated during review (removed unused `@apzhub/platform-operations` dependency from `@apzhub/platform-lifecycle`). Remaining observations are documented for future hardening — not blockers for Platform Core v2 certification.

---

## Validation scope

| Domain | Validated | Result |
|--------|-----------|--------|
| Package boundaries | ✅ | Compliant |
| Dependency direction | ✅ | Compliant (after cycle fix) |
| Platform ownership | ✅ | Compliant |
| Product ownership | ✅ | Compliant |
| Capability ownership | ✅ | Compliant |
| API consistency | ⚠️ | Observations |
| Diagnostics consistency | ✅ | Compliant |
| Lifecycle participation | ✅ | Compliant |
| Operations participation | ✅ | Compliant |
| Security posture | ✅ | Compliant |
| Configuration usage | ✅ | Compliant |
| Identity usage | ✅ | Compliant |
| Authorization usage | ✅ | Compliant |
| Tenant enforcement | ✅ | Compliant (Law API) |
| Personalisation usage | ✅ | Compliant |
| Governance usage | ✅ | Compliant |
| Traffic governance | ✅ | Compliant |
| Session policy | ✅ | Compliant |
| Bootstrap usage | ✅ | Compliant |
| Duplicated implementations | ⚠️ | Observations (host wrappers) |
| Platform Core bypass | ✅ | None found |

---

## Layer compliance (Document 003)

```
Presentation → Application → Domain → Services → Adapters → Backend Engines
```

| Rule | Status | Evidence |
|------|--------|----------|
| Modules do not call connectors directly | ✅ | Law Platform uses persistence adapters in `@apzhub/config` |
| Products consume Platform Services | ✅ | Identity, Authorization, Security, Personalisation, Governance via packages |
| Business logic in Platform Services | ✅ | `@apzhub/platform-*` packages own platform logic |
| Client API only through gateway path | ✅ | `/api/platform/v1/*`, `/api/law/v1/*` in `apps/web` |
| No platform package imports from apps | ✅ | Verified in compliance tests |

---

## PRH-001–PRH-010 alignment

| Milestone | Capability | Compliance |
|-----------|------------|------------|
| PRH-001 | Bootstrap consolidation | ✅ Both hosts use `@apzhub/platform-bootstrap` |
| PRH-002–PRH-006 | Security hardening | ✅ Centralised in `@apzhub/platform-security` |
| PRH-007 | Tenant isolation | ✅ `validateUserTenantMembership` on Law API |
| PRH-008 | Operations Control Plane | ✅ Canonical snapshot + verification |
| PRH-009 | Lifecycle Management | ✅ Platform-owned lifecycle; products participate |
| PRH-010 | Reliability validation | ✅ Deterministic failure/recovery behaviour |

---

## Observations (non-blocking)

| ID | Observation | Severity | Recommended action |
|----|-------------|----------|-------------------|
| OBS-PCv2-01 | Some `/api/platform/v1/*` routes use session-only auth | Medium | Extend admin/permission guards (future hardening) |
| OBS-PCv2-02 | `@apzhub/config` depends on `@apzhub/legal-business-core` | Medium | Extract law persistence (TD-M16-M01) |
| OBS-PCv2-03 | Hydration wrappers duplicated across app hosts | Low | Consolidate host adapters when convenient |
| OBS-PCv2-04 | Operations/lifecycle surfaces only on `apps/web` host | Low | By design — primary platform host |

---

## Automated compliance checks

`packages/platform-operations/src/platform-architecture-compliance.test.ts` — 9 tests validating registry alignment, dependency direction, bootstrap/diagnostics canonical usage, privileged route guards, and Law API tenant membership.

---

## Related documents

- [Capability Certification Matrix](./APZHUB-Capability-Certification-Matrix.md)
- [Platform Core v2 Certification](./APZHUB-Platform-Core-v2-Certification.md)
- [PRH-011 Completion Report](../sprint/PRH-011-completion-report.md)
