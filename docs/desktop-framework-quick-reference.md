# APZHUB Desktop Framework quick reference

One-page lookup derived from [005](./005-desktop-experience-workspace-framework.md), [016](./016-desktop-shell-architecture-user-experience-framework.md), [017](./017-navigation-framework-workspace-navigation-architecture.md), [018](./018-workspace-sessions-window-management-state-persistence-framework.md), [019](./019-universal-command-palette-action-framework.md), [020](./020-unified-search-knowledge-discovery-framework.md), [021](./021-notification-activity-attention-management-framework.md), [022](./022-presentation-engine-theme-framework-branding-architecture.md), and [023](./023-user-preferences-personalisation-workspace-experience-framework.md). **005** = DEF. **016** = shell. **017** = navigation. **018** = sessions. **019** = command palette. **020** = search. **021** = notifications. **022** = presentation. **023** = preferences.

## Shell regions (permanent — modules load inside Workspace)

```
Header | Activity Bar | Sidebar | Workspace | Context Panel | Status Bar
         + Notification Layer | Dialog Layer | Command Palette (Ctrl+Shift+P)
```

Shell is **never replaced**. All regions **permission-filtered**.

## Permission-driven UI (mandatory)

| Rule                     | Detail                                                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Dynamic menus            | Activity Bar, Sidebar, Header, Toolbars, Command Palette, Search, Context Panel — all computed from effective roles/permissions             |
| No access = no menu item | Users only see systems/capabilities they can access — prefer hide over disable                                                              |
| Module registration      | Each nav item, command, search provider declares **required permissions**                                                                   |
| Server authoritative     | UI hiding ≠ security; APIs and deep links enforce permissions                                                                               |
| Superadmin               | **Not a normal user** — special permission tier; explicit superadmin permissions; distinct admin/diagnostic surfaces; not a security bypass |

Consume **PermissionService** — no hardcoded role checks in UI components.

## Activity Bar workspaces (if permitted)

Home · Projects · Support · Documents · Testing · Automation · Analytics · Compliance · Security · Administration

## Header

Logo · Workspace name · Global search · Quick actions · Notifications · User menu · Org switcher (future) · Environment · Connection · Theme

## Sidebar (current workspace, filtered)

Collapse · resize · pin · favourites · recent · search within scope

## Workspace tabs

Close · pin · reorder · restore session (re-validate permissions) · unsaved indicator · keyboard nav

## Context panel (right, filtered)

Activity · properties · history · audit · notes · comments · attachments · workflow · details — collapse · resize · hide · dock

## Status bar

User · workspace · connection · background jobs · notifications · version · environment · sync

## Standard dialogs only

Confirm · wizard · selection · warning · error · fullscreen — no custom module dialog styles

## Global search categories (if permitted)

Projects · documents · users · support · tasks · reports · settings · commands — grouped results

## Workspace layout pattern

Navigation · toolbar · filters · content · side panel · footer actions

## Toolbar actions (if permitted)

Create · edit · delete · export · refresh · filter · search · bulk · settings · help

## Panels

Move · resize · collapse · expand · fullscreen · dock · undock (future) · persistent state

## Themes (token-based)

Light · dark · high contrast · future custom — no hardcoded colours

## Responsive

Desktop primary · tablet required · mobile secondary — collapse/overlay, never remove permitted functionality

## State persistence

Last workspace · tabs (re-validated) · sidebar/panel sizes · collapsed sections · theme · recent activity · preferences

## Motion

Subtle fade/slide/skeleton only — performance first

## Shell development order

**Build Desktop Framework before business modules.**

## Acceptance highlights

No full page reloads between workspaces · consistent shell · resizable panels + persisted state · keyboard + command palette · global themes · uniform notifications/dialogs/search · **permission-gated navigation** · **superadmin only with superadmin permissions** · **server blocks unauthorised deep links**
