# Product Engineering Standard

> **Programme:** APZHUB-PRODUCTS-002 · Baseline: Platform 1.4

## Principle

```text
Platform Engineering (CLOSED · Platform 1.4 Maintenance Mode)
        ↓ enables
Product Engineering (DEFAULT development activity)
```

Products **extend** the certified platform. Products do **not** redesign, fork, or silently extend Platform architecture.

## Binding rules

1. **Named Approval required** — no product code without an Owner-authorised programme ID.
2. **Manifest first** — `module.yaml` / `service.yaml` / `integration.yaml` / `event.yaml` / `component.yaml` before implementation where SDK applies.
3. **Layer path mandatory** — Module → Platform Service → Connector → Engine. Never bypass.
4. **User-facing names only** — Projects, Support, Time, … — never Plane, Zammad, Kimai, Metabase, n8n, Paperless in UI.
5. **Platform freezes retained** — Integration SDK **1.0.0**, Workflow Execute gated, Email SoR excluded, SMTP deferred, FIN-001 STOP, WebSockets unauthorised, durable notification flag default OFF — unless a later Owner programme explicitly changes them.
6. **Quality gates inherited** — every product programme must satisfy [PRODUCT-QUALITY-STANDARD.md](./PRODUCT-QUALITY-STANDARD.md).
7. **Certification before release** — [PRODUCT-CERTIFICATION-STANDARD.md](./PRODUCT-CERTIFICATION-STANDARD.md).
8. **Self-hosted OSS first** — Community Edition / self-hosted engines; no mandatory Enterprise Edition dependencies.

## Product types

| Type                | Meaning                                                                   | Examples                                   |
| ------------------- | ------------------------------------------------------------------------- | ------------------------------------------ |
| **Native APZHUB**   | System of Record and UX owned by APZHUB on platform PostgreSQL / modules  | APZ Law, APZ TCMS, APZ Documents (current) |
| **Platform-backed** | UX + Platform Services; business SoR in external OSS engine via connector | APZ Projects (Plane), Support (Zammad), …  |

## Ownership model

| Role                  | Responsibility                                                     |
| --------------------- | ------------------------------------------------------------------ |
| **Owner**             | Approves programmes, ADRs, releases, enablement                    |
| **Product Owner**     | Product backlog, maturity, limitations, roadmap (within Approval)  |
| **Platform**          | Frozen platform capabilities; Maintenance Mode only under Approval |
| **Integration Owner** | Adapter health, engine version matrix, brand masking               |

## Shared platform usage (mandatory consume)

IAM/Authz · API Gateway · Workbench/Shell · Permission-driven UI · Search (providers) · Notifications (events) · Activity · Audit · Configuration · Observability · Provisioning/Governance · Integration SDK · Platform Event Bus

Products must **not** re-implement these.

## Standards index

| Concern       | Document                                                                 |
| ------------- | ------------------------------------------------------------------------ |
| Lifecycle     | [PRODUCT-LIFECYCLE.md](./PRODUCT-LIFECYCLE.md)                           |
| Architecture  | [PRODUCT-ARCHITECTURE-STANDARD.md](./PRODUCT-ARCHITECTURE-STANDARD.md)   |
| Quality       | [PRODUCT-QUALITY-STANDARD.md](./PRODUCT-QUALITY-STANDARD.md)             |
| Certification | [PRODUCT-CERTIFICATION-STANDARD.md](./PRODUCT-CERTIFICATION-STANDARD.md) |
| Governance    | [PRODUCT-GOVERNANCE.md](./PRODUCT-GOVERNANCE.md)                         |
| Repository    | [PRODUCT-REPOSITORY-STANDARD.md](./PRODUCT-REPOSITORY-STANDARD.md)       |
| Portfolio     | [PRODUCT-PORTFOLIO.md](./PRODUCT-PORTFOLIO.md)                           |
| Roadmap       | [PRODUCT-ROADMAP.md](./PRODUCT-ROADMAP.md)                               |
