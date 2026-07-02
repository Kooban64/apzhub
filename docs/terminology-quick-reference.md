# APZHUB terminology quick reference

One-page lookup derived from [001](./001-project-vision-and-guiding-principles.md) and [002](./002-product-naming-positioning-terminology-standard.md). Use for UI, APIs, docs, and code naming.

## Product positioning

| APZHUB is                                   | APZHUB is not                                    |
| ------------------------------------------- | ------------------------------------------------ |
| Enterprise Productivity Platform            | Portal, dashboard, intranet, OSS collection      |
| Platform, Workspace, Workbench, Environment | Launcher, dashboard of tools, collection of apps |

## User-facing capability names

| Backend engine (internal only) | User-facing name | Platform Service    | Connector (008) / Adapter (003) |
| ------------------------------ | ---------------- | ------------------- | ------------------------------- |
| Plane                          | Projects         | ProjectService      | Plane Connector                 |
| Kimai                          | Time Tracking    | —                   | Kimai Connector                 |
| Paperless-ngx                  | Documents        | DocumentService     | Paperless Connector             |
| Zammad                         | Support          | SupportService      | Zammad Connector                |
| Kiwi TCMS                      | Testing          | TestingService      | Kiwi Connector                  |
| Metabase                       | Analytics        | AnalyticsService    | Metabase Connector              |
| n8n                            | Automation       | AutomationService   | n8n Connector                   |
| —                              | —                | IdentityService     | —                               |
| —                              | —                | NotificationService | —                               |
| —                              | —                | SearchService       | —                               |
| —                              | —                | PermissionService   | —                               |

Backend clients (connector internals only, never in app code): `PlaneClient`, `KimaiClient`, `PaperlessClient`, etc.

**Module → Service → Connector → Engine** (008). **PSL (009):** modules call service interfaces only; services own orchestration, audit, search, notify, events. See [module-connector](./module-connector-quick-reference.md) · [platform-services](./platform-services-quick-reference.md).

## Primary navigation (capability, not technology)

Projects · Tasks · Documents · Support · Testing · Automation · Analytics · Compliance · Security · Operations · Settings · Administration

## Workspaces

Project · Support · Document · Testing · Analytics · Automation · Administration · Compliance

Each workspace may contain: Views, Panels, Tools, Actions, Widgets, Tabs.

## User language examples

| Avoid            | Use                    |
| ---------------- | ---------------------- |
| Execute Workflow | Run Automation         |
| Submit Ticket    | Create Support Request |
| Upload Asset     | Upload Document        |

## UI component naming pattern

`ProjectSidebar`, `ProjectExplorer`, `WorkspaceHeader`, `WorkspaceTabs`, `NotificationPanel`, `ActivityFeed`, `SearchPanel`, `CommandPalette`

## Repository naming pattern

`ProjectRepository`, `DocumentRepository`, `UserRepository`, `PermissionRepository`

## Layer separation (mandatory)

```
User → Presentation → Application → Domain → Services → Adapters → Clients → Engines
```

See [architecture quick reference](./architecture-quick-reference.md) for principles, module contract, data ownership, and events.

## Where backend names are allowed

Integration services, adapters, infrastructure, developer docs, diagnostics, system administration — **not** standard user UI.

## Future engines (same rules)

Greenbone, Faraday, MobSF, Grafana, Prometheus, Loki, Wazuh, and any future integration → APZHUB terminology only in user experience.
