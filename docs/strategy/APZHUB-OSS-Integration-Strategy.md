# APZHUB OSS Integration Strategy

> **Milestone:** PCS-001  
> **Status:** Strategic evaluation — planning only  
> **Authority:** [Document 001 — Vision](../001-project-vision-and-guiding-principles.md) · [Integration SDK 026](../026-integration-sdk-adapter-framework-integration-manifest-specification.md) · [Document 008](../008-module-plugin-connector-architecture.md)

---

## Integration principles

1. **Users never see engine UIs** — silent SSO, forward-auth, or token handoff only.
2. **APZHUB terminology only** — Plane → Projects, Kimai → Time Tracking (Document 002).
3. **`integration.yaml` before code** — capability discovery, health, error translation.
4. **Community Edition / self-hosted first** — no mandatory Enterprise Edition.
5. **Connector internal only** — `PlaneClient` never imported outside adapter.
6. **Replaceable adapters** — engine swap must not break Platform Service contract.

**Standard integration pattern per engine:**

```text
Module UI → Platform Service → Service Connector (Adapter) → OSS Engine API
                ↓
         Auth bridge, role mapping, audit, health, diagnostics
```

---

## Integration evaluation matrix

| OSS Product                 | APZHUB name           | Priority      | Why                                     | Ownership         |
| --------------------------- | --------------------- | ------------- | --------------------------------------- | ----------------- |
| **Plane**                   | Projects              | **P1**        | Core productivity; validates M9 pattern | Platform team     |
| **Paperless-ngx**           | Documents             | **P1**        | Document-heavy workflows; Law synergy   | Platform team     |
| **Kimai**                   | Time Tracking         | **P1**        | Billing linkage; professional services  | Platform team     |
| **Metabase**                | Analytics             | P2            | Dashboards without building BI          | Platform team     |
| **n8n**                     | Automation            | P2            | Workflow; action gateway target         | Platform team     |
| **Zammad**                  | Support               | P2            | Ticketing; ops + client support         | Platform team     |
| **Kiwi TCMS**               | Testing               | P3            | Test management; QA workflows           | Platform team     |
| **Grafana**                 | Observability UI      | P2 (PCv2)     | Ops dashboards behind connector         | Platform ops      |
| **Prometheus**              | Metrics               | P2 (PCv2)     | Metrics collection                      | Platform ops      |
| **Loki**                    | Logs                  | P2 (PCv2)     | Log aggregation                         | Platform ops      |
| **Greenbone**               | Vulnerability Mgmt    | P3            | Enterprise security pack                | Platform security |
| **Faraday**                 | Penetration Test Mgmt | P3            | Security ops                            | Platform security |
| **MobSF**                   | Mobile Security       | P3            | App security scanning                   | Platform security |
| **Better Auth**             | Authentication        | **Delivered** | Primary auth layer                      | Platform Core     |
| **Authentik**               | Legacy SSO            | Coexist       | Legacy stack migration                  | Platform ops      |
| **Ollama / local LLM**      | AI (local)            | P2            | Self-hosted AI                          | Platform AI       |
| **OpenAI / Anthropic APIs** | AI (cloud)            | P3            | Optional cloud models                   | Platform AI       |

---

## Per-product integration specification

### Plane → Projects (P1)

| Aspect             | Approach                                                                              |
| ------------------ | ------------------------------------------------------------------------------------- |
| **Why**            | Project/task management is foundational productivity; avoids building PM from scratch |
| **Ownership**      | `ProjectService` + `PlaneAdapter`                                                     |
| **Integration**    | REST API; CE self-hosted                                                              |
| **Authentication** | Service account token + per-user SSO mapping via Platform Identity                    |
| **Authorization**  | APZHUB permissions → Plane workspace/project roles (never expose Plane roles in UI)   |
| **Provisioning**   | Governance enablement → create Plane workspace per tenant                             |
| **Diagnostics**    | Connector health, sync lag, API latency in Operations Console                         |
| **Upgrade**        | Pin CE version; integration contract tests; staged rollout per tenant                 |
| **Replacement**    | Alternative PM engine via new adapter implementing `ProjectService` interface         |

### Paperless-ngx → Documents (P1)

| Aspect             | Approach                                                                   |
| ------------------ | -------------------------------------------------------------------------- |
| **Why**            | Document management is expensive to build; OCR/tagging mature in Paperless |
| **Ownership**      | `DocumentService` + `PaperlessAdapter`                                     |
| **Integration**    | REST API; consume + metadata sync                                          |
| **Authentication** | API token per tenant; user mapping for audit attribution                   |
| **Authorization**  | Matter/project scope mapped to Paperless tags/correspondents               |
| **Provisioning**   | Tenant onboarding creates Paperless tenant structure                       |
| **Diagnostics**    | Index lag, storage health, OCR queue depth                                 |
| **Upgrade**        | Version pin; document type mapping regression tests                        |
| **Replacement**    | S3 + custom index adapter (long-term option)                               |

### Kimai → Time Tracking (P1)

| Aspect             | Approach                                               |
| ------------------ | ------------------------------------------------------ |
| **Why**            | Time → billing linkage; professional services standard |
| **Ownership**      | `TimeTrackingService` + `KimaiAdapter`                 |
| **Integration**    | REST API                                               |
| **Authentication** | API user per tenant; SSO token bridge                  |
| **Authorization**  | APZHUB roles → Kimai team visibility                   |
| **Provisioning**   | Tenant → Kimai instance/customer                       |
| **Diagnostics**    | Sync status, unbilled hours count                      |
| **Upgrade**        | Kimai CE version matrix                                |
| **Replacement**    | Native time module (high cost — defer)                 |

### Metabase → Analytics (P2)

| Aspect             | Approach                                                 |
| ------------------ | -------------------------------------------------------- |
| **Why**            | BI dashboards without building analytics engine          |
| **Ownership**      | `AnalyticsService` + `MetabaseAdapter`                   |
| **Integration**    | Embedded dashboards via signed URLs; admin API for setup |
| **Authentication** | JWT embedding + Metabase groups mapped from APZHUB roles |
| **Authorization**  | Dashboard collection per tenant/product                  |
| **Provisioning**   | Tenant → Metabase group + data sandbox                   |
| **Diagnostics**    | Query performance, connection health                     |
| **Upgrade**        | Metabase version; embed SDK compatibility                |
| **Replacement**    | Apache Superset adapter (alternative OSS)                |

### n8n → Automation (P2)

| Aspect             | Approach                                                        |
| ------------------ | --------------------------------------------------------------- |
| **Why**            | Action Framework gateway target; workflow without custom engine |
| **Ownership**      | `AutomationService` + `N8nAdapter`                              |
| **Integration**    | Webhook triggers + n8n API                                      |
| **Authentication** | Webhook signing + API keys in Vault (PCv2)                      |
| **Authorization**  | Workflow execution gated by APZHUB permissions                  |
| **Provisioning**   | Tenant workflow namespace                                       |
| **Diagnostics**    | Execution failures, queue depth                                 |
| **Upgrade**        | Workflow export/import for migration                            |
| **Replacement**    | Temporal/Camunda (heavier — only if n8n limits hit)             |

### Zammad → Support (P2)

| Aspect             | Approach                                     |
| ------------------ | -------------------------------------------- |
| **Why**            | Ticketing standard; client support workflows |
| **Ownership**      | `SupportService` + `ZammadAdapter`           |
| **Integration**    | REST API + email channel                     |
| **Authentication** | Token + SSO                                  |
| **Authorization**  | APZHUB roles → Zammad groups                 |
| **Provisioning**   | Tenant → Zammad organization                 |
| **Diagnostics**    | Ticket sync, SLA breach signals              |
| **Upgrade**        | Zammad CE version pin                        |
| **Replacement**    | Native ticketing (high cost)                 |

### Kiwi TCMS → Testing (P3)

| Aspect             | Approach                                                 |
| ------------------ | -------------------------------------------------------- |
| **Why**            | Test case management; QA traceability                    |
| **Ownership**      | `TestingService` + `KiwiAdapter`                         |
| **Integration**    | Kiwi XML-RPC/REST API                                    |
| **Authentication** | Service account                                          |
| **Authorization**  | Product/project scoped test plans                        |
| **Provisioning**   | Tenant → Kiwi classification                             |
| **Diagnostics**    | Sync health, test run status                             |
| **Upgrade**        | Kiwi version matrix                                      |
| **Replacement**    | Integrate with Playwright reporting only (reduced scope) |

### Grafana / Prometheus / Loki (P2 — PCv2)

| Aspect             | Approach                                                     |
| ------------------ | ------------------------------------------------------------ |
| **Why**            | Document 014 observability; operators need dashboards        |
| **Ownership**      | Platform observability connectors (not user modules)         |
| **Integration**    | Prometheus scrape; Loki push; Grafana provisioned dashboards |
| **Authentication** | Operator-only; Administration workspace embed                |
| **Authorization**  | `platform.nav.administration.view` + ops tier                |
| **Provisioning**   | Deploy with platform stack; tenant metrics labels            |
| **Diagnostics**    | Self-health of observability stack                           |
| **Upgrade**        | Helm/compose version pins                                    |
| **Replacement**    | Vendor-neutral OpenTelemetry collector                       |

### Greenbone / Faraday / MobSF (P3 — Enterprise)

| Aspect             | Approach                                         |
| ------------------ | ------------------------------------------------ |
| **Why**            | Security/compliance vertical for enterprise tier |
| **Ownership**      | Security connector pack                          |
| **Integration**    | API + scheduled scans                            |
| **Authentication** | Service accounts; results in platform audit      |
| **Authorization**  | Security admin role only                         |
| **Provisioning**   | Per-tenant scan targets (governed)               |
| **Diagnostics**    | Scan status, vulnerability counts (masked)       |
| **Upgrade**        | Engine version + signature updates               |
| **Replacement**    | Commercial scanner adapters (build vs buy)       |

### Better Auth vs Authentik

| Engine          | Role                  | Strategy                                                                                  |
| --------------- | --------------------- | ----------------------------------------------------------------------------------------- |
| **Better Auth** | **Sole APZHUB AuthN** | **IN FORCE** — [OWNER-BETTERAUTH-SOLE-AUTHN](../decisions/OWNER-BETTERAUTH-SOLE-AUTHN.md) |
| **Authentik**   | Legacy host SSO only  | **Coexist → retire with APZPRD** — no new Authentik features; no APZHUB login dependency  |

---

## Future AI tooling

| Tool class                             | Strategy                                                 |
| -------------------------------------- | -------------------------------------------------------- |
| **Local models (Ollama, llama.cpp)**   | Self-hosted; privacy-first; default for enterprise       |
| **Cloud APIs (OpenAI, Anthropic)**     | Optional; governance-gated; no training on customer data |
| **RAG stores (Qdrant, pgvector)**      | Derived index; not SoR                                   |
| **Agent frameworks (LangGraph, etc.)** | Behind Platform AI service — not in modules              |

See [AI Strategy](./APZHUB-AI-Strategy.md).

---

## Integration sequencing

> **Owner-approved wave order (2026-07-08):** See [PCS-001 Owner Approval](./PCS-001-owner-approval.md).

```text
Phase 0: PCv2-01 hardening (no OSS integrations)
Phase 1: PCv2-02 workers + M17 CI/CD
Phase 2 — OSS Waves:
  Wave 1: Plane (Projects)
  Wave 2: Kimai (Time Tracking)
  Wave 3: Paperless-ngx (Documents)
  Wave 4: Zammad (Support)
  Wave 5: Kiwi TCMS (Testing)
  Wave 6: Metabase (Analytics)
  Wave 7: n8n (Automation)
  Wave 8: Grafana / Prometheus / Loki (Observability)
  Wave 9: Greenbone / MobSF / Faraday (Security Ops)
Phase 3: AI connectors (governed)
```

**Gate:** Each wave requires approved sprint guide + `integration.yaml` + health + E2E smoke. Wave 1 starts after M17 minimum CI coverage for worker deployments.

---

## Highest-value OSS integrations (strategic answer)

**Wave 1–3 (productivity core):** Plane → Kimai → Paperless-ngx — owner-approved order.  
**Wave 4–5:** Zammad, Kiwi TCMS — support and QA linked to projects.  
**Wave 6–7:** Metabase, n8n — analytics and automation across platform data.  
**Wave 8:** Grafana/Prometheus/Loki — observability.  
**Wave 9:** Greenbone/MobSF/Faraday — enterprise security ops.

---

## References

- [Build vs Buy Strategy](./APZHUB-Build-vs-Buy-Strategy.md)
- [Product Portfolio Strategy](./APZHUB-Product-Portfolio-Strategy.md)
- [Engineering Roadmap](./APZHUB-Engineering-Roadmap.md)
