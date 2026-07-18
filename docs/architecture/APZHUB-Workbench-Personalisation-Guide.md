# APZHUB Workbench Personalisation Guide (M8-04)

## Overview

Workbench layout and navigation preferences are owned by Platform Personalisation — not `localStorage` alone.

## Session persistence

1. `WorkbenchProvider` accepts optional `sessionStore` (`SessionStore` interface).
2. `createPlatformPersonalisationSessionStore()` loads/saves via `GET/PUT /api/platform/v1/personalisation/workbench-layout`.
3. When authenticated, `apps/web` and `apps/law-platform` wire this store instead of default `localStorage`.

## User preferences vs layout

| Data                                | Service                                            | Storage                          |
| ----------------------------------- | -------------------------------------------------- | -------------------------------- |
| Theme, language, landing page, etc. | `PreferenceService`                                | `platform_user_preference`       |
| Sidebar, panels, open views         | `WorkbenchLayoutService`                           | `platform_user_workbench_layout` |
| Pinned workspaces                   | `PreferenceService` (`workbench.pinnedWorkspaces`) | preferences table                |
| Favorites                           | `FavoritesService`                                 | `platform_user_favorite`         |
| Recent workspaces                   | `RecentItemsService`                               | `platform_user_recent_item`      |

## Theme bridge

`PersonalisationThemeBridge` hydrates `next-themes` from saved `appearance.theme` and persists changes back to PreferenceService.

## Product rules

- Do not add product-local preference tables or `localStorage` keys for platform behaviour.
- Track workspace visits via `RecentItemsService.trackRecentItem()` when adding navigation analytics.
- Use `FavoritesService` for user-pinned workspaces and items.

## Operations UI

Users with `platform.nav.administration.view` can manage all preference categories in Platform Operations → Personalisation.
