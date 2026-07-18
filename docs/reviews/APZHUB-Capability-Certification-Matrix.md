# APZHUB Capability Certification Matrix

**Milestone:** PRH-011  
**Date:** 2026-07-09  
**Supersedes:** PC-001 matrix for Platform Core v2 scope

---

## Rating scale

| Rating               | Meaning                                                     |
| -------------------- | ----------------------------------------------------------- |
| **Certified**        | Architecture compliant; production-ready for internal/pilot |
| **Certified w/ Obs** | Compliant with documented observations                      |
| **Conditional**      | Functional but requires hardening before GA                 |
| **Not Certified**    | Architectural violation or missing capability               |

---

## Platform capabilities

| Capability               | Owner                              | Lifecycle | Operations | Compliance | Ops readiness | Verdict              |
| ------------------------ | ---------------------------------- | --------- | ---------- | ---------- | ------------- | -------------------- |
| Platform Runtime         | `@apzhub/platform-runtime`         | ✅        | ✅         | ✅         | Very Good     | **Certified**        |
| Platform Bootstrap       | `@apzhub/platform-bootstrap`       | ✅        | ✅         | ✅         | Very Good     | **Certified**        |
| Platform Configuration   | `@apzhub/config`                   | ✅        | ✅         | ⚠️         | Very Good     | **Certified w/ Obs** |
| Platform Persistence     | `@apzhub/config`                   | ✅        | ✅         | ⚠️         | Good          | **Certified w/ Obs** |
| Platform Identity        | `@apzhub/platform-identity`        | ✅        | ✅         | ✅         | Very Good     | **Certified**        |
| Platform Authorization   | `@apzhub/platform-authorization`   | ✅        | ✅         | ✅         | Very Good     | **Certified**        |
| Platform Personalisation | `@apzhub/platform-personalisation` | ✅        | ✅         | ✅         | Very Good     | **Certified**        |
| Platform Governance      | `@apzhub/platform-governance`      | ✅        | ✅         | ✅         | Good          | **Certified**        |
| Platform Provisioning    | `@apzhub/platform-identity`        | ✅        | ✅         | ✅         | Foundation    | **Certified w/ Obs** |
| Platform Security        | `@apzhub/platform-security`        | ✅        | ✅         | ✅         | Very Good     | **Certified**        |
| Traffic Governance       | `@apzhub/platform-security`        | ✅        | ✅         | ✅         | Very Good     | **Certified**        |
| Session Security         | `@apzhub/auth`                     | ✅        | ✅         | ✅         | Very Good     | **Certified**        |
| Tenant Isolation         | `@apzhub/platform-identity`        | ✅        | ✅         | ✅         | Very Good     | **Certified**        |
| Operations Control Plane | `@apzhub/platform-operations`      | ✅        | ✅         | ✅         | Very Good     | **Certified**        |
| Lifecycle Management     | `@apzhub/platform-lifecycle`       | ✅        | ✅         | ✅         | Very Good     | **Certified**        |
| Workbench Framework      | `@apzhub/workbench-framework`      | ✅        | ✅         | ✅         | Very Good     | **Certified**        |
| API Framework            | `apps/web/lib/api`                 | ✅        | ✅         | ⚠️         | Good          | **Certified w/ Obs** |
| Diagnostics / Health     | `@apzhub/platform-security`        | ✅        | ✅         | ✅         | Very Good     | **Certified**        |

**Configuration/Persistence observation:** `@apzhub/config` contains law domain adapters (TD-M16-M01).

**API Framework observation:** Not all platform routes use permission guards (OBS-PCv2-01).

---

## Products

| Product          | Owner               | Consumes Platform Core                                                       | Lifecycle participation | Verdict       |
| ---------------- | ------------------- | ---------------------------------------------------------------------------- | ----------------------- | ------------- |
| Law Platform     | `apps/law-platform` | ✅ Runtime, Identity, Auth, Security, Personalisation, Governance, Workbench | ✅ Participates         | **Certified** |
| Trust Accounting | Law trust module    | ✅ Via Law Platform + persistence                                            | ✅ Participates         | **Certified** |

Products do **not** own platform lifecycle. Law REST API is hosted in `apps/web` and uses `withLawApiAuth` + `validateUserTenantMembership`.

---

## Cross-cutting validation

| Dimension                                 | Result  |
| ----------------------------------------- | ------- |
| No duplicate canonical bootstrap          | ✅      |
| No duplicate diagnostics loader           | ✅      |
| Lifecycle ↔ Operations registry alignment | ✅      |
| Production verification integrated        | ✅      |
| Reliability validation (PRH-010)          | ✅ PASS |
| Law API tenant gate                       | ✅      |

---

## Related

- [Architecture Compliance Report](./APZHUB-Architecture-Compliance-Report.md)
- [Platform Core v2 Certification](./APZHUB-Platform-Core-v2-Certification.md)
