# OPERATIONS-HANDBOOK — APZQEP Version 1.0 GA

| Field       | Value                  |
| ----------- | ---------------------- |
| Programme   | APZQEP-OPS-001         |
| Timestamp   | 20260803T072224Z       |
| Authority   | Operational Governance |
| Engineering | **NONE**               |

## 1. Purpose

Operate APZQEP Version 1.0 in General Availability under controlled operational governance. Engineering remains closed. Change is evidence-driven.

## 2. Management transition

| Era                        | Mode                                  |
| -------------------------- | ------------------------------------- |
| Through PBR-APZQEP-1.0-001 | Engineering-led delivery              |
| From APZQEP-OPS-001        | **Operations-led** product management |

Rules:

1. Engineering reacts only to validated operational evidence and Owner Authorisation.
2. Product Board priorities come from production data, feedback, and support trends.
3. Version 1.1 opens only after sufficient evidence and Board authorisation.

## 3. Operational areas

| Area                | Owner focus                    | Primary artefacts                                                  |
| ------------------- | ------------------------------ | ------------------------------------------------------------------ |
| System availability | Uptime, health facets          | Dashboard, health checks                                           |
| Performance         | Latency, responsiveness        | Dashboard, intelligence                                            |
| Security            | Auth failures, security events | Incident process, dashboard                                        |
| Operational health  | DB, queues, workers            | Monitoring guides                                                  |
| Product usage       | Caps A–F activity              | Product intelligence                                               |
| Quality metrics     | Execution / defect / coverage  | Product intelligence                                               |
| Support             | Procedures, tickets            | [SUPPORT-PROCEDURES](../apzqep-150/ops/SUPPORT-PROCEDURES.md)      |
| Customer feedback   | Classified intake              | Feedback model (below)                                             |
| Incidents           | Register + severity            | [PRODUCTION-INCIDENT-PROCESS.md](./PRODUCTION-INCIDENT-PROCESS.md) |
| Release stability   | Deploy/rollback evidence       | Ops runbooks                                                       |
| Known limitations   | Accepted residuals             | [KNOWN-ISSUES-REGISTER.md](./KNOWN-ISSUES-REGISTER.md)             |
| Technical debt      | Observation only               | Known issues / enhancement                                         |
| Enhancements        | Governed backlog               | [ENHANCEMENT-REGISTER.md](./ENHANCEMENT-REGISTER.md)               |

## 4. Baseline operational procedures

Do not duplicate; consume:

| Topic               | Path                                                                                                                                          |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Deployment          | [DEPLOYMENT-GUIDE](../apzqep-150/ops/DEPLOYMENT-GUIDE.md)                                                                                     |
| Upgrade / rollback  | [UPGRADE-GUIDE](../apzqep-150/ops/UPGRADE-GUIDE.md) · [ROLLBACK-GUIDE](../apzqep-150/ops/ROLLBACK-GUIDE.md)                                   |
| Backup / restore    | [BACKUP-PROCEDURE](../apzqep-150/ops/BACKUP-PROCEDURE.md) · [RESTORE-PROCEDURE](../apzqep-150/ops/RESTORE-PROCEDURE.md)                       |
| Monitoring / alerts | [MONITORING-GUIDE](../apzqep-150/ops/MONITORING-GUIDE.md) · [ALERT-CATALOGUE](../apzqep-150/ops/ALERT-CATALOGUE.md)                           |
| Health              | [HEALTH-CHECKS](../apzqep-150/ops/HEALTH-CHECKS.md)                                                                                           |
| Runbook             | [OPERATIONAL-RUNBOOK](../apzqep-150/ops/OPERATIONAL-RUNBOOK.md)                                                                               |
| DR                  | [DISASTER-RECOVERY-CHECKLIST](../apzqep-150/ops/DISASTER-RECOVERY-CHECKLIST.md)                                                               |
| Configuration       | [CONFIGURATION-GUIDE](../apzqep-150/ops/CONFIGURATION-GUIDE.md) · [ENVIRONMENT-CONFIGURATION](../apzqep-150/ops/ENVIRONMENT-CONFIGURATION.md) |

Note: Historical apzqep-150 ops text may still describe pre-151/152 conditions. Authoritative product state is [PRODUCT-STATUS.md](../../PRODUCT-STATUS.md). Prefer 151/152/150R/PBR packs on conflict.

## 5. Customer feedback model

Every item SHALL be classified as exactly one of:

| Class                    | Meaning                                       |
| ------------------------ | --------------------------------------------- |
| Bug                      | Defect against Version 1.0 intended behaviour |
| Operational Issue        | Runtime / config / capacity / process         |
| Documentation Issue      | Incorrect or missing docs                     |
| Training Issue           | User education gap                            |
| Enhancement              | Improvement within current product scope      |
| Future Capability        | Beyond Version 1.0 surface                    |
| Architecture Observation | Structural note — no implementation           |

Every enhancement request SHALL record: Identifier, Description, Business value, Priority, Impact, Evidence. **No engineering begins** from feedback alone.

## 6. Prohibitions

- Develop features
- Redesign architecture
- Open Version 1.1
- Promote speculative enhancements
- Implement AI functionality
- Modify engineering governance standards
- Fix defects in-repo without a separate Owner-authorised remediation programme

## 7. Reviews

See [PRODUCT-BOARD-REVIEW-CALENDAR.md](./PRODUCT-BOARD-REVIEW-CALENDAR.md).
