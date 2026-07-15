# APZHUB OSS Product Integration Catalog

**Milestone:** OSS-001  
**Status:** Authoritative per-product integration specifications  
**Type:** Planning only — no production code

Each product follows the [OSS Integration Master Architecture](./APZHUB-OSS-Integration-Master-Architecture.md). All products consume Platform Core; no exceptions to identity, authorization, operations, or lifecycle ownership.

---

## Wave 1 — Plane → Projects

| Field | Specification |
|-------|---------------|
| **Purpose** | Project and work-item management for all APZHUB tenants |
| **Business capability** | Projects (tasks, cycles, modules, views) |
| **Why selected** | Mature OSS PM; validates first full Module→Service→Adapter pattern; high user value |
| **Alternatives considered** | OpenProject (heavier ops), Taiga (smaller ecosystem), native build (XL cost) |
| **Integration architecture** | `ProjectService` + `PlaneAdapter`; REST CE API; async sync via outbox (PCv2-02) |
| **Authentication model** | Better Auth SSO + per-tenant Plane service token; user mapping via Identity |
| **Provisioning model** | Governance enablement → provision Plane workspace per platform tenant |
| **Tenant model** | Platform tenant → Plane workspace; workspace ID in platform metadata |
| **RBAC model** | APZHUB permissions → Plane project roles (never expose Plane role names) |
| **Navigation integration** | Projects module registers activity bar + sidebar via `module.yaml` |
| **Workbench integration** | Project list, board, issue detail workspaces |
| **Search integration** | Search provider indexes project/issue metadata (async) |
| **Knowledge integration** | Link issues to documents/matters where applicable |
| **Notification integration** | Events: assignment, status change, comment → ENF |
| **Activity integration** | Activity mappers for issue lifecycle |
| **API integration** | `/api/platform/v1/projects/*` via gateway; never Plane API to client |
| **Upgrade strategy** | Pin Plane CE version; adapter contract tests; staged tenant rollout |
| **Backup strategy** | Plane Postgres backup per engine DR runbook |
| **Disaster recovery** | Restore Plane DB + replay platform sync from outbox |
| **Monitoring** | Connector latency, sync lag, error rate in ops control plane |
| **Operational ownership** | Platform team (connector); ops for engine health |
| **Exit strategy** | Export issues via Plane API; platform metadata retained |
| **Replacement strategy** | New adapter implementing `ProjectService` interface |
| **Licensing considerations** | Plane CE self-hosted; no EE dependency |
| **Future enhancements** | Cycles analytics, cross-product linking to Time Tracking and Documents |

---

## Wave 2 — Kimai → Time Tracking

| Field | Specification |
|-------|---------------|
| **Purpose** | Time capture and timesheet management |
| **Business capability** | Time Tracking |
| **Why selected** | Professional services standard; billing linkage; complements Projects |
| **Alternatives considered** | Native time module (high cost), Toggl adapter (SaaS), Clockify (cloud) |
| **Integration architecture** | `TimeTrackingService` + `KimaiAdapter`; REST CE API |
| **Authentication model** | API user per tenant + SSO token bridge for attribution |
| **Provisioning model** | Tenant enablement → Kimai customer/team structure |
| **Tenant model** | Platform tenant → Kimai customer |
| **RBAC model** | APZHUB roles → Kimai team visibility and export rights |
| **Navigation integration** | Time Tracking module in activity bar |
| **Workbench integration** | Timesheet entry, timer, approval views |
| **Search integration** | Index time entries by matter/project reference |
| **Knowledge integration** | Link entries to matters and documents |
| **Notification integration** | Missing timesheet, approval required |
| **Activity integration** | Time entry created/approved events |
| **API integration** | Platform Time API only |
| **Upgrade strategy** | Kimai CE version matrix; regression on billing export |
| **Backup strategy** | Kimai DB backup |
| **Disaster recovery** | Restore Kimai + reconcile unbilled hours from platform cache |
| **Monitoring** | Sync status, unbilled hours count in diagnostics |
| **Operational ownership** | Platform team |
| **Exit strategy** | Export timesheets CSV/API |
| **Replacement strategy** | Native time service (defer — high cost) |
| **Licensing considerations** | Kimai CE; self-hosted |
| **Future enhancements** | Billing integration with Law invoicing |

---

## Wave 3 — Paperless-ngx → Documents

| Field | Specification |
|-------|---------------|
| **Purpose** | Document management, OCR, tagging, retrieval |
| **Business capability** | Documents |
| **Why selected** | Mature DMS; Law Platform synergy; OCR/tagging expensive to build |
| **Alternatives considered** | Mayan EDMS, native S3+index, commercial DMS |
| **Integration architecture** | `DocumentService` + `PaperlessAdapter`; REST API + webhook consumption |
| **Authentication model** | API token per tenant; user mapping for audit |
| **Provisioning model** | Tenant onboarding → Paperless correspondents/tags structure |
| **Tenant model** | Platform tenant → tag/correspondent namespace |
| **RBAC model** | Matter/project scope → Paperless tags; permission-filtered search |
| **Navigation integration** | Documents module |
| **Workbench integration** | Inbox, viewer, metadata panel |
| **Search integration** | Primary search provider for document metadata and OCR text |
| **Knowledge integration** | Core knowledge source for unified discovery |
| **Notification integration** | Document processed, shared, expiring |
| **Activity integration** | Upload, tag, share events |
| **API integration** | Platform Document API; file upload via platform storage |
| **Upgrade strategy** | Version pin; document type mapping regression tests |
| **Backup strategy** | Paperless media + DB; S3-compatible storage |
| **Disaster recovery** | Restore storage + reindex search |
| **Monitoring** | Index lag, OCR queue depth, storage health |
| **Operational ownership** | Platform team |
| **Exit strategy** | Bulk export documents + metadata |
| **Replacement strategy** | S3 + custom index adapter |
| **Licensing considerations** | Paperless-ngx OSS; self-hosted |
| **Future enhancements** | Matter auto-filing, trust document linkage |

---

## Wave 4 — Zammad → Support

| Field | Specification |
|-------|---------------|
| **Purpose** | Client and internal support ticketing |
| **Business capability** | Support |
| **Why selected** | Mature ticketing; email channel; CE self-hosted |
| **Alternatives considered** | osTicket, FreeScout, native ticketing (high cost) |
| **Integration architecture** | `SupportService` + `ZammadAdapter`; REST + email |
| **Authentication model** | Token + SSO for agents |
| **Provisioning model** | Tenant → Zammad organization |
| **Tenant model** | Platform tenant → Zammad org |
| **RBAC model** | APZHUB roles → Zammad groups |
| **Navigation integration** | Support module |
| **Workbench integration** | Ticket queue, detail, customer context |
| **Search integration** | Ticket subject/body index |
| **Knowledge integration** | Link tickets to KB articles and matters |
| **Notification integration** | SLA breach, assignment, customer reply |
| **Activity integration** | Ticket lifecycle events |
| **API integration** | Platform Support API |
| **Upgrade strategy** | Zammad CE version pin |
| **Backup strategy** | Zammad DB + attachments |
| **Disaster recovery** | Restore Zammad; replay email ingestion |
| **Monitoring** | Ticket sync, SLA breach signals |
| **Operational ownership** | Platform team |
| **Exit strategy** | Ticket export |
| **Replacement strategy** | Native ticketing (high cost) |
| **Licensing considerations** | Zammad CE |
| **Future enhancements** | Matter-linked tickets for Law Platform |

---

## Wave 5 — APZHUB Quality Engineering Platform (native)

> **OSS-002:** Kiwi TCMS integration **superseded**. Quality Engineering is a native APZHUB capability — not an OSS integration.

| Field | Specification |
|-------|---------------|
| **Purpose** | Unified test management, execution, certification, and quality analytics |
| **Business capability** | Quality Engineering |
| **Why native (OSS-002)** | Playwright-first; AI-native; platform SoR; release gates; commercial potential; UX coherence |
| **Alternatives considered** | Kiwi TCMS (deferred), TestLink, Playwright-only reporting |
| **Integration architecture** | `QualityEngineeringService` + native domain engine — **no OSS adapter** |
| **Authentication model** | Platform Better Auth only — no external engine login |
| **Provisioning model** | Tenant QE workspace seed via Platform Provisioning |
| **Tenant model** | Platform tenant authoritative; RLS on all QE entities |
| **RBAC model** | QE permissions: view, edit, execute, sign-off, admin |
| **Navigation integration** | Quality Engineering module |
| **Workbench integration** | Cases, plans, runs, gates, dashboard |
| **Search integration** | Cases, plans, results metadata index |
| **Knowledge integration** | Requirements ↔ docs ↔ test traceability |
| **Notification integration** | Run failed, gate blocked, assignment |
| **Activity integration** | Execution and certification timeline |
| **API integration** | Platform Quality Engineering API (gateway only) |
| **Upgrade strategy** | Platform release versioning; no external engine |
| **Backup strategy** | Platform PostgreSQL + object storage for evidence |
| **Disaster recovery** | Platform DR procedures |
| **Monitoring** | Run queue depth, worker health, gate status |
| **Operational ownership** | Platform team |
| **Exit strategy** | Platform export of test assets and evidence metadata |
| **Replacement strategy** | N/A — native SoR; optional commercial TMS adapter future |
| **Licensing considerations** | APZHUB-owned; Playwright OSS; AI providers per AI Strategy |
| **Future enhancements** | AI generation/analysis (QE-010/011), M17 CI gates, Metabase BI (Wave 6) |

See [Quality Engineering Platform Strategy](../strategy/APZHUB-Quality-Engineering-Platform-Strategy.md) and [Quality Engineering Backlog](../backlog/APZHUB-Quality-Engineering-Backlog.md).

---

## Wave 5 (superseded) — Kiwi TCMS

> **Status:** Deferred / superseded by OSS-002. Retained for historical reference only.

Kiwi TCMS was evaluated in OSS-001 and rejected in favour of native Quality Engineering. Do not implement `KiwiAdapter`.

---

## Wave 6 — Metabase → Analytics

| Field | Specification |
|-------|---------------|
| **Purpose** | BI dashboards and ad-hoc analytics |
| **Business capability** | Analytics |
| **Why selected** | Avoid building BI engine; embeddable dashboards |
| **Alternatives considered** | Apache Superset, Redash, native analytics (XL) |
| **Integration architecture** | `AnalyticsService` + `MetabaseAdapter`; embed SDK + admin API |
| **Authentication model** | JWT signed embed + Metabase groups from APZHUB roles |
| **Provisioning model** | Tenant → Metabase group + data sandbox |
| **Tenant model** | Platform tenant → Metabase group/collection |
| **RBAC model** | Dashboard collection per tenant/product |
| **Navigation integration** | Analytics module |
| **Workbench integration** | Embedded dashboard panels (signed URLs) |
| **Search integration** | Dashboard title/description index only |
| **Knowledge integration** | Link dashboards to operational runbooks |
| **Notification integration** | Alert threshold events via Metabase → platform events |
| **Activity integration** | Dashboard viewed/shared (optional) |
| **API integration** | Platform Analytics API for embed token issuance |
| **Upgrade strategy** | Metabase version; embed SDK compatibility |
| **Backup strategy** | Metabase application DB |
| **Disaster recovery** | Restore Metabase; re-provision collections |
| **Monitoring** | Query performance, connection health |
| **Operational ownership** | Platform team |
| **Exit strategy** | Export dashboards/questions |
| **Replacement strategy** | Superset adapter |
| **Licensing considerations** | Metabase OSS; embedding allowed |
| **Future enhancements** | Cross-product dashboards (Projects + Time + Support) |

**Exception:** Embedded Metabase UI inside APZHUB shell only — never direct Metabase login for standard users.

---

## Wave 7 — n8n → Automation

| Field | Specification |
|-------|---------------|
| **Purpose** | Workflow automation and integration orchestration |
| **Business capability** | Automation |
| **Why selected** | Action Framework gateway target; visual workflows without custom engine |
| **Alternatives considered** | Temporal, Camunda, native workflow engine (L) |
| **Integration architecture** | `AutomationService` + `N8nAdapter`; webhooks + API |
| **Authentication model** | Webhook signing + API keys (Vault PCv2-04) |
| **Provisioning model** | Tenant workflow namespace |
| **Tenant model** | Platform tenant → n8n project/tag scope |
| **RBAC model** | Workflow execution gated by APZHUB permissions |
| **Navigation integration** | Automation module |
| **Workbench integration** | Workflow list, execution history |
| **Search integration** | Workflow name/description index |
| **Knowledge integration** | Link workflows to runbooks |
| **Notification integration** | Execution failure → ENF |
| **Activity integration** | Workflow executed events |
| **API integration** | Platform Automation API; Command Palette triggers |
| **Upgrade strategy** | Workflow export/import for migration |
| **Backup strategy** | n8n workflow export + credentials in Vault |
| **Disaster recovery** | Re-import workflows from export |
| **Monitoring** | Execution failures, queue depth |
| **Operational ownership** | Platform team |
| **Exit strategy** | Export all workflows |
| **Replacement strategy** | Temporal (if complexity exceeds n8n) |
| **Licensing considerations** | n8n fair-code; self-hosted sustainable license review |
| **Future enhancements** | Cross-module triggers (Projects → Support → Notify) |

---

## Wave 8 — Grafana / Prometheus / Loki → Observability

| Field | Specification |
|-------|---------------|
| **Purpose** | Platform and integration observability for operators |
| **Business capability** | Observability (operator tier — not end-user module) |
| **Why selected** | Document 014; industry standard OSS observability stack |
| **Alternatives considered** | Datadog (commercial), ELK stack, OpenTelemetry-only |
| **Integration architecture** | Observability connectors in Administration workspace; not user modules |
| **Authentication model** | Operator-only; `platform.nav.administration.view` + ops tier |
| **Provisioning model** | Deploy with platform stack; tenant metric labels |
| **Tenant model** | Tenant ID as metric/log label — not separate Grafana orgs initially |
| **RBAC model** | Security/ops admin only |
| **Navigation integration** | Administration → Observability section |
| **Workbench integration** | Embedded Grafana panels for operators |
| **Search integration** | N/A — logs via Loki query in ops console |
| **Knowledge integration** | Link to DR and incident runbooks |
| **Notification integration** | Alertmanager → platform ops notifications |
| **Activity integration** | Incident declared events (optional) |
| **API integration** | Internal only; proxy via platform ops |
| **Upgrade strategy** | Compose/Helm version pins |
| **Backup strategy** | Prometheus TSDB retention policy; Loki object storage |
| **Disaster recovery** | Redeploy stack; restore Loki from object storage |
| **Monitoring** | Self-health of observability stack in control plane |
| **Operational ownership** | Platform ops |
| **Exit strategy** | Export dashboards; migrate to OTel collector |
| **Replacement strategy** | Vendor-neutral OpenTelemetry backend |
| **Licensing considerations** | AGPL Grafana — embed review; Prometheus/Loki Apache 2.0 |
| **Future enhancements** | Per-tenant dashboard packs, SLO burn alerts |

**Exception:** Operator-tier only — does not register as standard user product module.

---

## Wave 9 — Greenbone / MobSF / Faraday → Security Ops

| Field | Specification |
|-------|---------------|
| **Purpose** | Vulnerability management, mobile app security, penetration test tracking |
| **Business capability** | Security Operations (enterprise tier) |
| **Why selected** | Enterprise security pack; compliance differentiator |
| **Alternatives considered** | OpenVAS standalone, commercial scanners, manual processes |
| **Integration architecture** | Security connector pack; API + scheduled scans |
| **Authentication model** | Service accounts; results in platform audit only |
| **Provisioning model** | Per-tenant scan targets (governance-gated) |
| **Tenant model** | Scan targets scoped to tenant assets |
| **RBAC model** | Security admin role only — never standard users |
| **Navigation integration** | Administration → Security Operations |
| **Workbench integration** | Findings summary, scan status (masked details) |
| **Search integration** | Finding title/CVE index (permission-filtered) |
| **Knowledge integration** | Remediation runbooks |
| **Notification integration** | Critical finding detected |
| **Activity integration** | Scan completed events |
| **API integration** | Internal security API |
| **Upgrade strategy** | Engine version + signature/NVT updates |
| **Backup strategy** | Scan reports in platform audit store |
| **Disaster recovery** | Re-run scans post-restore |
| **Monitoring** | Scan status, vulnerability counts (aggregated) |
| **Operational ownership** | Platform security team |
| **Exit strategy** | Export findings; decommission connectors |
| **Replacement strategy** | Commercial scanner adapters |
| **Licensing considerations** | Greenbone OSS; MobSF OSS; Faraday OSS — verify per deployment |
| **Future enhancements** | CI/CD gate integration, compliance reporting |

**Exception:** Security-admin tier only; findings never expose raw tenant data in standard UI.

---

## Platform Core consumption validation

| Product | Identity | Authz | Ops | Lifecycle | Exception |
|---------|----------|-------|-----|-----------|-----------|
| Plane | ✅ | ✅ | ✅ | ✅ | None |
| Kimai | ✅ | ✅ | ✅ | ✅ | None |
| Paperless | ✅ | ✅ | ✅ | ✅ | None |
| Zammad | ✅ | ✅ | ✅ | ✅ | None |
| Quality Engineering | ✅ | ✅ | ✅ | ✅ | Native — no adapter |
| Metabase | ✅ | ✅ | ✅ | ✅ | Embed UI only |
| n8n | ✅ | ✅ | ✅ | ✅ | None |
| Grafana stack | ✅ | ✅ | ✅ | ✅ | Operator tier |
| Security trio | ✅ | ✅ | ✅ | ✅ | Security admin tier |

---

## Related

- [OSS Capability Mapping](./APZHUB-OSS-Capability-Mapping.md)
- [OSS Integration Standards](../governance/APZHUB-OSS-Integration-Standards.md)
