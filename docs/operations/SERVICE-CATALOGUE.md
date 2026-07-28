# APZHUB Service Catalogue

> **Programme:** APZHUB-OPERATIONS-001  
> **Date:** 2026-07-20  
> **Baseline:** Platform **1.1.0**

---

## Catalogue classes

| Class                       | Description                                                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Platform shared services    | Identity, Gateway, AuthZ, Search, Events, Notifications Attention, Automation, Provisioning, Observability metadata |
| Commercial product services | Projects, Time, Support, Documents, TCMS, Analytics, Workflow, Law                                                  |
| Infrastructure services     | PostgreSQL, Redis, S3-compatible storage, reverse proxy/TLS, Docker host                                            |
| Backend engines (masked)    | Plane, Kimai, Zammad, Paperless, Metabase, n8n, GHA — operated via adapters; not user-facing brands                 |

## Platform shared services (operational)

| Service                | User name                | Ops key             | Health source                         |
| ---------------------- | ------------------------ | ------------------- | ------------------------------------- |
| Identity / AuthN       | Sign-in                  | `identity`          | BetterAuth / identity services        |
| Authorization          | Permissions              | `authz`             | PermissionService / RequestPipeline   |
| API Gateway            | APZHUB APIs              | `gateway`           | `/api/v1/health` · gateway readiness  |
| Platform Services      | —                        | `platform-services` | Service health facets                 |
| Search                 | Search                   | `search`            | Search Orchestrator / publication     |
| Event Bus              | —                        | `event-bus`         | platform-event-bus · Support publish  |
| Notification Attention | Inbox / toasts           | `enf-attention`     | ENF shell                             |
| Notification SoR       | Notifications (metadata) | `notification-sor`  | APZNOTIFY — delivery frozen           |
| Automation Foundation  | —                        | `automation`        | AutomationFoundation journal          |
| Activity Timeline      | Activity                 | `activity`          | ATF                                   |
| Workflow Platform      | Workflow                 | `workflow`          | Workflow health — execute gated       |
| Analytics Platform     | Analytics                | `analytics`         | Analytics health                      |
| Documents Platform     | Documents                | `documents`         | Document services                     |
| Testing Platform       | Testing                  | `testing`           | Testing / TCMS services               |
| Legal Platform         | Law                      | `law`               | Law platform health                   |
| Observability SoR      | Administration Observe   | `observe`           | Metadata SoR — live telemetry limited |
| Metrics SoR            | Metrics                  | `metrics`           | Metadata SoR                          |
| Configuration / Admin  | Administration           | `config` / `admin`  | Frozen SoRs                           |

## Commercial products

See [SUPPORTED-PRODUCTS.md](./SUPPORTED-PRODUCTS.md).

## Service entry criteria

A service is catalogue-listed when it has: Owner, health signal, runbook pointer, known limitations link, and Support Model coverage.
