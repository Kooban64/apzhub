# APZHUB Production Verification Guide

**Milestone:** PRH-008  
**Audience:** Platform operators, release approvers

---

## Purpose

The Production Verification service evaluates whether APZHUB is safe to expose to production traffic. It returns a deterministic verdict with detailed findings.

---

## Verdicts

| Verdict                   | When                                   |
| ------------------------- | -------------------------------------- |
| `READY`                   | All mandatory checks pass; no failures |
| `READY_WITH_OBSERVATIONS` | No failures; one or more warnings      |
| `NOT_READY`               | One or more mandatory checks failed    |

---

## Mandatory checks

| Check ID              | Domain        | Failure condition                        |
| --------------------- | ------------- | ---------------------------------------- |
| `bootstrap.ready`     | Bootstrap     | Platform runtime bootstrap not ready     |
| `configuration.valid` | Configuration | Environment validation failed            |
| `readiness.probe`     | Health        | Readiness probe unhealthy                |
| `dependency.database` | Persistence   | Database unhealthy                       |
| `dependency.redis`    | Persistence   | Redis unhealthy                          |
| `capability.*.health` | Capabilities  | Capability health or readiness unhealthy |

---

## Warning checks

| Check ID               | Domain           | Warning condition                                                            |
| ---------------------- | ---------------- | ---------------------------------------------------------------------------- |
| `configuration.warn.*` | Configuration    | Environment validation warnings                                              |
| `session.posture`      | Session          | Session security recommendations present                                     |
| `traffic.enabled`      | Traffic          | Traffic governance disabled                                                  |
| `tenant.api-guard`     | Tenant isolation | API guard audit incomplete                                                   |
| `capability.*.health`  | Capabilities     | Capability degraded but not unhealthy (operational/production maturity only) |

Foundation- and experimental-maturity capabilities may report degraded health in the capability table without affecting the production verdict.

---

## Readiness score

```
score = round(((passCount + warnCount * 0.5) / totalChecks) * 100)
```

Deterministic for identical consolidated diagnostics input.

---

## Access

**API:** `GET /api/platform/v1/operations/control-plane` → `data.productionVerification`

**UI:** Platform Operations → Dashboard → Production verification card

---

## Implementation

- Service: `packages/platform-operations/src/production-verification-service.ts`
- Tests: `packages/platform-operations/src/operations-control-plane.test.ts`

---

## Related

- [Operational Readiness Guide](./APZHUB-Operational-Readiness-Guide.md)
- [Capability Health Model](../architecture/APZHUB-Capability-Health-Model.md)
