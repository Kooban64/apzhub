# Analytics Domain Model

> **Programme:** APZHUB-PLATFORM-ANALYTICS-002  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Information model:** [ANALYTICS-INFORMATION-MODEL.md](./ANALYTICS-INFORMATION-MODEL.md)

---

## 1. Domain purpose

Enable governed discovery and viewing of analytics dashboards inside APZHUB, with platform-owned catalogue/permissions and provider-owned visualisation execution.

---

## 2. Aggregate roots (future persistence)

| Aggregate          | Root                     | Children / value objects                             |
| ------------------ | ------------------------ | ---------------------------------------------------- |
| Dashboard Registry | `DashboardRegistryEntry` | tags, provider ref, status, default filters          |
| Dataset            | `DatasetDescriptor`      | dimension/measure hints (metadata), provider binding |
| Saved View         | `SavedDashboard`         | filter snapshot, principal scope                     |
| Sharing            | `ShareGrant`             | grantee, expiry (optional)                           |
| Visibility         | `RoleVisibilityBinding`  | role/permission key, dashboard or tag                |

Embed sessions are **transient** — not long-lived aggregates.

---

## 3. Lifecycle

### DashboardRegistryEntry

```text
Draft → Published → Deprecated → Retired
         ↑            │
         └────────────┘ (re-publish with revision)
```

| State      | Meaning                                                  |
| ---------- | -------------------------------------------------------- |
| Draft      | Visible to `analytics.manage` only                       |
| Published  | In catalogue for permitted viewers                       |
| Deprecated | Hidden from new discovery; existing saved links may warn |
| Retired    | Soft-deleted; no embed                                   |

### SavedDashboard

```text
Created → Updated* → Archived
```

### ShareGrant

```text
Active → Revoked | Expired
```

### EmbedSession

```text
Issued → Used → Expired (TTL)
```

---

## 4. Ownership

| Object                      | Created by                       | Owned by                                 |
| --------------------------- | -------------------------------- | ---------------------------------------- |
| DashboardRegistryEntry      | Analytics admin / platform ops   | Platform (org scope)                     |
| DatasetDescriptor           | Analytics admin                  | Platform                                 |
| RoleVisibilityBinding       | Analytics admin                  | Platform                                 |
| SavedDashboard              | End user (or org default)        | Principal / org                          |
| ShareGrant                  | Dashboard manager                | Grantor org                              |
| Provider dashboard/question | Provider admin (via adapter ops) | Engine — mapped, not owned as APZHUB SoR |

---

## 5. Responsibilities by service

| Service                    | Domain duties                                  |
| -------------------------- | ---------------------------------------------- |
| AnalyticsService           | Orchestrate catalogue open → embed; health     |
| DashboardService           | Registry lifecycle · catalogue · role defaults |
| DatasetService             | DatasetDescriptor lifecycle                    |
| ReportService              | Resolve links to Reporting SoR only            |
| SavedViewService           | SavedDashboard lifecycle                       |
| AnalyticsPermissionService | Map operations → permission keys               |
| QueryService               | Optional governed query forward (post-MVP)     |
| AnalyticsEmbedService      | Issue/validate embed sessions                  |
| AnalyticsHealthService     | Aggregate readiness                            |

---

## 6. Invariants

1. No catalogue entry without provider binding (or explicit “unavailable” placeholder).
2. Embed requires `analytics.view` (or stronger) and active Published (or permitted Draft for managers).
3. ShareGrant cannot exceed granter’s own visibility.
4. Metric/KPI definitions are never mutated by Analytics services.
5. Provider errors never surface raw engine payloads to clients.

---

## Related

- [ANALYTICS-ENTITY-RELATIONSHIPS.md](./ANALYTICS-ENTITY-RELATIONSHIPS.md)
- [ANALYTICS-SERVICE-ARCHITECTURE.md](./ANALYTICS-SERVICE-ARCHITECTURE.md)
