# Incident Management Standard

> **Programme:** APZHUB-OPERATIONS-001  
> **Related:** [APZHUB-Incident-Response-Guide](../governance/APZHUB-Incident-Response-Guide.md) · [HOTFIX-POLICY](./HOTFIX-POLICY.md) · [PRODUCTION-SUPPORT-STANDARD](./PRODUCTION-SUPPORT-STANDARD.md)

---

## Purpose

Standardise severity, communication, RCA, post-incident review, and preventative actions for production incidents. Complements the existing Incident Response Guide — does not replace operational health endpoints or runbooks.

---

## Incident severity

| Level  | Example                                          | Response             |
| ------ | ------------------------------------------------ | -------------------- |
| **P1** | Platform unreachable; auth down; security breach | Immediate; all hands |
| **P2** | Readiness failing; major degradation             | Within 1 hour        |
| **P3** | Single capability degraded; workaround exists    | Next business day    |
| **P4** | Minor / informational                            | Backlog              |

---

## Communication

| Audience             | Channel / rule                                          |
| -------------------- | ------------------------------------------------------- |
| Internal engineering | Technical Lead coordinates; status in ops consoles      |
| Owner                | Notified for P1/P2 and any freeze-touching mitigation   |
| End users            | Factual status only; no engine/vendor blame; no secrets |
| External status page | Future — not assumed present                            |

During incident: prefer short factual updates; avoid speculation.

---

## Response workflow

1. **Identify** — health/readiness/diagnostics
2. **Contain** — reduce blast radius
3. **Recover** — hotfix/rollback/config
4. **Verify** — health 200; critical paths
5. **Document** — timeline + actions

Detail: [Incident Response Guide](../governance/APZHUB-Incident-Response-Guide.md).

---

## Root cause analysis

After P1/P2 (and P3 when recurring):

- Timeline of detection → mitigation → recovery
- Technical root cause (not blame)
- Contributing factors (process, test gap, config)
- Why detection was delayed (if applicable)

---

## Post-incident review

Hold a short review within a defined window after recovery:

| Input    | Output                          |
| -------- | ------------------------------- |
| Timeline | Agreed facts                    |
| RCA      | Recorded cause                  |
| Actions  | Preventative backlog items      |
| Owners   | Named action owners + due dates |

---

## Preventative actions

- Tests that would have caught the defect
- Monitoring/alert gaps closed
- Runbook updates
- Limitation docs if behaviour remains constrained
- Owner-approved programme if structural fix needed

Preventative work still follows change management — incidents do not authorise unbounded refactors.
