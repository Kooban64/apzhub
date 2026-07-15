# APZHUB Platform Personalisation Reference Architecture (M8-04)

## Purpose

Platform Personalisation owns how each user experiences APZHUB — appearance, regional settings, workbench layout, notifications, accessibility, favorites, and recent activity. Products consume `PersonalisationService`; they do not implement independent preference stores.

## Separation of concerns

| Concern | Owner |
| --- | --- |
| WHO | Identity (`platform-identity`) |
| WHAT | Authorization (`platform-authorization`) |
| HOW | Personalisation (`platform-personalisation`) |

## Package

`@apzhub/platform-personalisation` — services, repositories, PostgreSQL adapters, session resolver, shared API handlers.

## Services

- `PersonalisationService` — facade
- `PreferenceService` — user preferences (Phase 1)
- `FavoritesService` — pinned items
- `RecentItemsService` — recent activity
- `WorkbenchLayoutService` — workbench session payload persistence
- `PersonalisationDiagnosticsService` — storage diagnostics

## Storage

Migration `0013_platform_personalisation.sql`:

- `platform_user_preference`
- `platform_user_favorite`
- `platform_user_recent_item`
- `platform_user_workbench_layout`

In-memory repositories for development and tests; PostgreSQL repositories when `DATABASE_URL` is set.

## APIs

| Route | Methods |
| --- | --- |
| `/api/platform/v1/preferences` | GET, PATCH |
| `/api/platform/v1/favorites` | GET, POST, DELETE |
| `/api/platform/v1/recent` | GET, POST |
| `/api/platform/v1/personalisation/diagnostics` | GET |
| `/api/platform/v1/personalisation/workbench-layout` | GET, PUT |

## Product integration

- `resolveSessionPersonalisation()` — server hydration
- `PersonalisationThemeBridge` — syncs theme with PreferenceService
- `createPlatformPersonalisationSessionStore()` — workbench layout via platform API

Integrated in `apps/web` and `apps/law-platform` (Trust Accounting uses Law Platform shell).

## Operations UX

Platform Operations Console → **Personalisation** (`/workspace/administration/personalisation`).

## Out of scope (M8-04)

Feature flags, governance, widget designer, custom forms, saved searches, advanced layouts — deferred to M8-05+.

## References

- [023 — User Preferences Framework](../023-user-preferences-personalisation-workspace-experience-framework.md)
- [ADR-0043](../adr/ADR-0043-platform-personalisation-framework.md)
- [Preference Model](./APZHUB-Platform-Preference-Model.md)
- [Workbench Personalisation Guide](./APZHUB-Workbench-Personalisation-Guide.md)
- [Developer Guide](../developer/platform-personalisation-onboarding.md)
