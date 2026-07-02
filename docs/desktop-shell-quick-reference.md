# APZHUB Desktop Shell quick reference

Derived lookup for [016](./016-desktop-shell-architecture-user-experience-framework.md).

> **Document Version:** 1.0 · **Platform Specification · Foundation**  
> Complements [005 DEF](./005-desktop-experience-workspace-framework.md). Navigation: [017](./017-navigation-framework-workspace-navigation-architecture.md). Sessions: [018](./018-workspace-sessions-window-management-state-persistence-framework.md). Command palette: [019](./019-universal-command-palette-action-framework.md). Unified search: [020](./020-unified-search-knowledge-discovery-framework.md). Notifications: [021](./021-notification-activity-attention-management-framework.md). Presentation: [022](./022-presentation-engine-theme-framework-branding-architecture.md). Preferences: [023](./023-user-preferences-personalisation-workspace-experience-framework.md). For full layout, behaviour, and acceptance criteria, read the complete document.

## What the shell is

**Permanent operating environment** — not a page, not a layout. Never replaced; only contents change. All modules run inside it.

## Design target

Cursor · VS Code · JetBrains · GitHub Desktop · Linear · Vercel — hours-long productive sessions (006 Design System).

## Objectives

Native feel · minimal navigation · stay in context · multitask · fewer clicks · screen efficiency · visual consistency · keyboard-first · accessible · **Electron/Tauri-ready without redesign**

## Fixed layout (ASCII)

```
┌ Header / Global Toolbar ─────────────────────────────────────────┐
├── Activity Bar ─ Workspace Area (tabs + view) ─ Context Panel ─┤
└ Status Bar ────────────────────────────────────────────────────┘
```

Plus: Overlay Layer · Notification Layer · Command Palette · Global Search

## Shell components (single responsibility, no business logic)

Global Header · Activity Bar · Workspace Sidebar · Workspace Tabs · Workspace Area · Context Panel · Status Bar · Overlays · Notifications · Command Palette · Global Search

## Global Header (fixed)

Logo · current workspace · global search · quick actions · notifications · user profile · org selector (future) · environment · theme · help · AI entry (future) — **permission-gated actions**

## Activity Bar (left)

Home · Projects · Support · Documents · Automation · Testing · Analytics · Compliance · Security · Administration — tooltips · shortcuts · badges · context menus · pin (future) — **icons only if permitted** (005, 007)

## Workspace Sidebar

Tree nav · search · favourites · recent · collapse · resize · persist — one sidebar visible — **permission-filtered entries**

## Workspace Area

Tables · dashboards · forms · editors · kanban · reports · calendars · graphs · AI views (future) — modules render here only

## Workspace Tabs

Pin · close · reorder · restore · unsaved · keyboard nav · session restore — **re-validate permissions on restore**

## Context Panel (right)

Properties · activity · history · comments · attachments · workflow · related records · AI (future) — resize · collapse · hide · persist — permission-gated sections

## Status Bar (compact)

User · background jobs · connector status · notifications · version · environment · sync · shortcut hints — admin connector status without engine branding for standard users (002, 014)

## Overlay Layer

Dialogs · wizards · pickers · confirmations · fullscreen modals — **one visual standard** (006)

## Notification Layer

Toasts · alerts · progress · job updates · banners · system — from **Platform Services / events**, not modules directly (009, 012)

## Window state (persist + permission re-check)

Tabs · active workspace · sidebar/panel widths · layout · scroll · expanded sections

## Responsive

Desktop primary · tablet secondary · mobile simplified — **no loss of permitted functionality** due to screen size

## Performance

Fast load · minimal re-renders · lazy modules · virtualise large data · intelligent nav cache (004, 015)

## Accessibility (before modules ship)

Keyboard-only · screen readers · high contrast · focus · reduced motion · ARIA — WCAG AA (006)

## Extensibility (modules may contribute, not modify shell)

Activity bar · sidebar · commands · search · notifications · status · context panels · workspace tabs — each with **required permissions**; superadmin = special tier, not normal user (005, 007, 008)

## Build order

Shell + Design System **before** business modules (005, 006, 020)

## Acceptance highlights

Shell loads without modules · navigation works · multi-workspace tabs · persisted layout · a11y · global themes · unified overlays/notifications/search · modules plug in without shell changes · **permission-driven navigation**
