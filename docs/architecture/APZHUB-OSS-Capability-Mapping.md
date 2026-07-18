# APZHUB OSS Capability Mapping

**Milestone:** OSS-001 (amended by OSS-002)  
**Status:** Authoritative capability map — OSS-backed and native

---

## Mapping table

| Engine            | APZHUB User Name    | Platform Service            | Boundary            | Module                | Wave | Type       |
| ----------------- | ------------------- | --------------------------- | ------------------- | --------------------- | ---- | ---------- |
| Plane             | Projects            | `ProjectService`            | `PlaneAdapter`      | `projects`            | 1    | OSS        |
| Kimai             | Time Tracking       | `TimeTrackingService`       | `KimaiAdapter`      | `time-tracking`       | 2    | OSS        |
| Paperless-ngx     | Documents           | `DocumentService`           | `PaperlessAdapter`  | `documents`           | 3    | OSS        |
| Zammad            | Support             | `SupportService`            | `ZammadAdapter`     | `support`             | 4    | OSS        |
| _(APZHUB native)_ | Quality Engineering | `QualityEngineeringService` | Native engine       | `quality-engineering` | 5    | **Native** |
| Metabase          | Analytics           | `AnalyticsService`          | `MetabaseAdapter`   | `analytics`           | 6    | OSS        |
| n8n               | Automation          | `AutomationService`         | `N8nAdapter`        | `automation`          | 7    | OSS        |
| Grafana           | Observability UI    | `ObservabilityService`      | `GrafanaAdapter`    | _(admin)_             | 8    | OSS        |
| Prometheus        | Metrics             | `ObservabilityService`      | `PrometheusAdapter` | _(admin)_             | 8    | OSS        |
| Loki              | Logs                | `ObservabilityService`      | `LokiAdapter`       | _(admin)_             | 8    | OSS        |
| Greenbone         | Vulnerability Mgmt  | `SecurityOpsService`        | `GreenboneAdapter`  | _(security admin)_    | 9    | OSS        |
| MobSF             | Mobile Security     | `SecurityOpsService`        | `MobSFAdapter`      | _(security admin)_    | 9    | OSS        |
| Faraday           | Pen Test Mgmt       | `SecurityOpsService`        | `FaradayAdapter`    | _(security admin)_    | 9    | OSS        |

**OSS-002:** Kiwi TCMS removed — superseded by native Quality Engineering (Wave 5).

---

## Platform Core capability consumption

| APZHUB Capability        | Integration usage                                       |
| ------------------------ | ------------------------------------------------------- |
| Platform Runtime         | Module/service manifest discovery                       |
| Platform Bootstrap       | Diagnostics extension per adapter or native engine      |
| Platform Identity        | Tenant + user mapping                                   |
| Platform Authorization   | Permission checks in services                           |
| Platform Personalisation | Module layout preferences                               |
| Platform Governance      | Feature enablement per product                          |
| Platform Provisioning    | Tenant engine or QE workspace provisioning              |
| Platform Security        | API guards, traffic, session                            |
| Platform Configuration   | Engine connection config (OSS) or storage refs (native) |
| Platform Operations      | Connector/native health in control plane                |
| Platform Lifecycle       | Product participation registration                      |
| Search (020)             | Provider registration per service                       |
| Notifications (021)      | Event → notification routes                             |
| Activity (007)           | Activity mappers per domain                             |
| API Gateway (010)        | All client APIs                                         |

Native capabilities consume the same Platform Core surfaces — without an OSS adapter.

---

## Cross-product links (post Wave 3)

| From                | To            | Link type                             |
| ------------------- | ------------- | ------------------------------------- |
| Projects            | Time Tracking | Issue ↔ time entry                    |
| Projects            | Documents     | Issue ↔ document                      |
| Support             | Projects      | Ticket ↔ issue                        |
| Quality Engineering | Projects      | Defect link, release gate ↔ milestone |
| Quality Engineering | Automation    | Gate events → workflows (Wave 7)      |
| Analytics           | All           | Dashboard data sources                |
| Automation          | All           | Workflow triggers                     |

---

## Native products (not OSS-backed)

| Product                 | Wave / track     | Relationship                                          |
| ----------------------- | ---------------- | ----------------------------------------------------- |
| **Quality Engineering** | Wave 5 (QE-001+) | Native capability; Playwright-first                   |
| Law Platform            | LAW-xxx          | Vertical product; may link to QE, Documents, Projects |
| Trust Accounting        | LAW-015          | Law module; no OSS engine                             |
| Platform Core           | PCv2             | Foundation for all capabilities                       |

---

## Related

- [Capability Abstraction Standard](./APZHUB-Capability-Abstraction-Standard.md)
- [OSS Product Integration Catalog](./APZHUB-OSS-Product-Integration-Catalog.md)
- [Quality Engineering Platform Strategy](../strategy/APZHUB-Quality-Engineering-Platform-Strategy.md)
- [Document 002 — Terminology](../002-product-naming-positioning-terminology-standard.md)
