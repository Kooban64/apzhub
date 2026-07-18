# APZHUB Platform Preference Model (M8-04)

## Categories

| Category        | Keys                                                                                          | Defaults                                       |
| --------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `appearance`    | `theme`, `density`                                                                            | `system`, `comfortable`                        |
| `regional`      | `language`, `timezone`, `dateFormat`, `timeFormat`                                            | `en`, `UTC`, `YYYY-MM-DD`, `24h`               |
| `workbench`     | `landingPage`, `defaultWorkspace`, `sidebarCollapsed`, `pinnedWorkspaces`, `recentWorkspaces` | `/workspace/home`, `home`, `false`, `[]`, `[]` |
| `notifications` | `email`, `inApp`, `digest`                                                                    | `true`, `true`, `off`                          |
| `accessibility` | `reducedMotion`, `highContrast`, `focusIndicators`                                            | `false`, `false`, `default`                    |

## Storage shape

Each preference is stored as a row in `platform_user_preference`:

- `user_id` + `category` + `preference_key` → `value` (JSONB)

## Workbench layout

Workbench session payload (`WorkbenchSessionPayload`) is stored separately in `platform_user_workbench_layout.layout` (JSONB) — sidebar state, panel sizes, open views, docking, selection.

## Favorites & recent

- **Favorites:** `item_type` + `item_key` + `label` + optional `metadata`
- **Recent:** same identity keys with `accessed_at` (max 25 per user)

## TypeScript contract

`UserPreferences` in `@apzhub/platform-personalisation` is the canonical read model returned by `GET /api/platform/v1/preferences`.

## Patch semantics

`PATCH /api/platform/v1/preferences` accepts partial category objects; only supplied keys are updated.
