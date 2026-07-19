# Hotfix Policy

> **Programme:** APZHUB-OPERATIONS-001  
> **Related:** [INCIDENT-MANAGEMENT-STANDARD](./INCIDENT-MANAGEMENT-STANDARD.md) · [RELEASE-MANAGEMENT-STANDARD](./RELEASE-MANAGEMENT-STANDARD.md) · [BRANCHING-AND-VERSIONING](./BRANCHING-AND-VERSIONING.md)

---

## Purpose

Controlled emergency changes to production without opening unbounded programmes or breaking freezes silently.

---

## Severity levels

| Severity    | Meaning                                            | Response target     |
| ----------- | -------------------------------------------------- | ------------------- |
| **S1 / P1** | Production down / security breach / data loss risk | Immediate           |
| **S2 / P2** | Major feature broken for many users; no workaround | Hours               |
| **S3 / P3** | Degraded / partial; workaround exists              | Next planned window |
| **S4 / P4** | Minor / cosmetic                                   | Normal backlog      |

Align incident severities with [Incident Response Guide](../governance/APZHUB-Incident-Response-Guide.md) (P1–P4).

---

## Emergency releases

1. Open `hotfix/x.y.z` from the production tag (or `main` if tags lag — document base).
2. **Minimal fix only** — no refactors, no feature work.
3. Owner Approval expedited for S1/S2 (may be verbal/written then recorded in Acceptance).
4. ADR required if the fix must touch a frozen public contract (prefer temporary mitigation otherwise).
5. Regression tests for the defect + critical path.
6. Certify hotfix package; tag PATCH; deploy; verify health.
7. File Completion + Acceptance (or hotfix evidence pack) and close.

---

## Production fixes

| Allowed                       | Not allowed          |
| ----------------------------- | -------------------- |
| Targeted defect fix           | New product features |
| Config/ops runbook correction | Silent freeze breaks |
| Test coverage for the bug     | Drive-by refactors   |

---

## Regression testing

Minimum:

- Reproducing test (unit/integration/E2E as appropriate)
- Related product/platform suite green
- No new typecheck/lint failures
- Smoke health/readiness after deploy

---

## Approval process

| Severity | Approvals                                               |
| -------- | ------------------------------------------------------- |
| S1       | Owner (expedited) + Technical Lead                      |
| S2       | Owner + Technical Lead (+ Architect if freeze-adjacent) |
| S3–S4    | Prefer normal change management                         |

---

## Rollback criteria

Roll back if:

- Health/readiness fails post-deploy
- Defect not fixed and blast radius increased
- Data integrity risk
- Owner orders rollback

Document rollback decision in the hotfix evidence pack.
