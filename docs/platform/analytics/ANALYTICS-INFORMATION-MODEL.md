# Analytics Information Model

> **Programme:** APZHUB-PLATFORM-ANALYTICS-002  
> **Classification:** DOCUMENTATION ONLY  
> **Status:** Complete — **Awaiting Owner Acceptance**  
> **Date:** 2026-07-19  
> **Prerequisite:** APZHUB-PLATFORM-ANALYTICS-001 **ACCEPTED**  
> **Glossary:** [ANALYTICS-GLOSSARY.md](./ANALYTICS-GLOSSARY.md)

---

## 1. Purpose

Canonical shared language and domain objects for all Analytics Platform components and APZ Analytics product surfaces.

This model governs contracts, persistence metadata, UI copy, and adapter mappings. Provider-native names stay connector-internal.

---

## 2. Layered model

```text
┌─────────────────────────────────────────────────────────────┐
│ Presentation terms (Workbench): Dashboard, Widget,          │
│   Scorecard, Catalogue, Saved Dashboard, Embedding          │
├─────────────────────────────────────────────────────────────┤
│ Analytics Platform metadata SoR (future platform DB):       │
│   DashboardRegistryEntry, DatasetDescriptor,                │
│   RoleVisibilityBinding, SavedDashboard, ShareGrant,        │
│   EmbedSession (ephemeral)                                  │
├─────────────────────────────────────────────────────────────┤
│ Semantic query terms (often provider-backed):               │
│   Dimension, Measure, Filter, Time Period, Aggregation      │
├─────────────────────────────────────────────────────────────┤
│ Adjacent platforms (not Analytics SoR):                     │
│   Metric, KPI → Metrics SoR                                 │
│   Report → Reporting SoR                                    │
│   Health/telemetry → Observability SoR                      │
├─────────────────────────────────────────────────────────────┤
│ Provider engine (Metabase): visuals, questions, results     │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Entity catalogue (platform-owned metadata)

| Entity                     | Description                                                                | Identity                         |
| -------------------------- | -------------------------------------------------------------------------- | -------------------------------- |
| **DashboardRegistryEntry** | Platform record for a dashboard (title, description, provider ref, status) | Global platform ID               |
| **DatasetDescriptor**      | Logical dataset binding to provider resource                               | Global platform ID               |
| **WidgetRef**              | Optional layout reference to provider widget/card id                       | Platform ID + provider opaque id |
| **RoleVisibilityBinding**  | Role/permission → dashboard (or catalogue tag) visibility                  | Binding ID                       |
| **SavedDashboard**         | Principal/org saved dashboard + filter snapshot                            | Saved view ID                    |
| **ShareGrant**             | Intra-tenant share of a dashboard to principal/role                        | Grant ID                         |
| **EmbedSession**           | Short-lived embed token metadata (not durable SoR of results)              | Session ID / jti                 |
| **CatalogueTag**           | Optional grouping (Executive, Projects, Time, Support, Health)             | Tag ID                           |

Provider IDs are stored as opaque connector references — never shown as primary UX IDs (011).

---

## 4. Conceptual entities (not always persisted as tables)

| Concept                                                  | Persistence                                                     |
| -------------------------------------------------------- | --------------------------------------------------------------- |
| Widget                                                   | Usually provider-only; optional WidgetRef                       |
| Filter / Dimension / Measure / Time Period / Aggregation | Query/embed context; may appear in SavedDashboard snapshot JSON |
| Scorecard                                                | Presentation pattern over Dashboard/Widgets                     |
| Metric / KPI                                             | Metrics SoR — referenced by id when curated onto a dashboard    |
| Report                                                   | Reporting SoR — link only                                       |

---

## 5. Ownership & responsibility

| Concern                    | Owner                                                     |
| -------------------------- | --------------------------------------------------------- |
| Term definitions           | This Information Model                                    |
| Registry & catalogue rules | DashboardService                                          |
| Dataset descriptors        | DatasetService                                            |
| Embed issuance             | AnalyticsEmbedService + Metabase adapter                  |
| AuthZ evaluation           | Platform PermissionService (+ AnalyticsPermission helper) |
| Metric/KPI definitions     | Metrics SoR (unchanged)                                   |
| Report artefacts           | Reporting SoR (unchanged)                                 |
| Visual query execution     | Metabase (via adapter)                                    |

---

## 6. Tenancy

All platform Analytics metadata is tenant-ready (org/workspace scoped per platform tenancy model). Provider sandboxes map via adapter (ADR-0067).

---

## 7. Non-goals of the information model

- Defining Prometheus/Grafana series schemas
- Replacing Metrics SoR entities
- End-user SQL AST as a first-class platform entity
- Persisting query result cubes as authoritative platform business data

---

## Related

- [ANALYTICS-DOMAIN-MODEL.md](./ANALYTICS-DOMAIN-MODEL.md)
- [ANALYTICS-ENTITY-RELATIONSHIPS.md](./ANALYTICS-ENTITY-RELATIONSHIPS.md)
- [ANALYTICS-CONTRACT-PLANNING.md](./ANALYTICS-CONTRACT-PLANNING.md)
