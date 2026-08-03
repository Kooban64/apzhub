# LAW-OPERATIONS-HANDBOOK

| Field       | Value                                                                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Programme   | APZHUB-LAW-ADOPT-004                                                                                                                             |
| Product     | APZ Law Platform                                                                                                                                 |
| Timestamp   | 20260803T135126Z                                                                                                                                 |
| Authority   | Operational Governance                                                                                                                           |
| Engineering | **NONE**                                                                                                                                         |
| Model cited | [APZHUB-OPERATIONS-GOVERNANCE](../APZHUB-ENG-003/APZHUB-OPERATIONS-GOVERNANCE.md) · [APZQEP-OPS-001](../../products/apzqep/v1.1/apzqep-ops-001/) |

## 1. Purpose

Operate APZ Law Platform under controlled enterprise operational governance matching the APZQEP post-certification pattern. This programme establishes **standing operations governance**. It does not implement tooling, collect live metrics, or change product code.

## 2. Management posture

| Era                        | Mode                                                           |
| -------------------------- | -------------------------------------------------------------- |
| Through PBR-APZHUB-LAW-003 | Adoption delivery (governance → engineering alignment)         |
| From APZHUB-LAW-ADOPT-004  | **Operations-led** under enterprise adoption (evidence-driven) |

Rules:

1. Engineering reacts only to validated operational evidence and separate Owner Authorisation.
2. Product Board priorities come from operational evidence, support trends, and enhancement intake — not speculative delivery.
3. Enterprise Adoption Certification / Product Readiness remain separate later phases (ADOPT-005 / PBR-005) — not authorised here.
4. Enterprise governance and standards are **cited**, not modified.

## 3. Operational ownership

| Role                          | Responsibility                                                             |
| ----------------------------- | -------------------------------------------------------------------------- |
| Product Operations Owner      | Day-to-day Law availability, incident register, ops reviews                |
| Product Owner / Board liaison | Monthly Board pack, enhancement triage, risk acceptance                    |
| Platform Operations (shared)  | Host, TLS, Postgres/Redis coexistence with legacy stack per ENVIRONMENT.md |
| Security Operations (shared)  | Auth/security event review path; no silent patches                         |
| Support Owner                 | Intake classification, escalation to ops/Board                             |

Named individuals are assigned by Owner outside this programme; roles are mandatory.

## 4. Operational areas

| Area                           | Owner focus                   | Primary artefacts                                                                                               |
| ------------------------------ | ----------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Availability                   | Uptime, health facets         | [LAW-PRODUCT-HEALTH.md](./LAW-PRODUCT-HEALTH.md) · [LAW-OPERATIONS-DASHBOARD.md](./LAW-OPERATIONS-DASHBOARD.md) |
| Performance                    | Latency, responsiveness       | Dashboard / health                                                                                              |
| Authentication / Authorisation | Failures, permission denials  | Incidents · dashboard                                                                                           |
| Background processing          | Jobs / async (when present)   | Dashboard                                                                                                       |
| Audit / security events        | Integrity, abuse signals      | Incidents · risk register                                                                                       |
| Known limitations              | Accepted residuals            | [LAW-KNOWN-ISSUES.md](./LAW-KNOWN-ISSUES.md)                                                                    |
| Incidents / problems           | Capture → mitigate → escalate | Incident · problem docs                                                                                         |
| Support                        | Classification + escalation   | [LAW-SUPPORT-MODEL.md](./LAW-SUPPORT-MODEL.md)                                                                  |
| Change                         | Controlled ops/config change  | [LAW-CHANGE-GOVERNANCE.md](./LAW-CHANGE-GOVERNANCE.md)                                                          |
| Enhancements                   | Governed backlog              | [LAW-ENHANCEMENT-REGISTER.md](./LAW-ENHANCEMENT-REGISTER.md)                                                    |

## 5. Baseline runbooks (structure — cite existing)

Do not invent new deployment tooling. Consume existing Law / platform ops readiness where present:

| Topic                        | Path                                                                                         |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| Historical Law ops readiness | [APZ-LAW-1.0-OPERATIONAL-READINESS](../../releases/law/APZ-LAW-1.0-OPERATIONAL-READINESS.md) |
| Product pack ops readiness   | [apz-law/OPERATIONAL-READINESS.md](../../products/apz-law/OPERATIONAL-READINESS.md)          |
| Release governance           | [LAW-RELEASE-GOVERNANCE.md](../APZHUB-LAW-ADOPT-002/LAW-RELEASE-GOVERNANCE.md)               |
| Evidence lifecycle           | [LAW-EVIDENCE-GOVERNANCE.md](../APZHUB-LAW-ADOPT-002/LAW-EVIDENCE-GOVERNANCE.md)             |
| Host coexistence             | [ENVIRONMENT.md](../../../ENVIRONMENT.md) (repo root)                                        |
| Enterprise ops model         | [APZHUB-OPERATIONS-GOVERNANCE.md](../APZHUB-ENG-003/APZHUB-OPERATIONS-GOVERNANCE.md)         |

Runbook gaps (no live tooling in this programme) are recorded as operational risks — not engineering tasks inside ADOPT-004.

## 6. Customer / support feedback classes

Every item SHALL be classified as exactly one of:

| Class                    | Meaning                                          |
| ------------------------ | ------------------------------------------------ |
| Bug                      | Defect against packaged 1.0.0 intended behaviour |
| Operational Issue        | Runtime / config / capacity / process            |
| Documentation Issue      | Incorrect or missing docs                        |
| Training Issue           | User education gap                               |
| Enhancement              | Improvement within current product scope         |
| Future Capability        | Beyond current Law surface                       |
| Architecture Observation | Structural note — no implementation              |

**No engineering begins** from feedback alone.

## 7. Prohibitions

- Feature development
- Architecture redesign
- Silent in-repo defect fixes without Owner-authorised remediation
- Fabricating operational metrics
- Implementing monitoring/dashboard tooling in this programme
- Modifying enterprise governance or standards
- Opening Product Readiness / Adoption Certification without Board

## 8. Reviews

See [LAW-OPS-REVIEW-CALENDAR.md](./LAW-OPS-REVIEW-CALENDAR.md).
