# APZHUB Platform 1.0.0 — Capability Catalogue

| Capability                      | Role in 1.0.0                      | Primary evidence                             |
| ------------------------------- | ---------------------------------- | -------------------------------------------- |
| Knowledge Foundation            | Operational bootstrap & acceptance | docs/foundation                              |
| Platform Delivery Standard      | Mandatory delivery methodology     | docs/engineering/platform-delivery           |
| Identity / AuthN / AuthZ        | Single SSO · server AuthZ          | BetterAuth · identity/authorization packages |
| Integration SDK                 | Adapter framework                  | `@apzhub/integration-sdk` **1.0.0**          |
| Platform Services               | Business orchestration             | platform-services · contracts                |
| API Gateway / HTTP              | One client API surface             | OpenAPI Platform **1.12.0** · product paths  |
| Workbench / DEF                 | Shell before modules               | workbench-framework · apps/web               |
| Search / Knowledge Discovery    | Unified search                     | search-* · publication adapters              |
| Events / Outbox                 | Async processing                   | event-bus · outbox                           |
| Notifications                   | Attention delivery                 | notification-* (platform)                    |
| Analytics Platform              | Analytics SoR + Metabase           | platform/analytics · product Analytics       |
| Workflow Platform               | Workflow SoR + n8n                 | platform/workflow · product Workflow         |
| Documents Platform              | Document plane                     | document-* · product Documents               |
| Testing Platform                | TCMS native                        | testing-* · product TCMS                     |
| Legal Platform                  | Law vertical                       | law-platform · product Law                   |
| Observability / Admin / Metrics | Ops planes                         | observe/admin/metrics packages & workspaces  |
| Provisioning                    | Product enablement flows           | platform-provisioning                        |

Detailed commercial framing: [COMMERCIAL-PRODUCT-CATALOGUE](../../../product-management/COMMERCIAL-PRODUCT-CATALOGUE.md).
