# APZHUB Platform Operations Framework

> **Programme:** APZHUB-OPERATIONS-001 (framework) · **APZHUB-OPS-002** (1.2.0 production readiness — active)  
> **Title:** APZHUB Platform Operations Framework  
> **Classification:** DOCUMENTATION ONLY / OPERATIONS  
> **Status:** Framework **ACCEPTED / CLOSED** · OPS-001 **ACCEPTED** · [OPS-002](./platform-1.2.0-production-readiness/README.md) **Awaiting Owner Production Acceptance**  
> **Production Baseline:** APZHUB Platform **1.2.0** (**ACCEPTED** · RELEASE-001)  
> **OPS-002 recommendation:** **READY FOR OWNER PRODUCTION ACCEPTANCE**  
> **Standard:** [Platform Delivery Standard](../engineering/platform-delivery/PLATFORM-DELIVERY-STANDARD.md)  
> **Date:** 2026-07-22  
> **Bootstrap:** AI-MANIFEST · repository evidence only  
> **Engineering:** **None authorised**

---

## Purpose

Official **operational governance** for APZHUB as a production enterprise platform after Release **1.1.0**.

This framework defines how the platform is **operated**, **supported**, **changed**, **monitored**, and **recovered** — not how features are engineered.

It complements (does not replace):

| Layer                                                       | Path                                                                                           |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Constitution / foundation 000–029                           | `docs/`                                                                                        |
| Knowledge Foundation                                        | `docs/foundation/`                                                                             |
| Platform Delivery Standard                                  | `docs/engineering/platform-delivery/`                                                          |
| Platform **1.1.0** certification                            | `docs/releases/platform/1.1.0/`                                                                |
| **Engineering Operating Model** (prior OPERATIONS-001 wave) | [ENGINEERING-OPERATING-MODEL.md](./ENGINEERING-OPERATING-MODEL.md) and related `*-STANDARD.md` |

---

## Start here

| Audience               | Document                                                                                                                                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Platform 1.2.0 cutover | [platform-1.2.0-production-readiness](./platform-1.2.0-production-readiness/README.md) — **APZHUB-OPS-002**                                                                                                                     |
| Everyone               | [OPERATIONS-VISION.md](./OPERATIONS-VISION.md) · [OPERATING-MODEL.md](./OPERATING-MODEL.md)                                                                                                                                     |
| Service owners         | [SERVICE-CATALOGUE.md](./SERVICE-CATALOGUE.md) · [SUPPORTED-SERVICES.md](./SUPPORTED-SERVICES.md) · [SUPPORTED-PRODUCTS.md](./SUPPORTED-PRODUCTS.md)                                                                            |
| Support / on-call      | [SUPPORT-MODEL.md](./SUPPORT-MODEL.md) · [INCIDENT-MANAGEMENT.md](./INCIDENT-MANAGEMENT.md) · [RUNBOOK-STANDARDS.md](./RUNBOOK-STANDARDS.md) · [runbooks/](./runbooks/README.md)                                                |
| Change / release       | [CHANGE-MANAGEMENT.md](./CHANGE-MANAGEMENT.md) · [RELEASE-MANAGEMENT.md](./RELEASE-MANAGEMENT.md) · [DEPLOYMENT-STRATEGY.md](./DEPLOYMENT-STRATEGY.md)                                                                          |
| Resilience             | [BACKUP-AND-RECOVERY.md](./BACKUP-AND-RECOVERY.md) · [BACKUP-RESTORE-DRILL-RUNBOOK.md](./BACKUP-RESTORE-DRILL-RUNBOOK.md) · [DISASTER-RECOVERY.md](./DISASTER-RECOVERY.md) · [BUSINESS-CONTINUITY.md](./BUSINESS-CONTINUITY.md) |
| Observability          | [MONITORING-AND-ALERTING.md](./MONITORING-AND-ALERTING.md) · [SERVICE-HEALTH.md](./SERVICE-HEALTH.md) · [OPERATIONAL-DASHBOARDS.md](./OPERATIONAL-DASHBOARDS.md)                                                                |
| Security / compliance  | [SECURITY-OPERATIONS.md](./SECURITY-OPERATIONS.md) · [COMPLIANCE-OPERATIONS.md](./COMPLIANCE-OPERATIONS.md) · [AUDIT-OPERATIONS.md](./AUDIT-OPERATIONS.md)                                                                      |
| Levels / capacity      | [SERVICE-LEVELS.md](./SERVICE-LEVELS.md) · [CAPACITY-PLANNING.md](./CAPACITY-PLANNING.md) · [HOST-COEXISTENCE-CONTROLS.md](./HOST-COEXISTENCE-CONTROLS.md) · [PERFORMANCE-MANAGEMENT.md](./PERFORMANCE-MANAGEMENT.md)           |
| Risk / roadmap         | [OPERATIONAL-RISK-REGISTER.md](./OPERATIONAL-RISK-REGISTER.md) · [OPERATIONS-ROADMAP.md](./OPERATIONS-ROADMAP.md)                                                                                                               |

---

## Platform Operations Framework catalogue

| Document                     | Path                                                           |
| ---------------------------- | -------------------------------------------------------------- |
| Operations Vision            | [OPERATIONS-VISION.md](./OPERATIONS-VISION.md)                 |
| Operating Model              | [OPERATING-MODEL.md](./OPERATING-MODEL.md)                     |
| Service Catalogue            | [SERVICE-CATALOGUE.md](./SERVICE-CATALOGUE.md)                 |
| Supported Services           | [SUPPORTED-SERVICES.md](./SUPPORTED-SERVICES.md)               |
| Supported Products           | [SUPPORTED-PRODUCTS.md](./SUPPORTED-PRODUCTS.md)               |
| Support Model                | [SUPPORT-MODEL.md](./SUPPORT-MODEL.md)                         |
| Incident Management          | [INCIDENT-MANAGEMENT.md](./INCIDENT-MANAGEMENT.md)             |
| Problem Management           | [PROBLEM-MANAGEMENT.md](./PROBLEM-MANAGEMENT.md)               |
| Change Management            | [CHANGE-MANAGEMENT.md](./CHANGE-MANAGEMENT.md)                 |
| Release Management           | [RELEASE-MANAGEMENT.md](./RELEASE-MANAGEMENT.md)               |
| Configuration Management     | [CONFIGURATION-MANAGEMENT.md](./CONFIGURATION-MANAGEMENT.md)   |
| Deployment Strategy          | [DEPLOYMENT-STRATEGY.md](./DEPLOYMENT-STRATEGY.md)             |
| Backup and Recovery          | [BACKUP-AND-RECOVERY.md](./BACKUP-AND-RECOVERY.md)             |
| Disaster Recovery            | [DISASTER-RECOVERY.md](./DISASTER-RECOVERY.md)                 |
| Business Continuity          | [BUSINESS-CONTINUITY.md](./BUSINESS-CONTINUITY.md)             |
| Service Levels (SLA/OLA/KPI) | [SERVICE-LEVELS.md](./SERVICE-LEVELS.md)                       |
| Runbook Standards            | [RUNBOOK-STANDARDS.md](./RUNBOOK-STANDARDS.md)                 |
| Monitoring and Alerting      | [MONITORING-AND-ALERTING.md](./MONITORING-AND-ALERTING.md)     |
| Security Operations          | [SECURITY-OPERATIONS.md](./SECURITY-OPERATIONS.md)             |
| Compliance Operations        | [COMPLIANCE-OPERATIONS.md](./COMPLIANCE-OPERATIONS.md)         |
| Audit Operations             | [AUDIT-OPERATIONS.md](./AUDIT-OPERATIONS.md)                   |
| Capacity Planning            | [CAPACITY-PLANNING.md](./CAPACITY-PLANNING.md)                 |
| Performance Management       | [PERFORMANCE-MANAGEMENT.md](./PERFORMANCE-MANAGEMENT.md)       |
| Service Health               | [SERVICE-HEALTH.md](./SERVICE-HEALTH.md)                       |
| Operational Dashboards       | [OPERATIONAL-DASHBOARDS.md](./OPERATIONAL-DASHBOARDS.md)       |
| Operational Risk Register    | [OPERATIONAL-RISK-REGISTER.md](./OPERATIONAL-RISK-REGISTER.md) |
| Operations Roadmap           | [OPERATIONS-ROADMAP.md](./OPERATIONS-ROADMAP.md)               |
| Completion Report            | [COMPLETION-REPORT.md](./COMPLETION-REPORT.md)                 |
| Acceptance Report            | [ACCEPTANCE-REPORT.md](./ACCEPTANCE-REPORT.md)                 |

---

## Engineering Operating Model (prior wave — retained)

| Document                     | Path                                                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Engineering Operating Model  | [ENGINEERING-OPERATING-MODEL.md](./ENGINEERING-OPERATING-MODEL.md)                                                  |
| Release Management Standard  | [RELEASE-MANAGEMENT-STANDARD.md](./RELEASE-MANAGEMENT-STANDARD.md)                                                  |
| Change Management Standard   | [CHANGE-MANAGEMENT-STANDARD.md](./CHANGE-MANAGEMENT-STANDARD.md)                                                    |
| Incident Management Standard | [INCIDENT-MANAGEMENT-STANDARD.md](./INCIDENT-MANAGEMENT-STANDARD.md)                                                |
| Production Support Standard  | [PRODUCTION-SUPPORT-STANDARD.md](./PRODUCTION-SUPPORT-STANDARD.md)                                                  |
| Hotfix Policy                | [HOTFIX-POLICY.md](./HOTFIX-POLICY.md)                                                                              |
| Definition of Ready / Done   | [DEFINITION-OF-READY.md](./DEFINITION-OF-READY.md) · [DEFINITION-OF-DONE.md](./DEFINITION-OF-DONE.md)               |
| Code Review / Branching      | [CODE-REVIEW-STANDARD.md](./CODE-REVIEW-STANDARD.md) · [BRANCHING-AND-VERSIONING.md](./BRANCHING-AND-VERSIONING.md) |
| Product / Platform Lifecycle | [PRODUCT-LIFECYCLE.md](./PRODUCT-LIFECYCLE.md) · [PLATFORM-LIFECYCLE.md](./PLATFORM-LIFECYCLE.md)                   |
| AI Engineering Operations    | [AI-ENGINEERING-OPERATIONS.md](./AI-ENGINEERING-OPERATIONS.md)                                                      |

---

## Explicit non-goals (this programme)

Do **not** implement monitoring stacks, dashboards, Email SoR, Release 1.2, or redesign platforms under this documentation programme.

## Recommendation

# OPERATIONS FRAMEWORK READY
