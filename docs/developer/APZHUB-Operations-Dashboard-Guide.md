# APZHUB Operations Dashboard Guide

**Milestone:** PRH-008  
**Audience:** Platform operators and administrators

---

## Access

1. Sign in to APZHUB with administration permissions (`platform.nav.administration.view`).
2. Open **Administration** workspace → **Platform Operations** → **Dashboard**.

Route: `/workspace/administration` (dashboard section)

---

## Dashboard sections (PRH-008)

The dashboard consumes the canonical control plane endpoint and answers operator questions in under two minutes.

### Platform overview

- Platform health signal
- Production readiness verdict (`READY`, `READY_WITH_OBSERVATIONS`, `NOT_READY`)
- Readiness score (0–100)
- Environment and inventory counts (tenants, users, modules, products)

### Capability status

Table of all registered platform capabilities with health, readiness, owner, and warning counts.

### Production verification

Pass / warning / failure counts from the verification service. Lists affected products when capabilities are degraded.

### Degraded capabilities

Recommended next actions for any capability not in `healthy` status.

### Dependency health

Database and Redis health from resilience probes.

### Outstanding technical debt

Curated open items with link to the full Technical Debt Register.

### Documentation status

Operations guide references for runbooks and governance.

---

## API endpoints

| Endpoint                                        | Purpose                                                      |
| ----------------------------------------------- | ------------------------------------------------------------ |
| `GET /api/platform/v1/operations/control-plane` | Canonical control plane snapshot (PRH-008)                   |
| `GET /api/platform/v1/operations/summary`       | Legacy aggregate summary (health, counts, consolidated JSON) |
| `GET /api/platform/v1/operations/configuration` | Masked configuration diagnostics                             |
| `GET /api/platform/v1/security/diagnostics`     | Security-focused diagnostics                                 |

All privileged endpoints require administration permission.

---

## Operator workflow

1. Check **Production readiness** verdict on the dashboard.
2. If not `READY`, open **Degraded capabilities** for recommendations.
3. Review **Dependency health** for infrastructure root cause.
4. Cross-reference **Technical debt** for known gaps.
5. Use section-specific views (Security, Resilience, Diagnostics) for deep dives.

---

## Related

- [Platform Operations Control Plane Architecture](../architecture/APZHUB-Platform-Operations-Control-Plane-Architecture.md)
- [Production Verification Guide](../governance/APZHUB-Production-Verification-Guide.md)
- [Platform Operations Console Guide](./APZHUB-Platform-Operations-Console-Guide.md)
