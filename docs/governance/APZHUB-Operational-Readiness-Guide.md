# APZHUB Operational Readiness Guide

**Milestone:** PRH-008  
**Audience:** Platform owners and operators

---

## Two-minute operator checklist

Answer these questions using **Platform Operations → Dashboard**:

| Question                          | Dashboard location                                                  |
| --------------------------------- | ------------------------------------------------------------------- |
| Is the platform healthy?          | Platform health + Readiness score                                   |
| Is the platform production ready? | Production readiness verdict                                        |
| Which capability is degraded?     | Capability status table                                             |
| What caused the degradation?      | Degraded capabilities recommendations                               |
| Which products are affected?      | Production verification → Affected products                         |
| What should be done next?         | Capability recommendations + Recovery guidance (Resilience section) |
| Which technical debt remains?     | Outstanding technical debt panel                                    |

---

## Readiness gates

Before production cutover, require:

1. **Production verification:** `READY` or documented acceptance of `READY_WITH_OBSERVATIONS`
2. **Dependencies:** Database and Redis healthy
3. **Configuration:** No failing environment validation checks
4. **Bootstrap:** Platform runtime ready
5. **Security:** Session and traffic governance postures reviewed
6. **Tenant isolation:** Membership validation and RLS tests passing (PRH-007)

---

## NOT_READY response

1. Identify failing findings in `productionVerification.findings` (severity `fail`).
2. Restore dependency health (database, Redis) first.
3. Resolve bootstrap and configuration failures.
4. Re-run verification via dashboard refresh.

---

## READY_WITH_OBSERVATIONS response

1. Review warnings — document accepted risk for release notes.
2. Prioritize remediation from technical debt register.
3. Schedule follow-up for foundation-maturity capabilities (e.g. provisioning).

---

## Out of scope (PRH-008)

Workers, gateway, vault, SOC/SIEM, HA, commercial licensing, financial engine, banking, OSS integrations — operational visibility only.

---

## Related

- [Production Verification Guide](./APZHUB-Production-Verification-Guide.md)
- [Operations Dashboard Guide](../developer/APZHUB-Operations-Dashboard-Guide.md)
- [Platform Operations Control Plane Architecture](../architecture/APZHUB-Platform-Operations-Control-Plane-Architecture.md)
