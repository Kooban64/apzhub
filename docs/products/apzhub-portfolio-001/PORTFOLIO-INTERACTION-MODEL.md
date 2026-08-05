# Portfolio Interaction Model

| Field     | Value                |
| --------- | -------------------- |
| Programme | APZHUB-PORTFOLIO-001 |
| Status    | **IN FORCE**         |
| Timestamp | 20260805T081000Z     |

## Purpose

Define how APZHUB products interact **operationally** — for users and portfolio planning — without prescribing new technical integrations.

Foundation architecture (Module → Platform Service → Connector → Engine) remains authoritative for engineering. This model describes **business collaboration**.

## Interaction layers

```text
User Journey (cross-product)
        │
        ▼
Platform Experiences (My Work, Search, Notifications, …)
        │
        ▼
Native Products (Projects, Time, Support, …)
        │
        ▼
Platform Services (identity, permissions, search, attention, audit, …)
        │
        ▼
Connectors / Engines (invisible)
```

## Operational interactions (current portfolio)

| From → To              | Operational interaction                             | Status   |
| ---------------------- | --------------------------------------------------- | -------- |
| Projects → Time        | Delivery work provides context for time recording   | Mature   |
| Time → Projects        | Effort accountability returns to delivery planning  | Mature   |
| Projects → Support     | Delivery problems become service requests in APZHUB | Mature   |
| Support → Projects     | Service work may reference delivery context         | Mature   |
| Any product → APZQEP   | Changes share one quality / release / learning path | Baseline |
| Any product → Identity | One session and RBAC                                | Baseline |
| Any product → Shell    | One workspace chrome                                | Baseline |

## Platform-owned vs product-owned

| Concern                       | Owner                                |
| ----------------------------- | ------------------------------------ |
| Login / session / roles       | APZHUB                               |
| Shell / navigation / sessions | APZHUB                               |
| Unified search                | APZHUB                               |
| Notifications / attention     | APZHUB                               |
| Audit                         | APZHUB                               |
| Quality Flows / releases      | APZQEP                               |
| Project / task / sprint work  | APZ Projects                         |
| Timesheets / activities       | APZ Time                             |
| Requests / conversation       | APZ Support                          |
| Engine configuration          | Never user-visible; adapter-internal |

## Interaction rules

1. Users never navigate to an engine to complete an APZHUB journey.
2. Products do not own parallel identity, search, or notification systems.
3. Cross-product links use APZHUB routes and product names only.
4. Missing journey links are recorded as portfolio opportunities — not silent engineering.
5. Shared abstractions (including EPP-001) stay observation/validated until Owner Auth and measurable value justify Candidate Platform Capability.

## Future products

Documents, Workflow, and Analytics join this model by the same rules: native product experience, platform-owned cross-cutting surfaces, invisible engines.
