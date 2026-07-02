# APZHUB Workspace Sessions quick reference

Derived lookup for [018](./018-workspace-sessions-window-management-state-persistence-framework.md).

> **Document Version:** 1.0 · **Platform Specification · Core Platform Standard**  
> Shell layout: [016](./016-desktop-shell-architecture-user-experience-framework.md). Navigation state: [017](./017-navigation-framework-workspace-navigation-architecture.md). Platform metadata: [011](./011-platform-data-architecture-database-design-principles.md).

## Core idea

**Persistent working environments** — not pages. APZHUB feels like an OS, not a website. Users never "start over."

## Workspace Session contents

Open workspaces · tabs · selected records · filters · sorting · panel sizes · window positions · context panels · sidebars · expanded trees · search results · pinned · recent · command history (optional) · temporary drafts

**Stores references + UI state only** — not authoritative business data (011)

## Philosophy

Users enter **working environments**; switching sessions ≈ virtual desktops

## Session types

Default · personal · temporary · pinned · shared · read-only · administrative (+ future) — admin sessions = explicit permissions, not bypass (007)

## Auto-restore on sign-in

Workspace · tabs · panel sizes · layout · selected objects · recent searches · context · cursor position (where practical) — **re-validate permissions on restore** (005, 017)

## Multiple named sessions

Morning Support · Month End · Compliance Review · Development · Executive Dashboard · Legal Review — switch in one action

## Session switching (automatic)

Save current → load new → restore navigation · layout · active records · filters · context — no manual setup

## Workspace windows

Tabs · panels · editors · dashboards · tables · reports · calendars · kanban — consistent; **platform-owned chrome** (016)

## Tab management (platform-owned)

Open · close · pin · duplicate · move · restore · unsaved · multi-select · drag & drop

## Split views (reusable shell)

Vertical · horizontal · nested · resizable dividers · independent scroll — compare records side by side

## Docking (consistent across modules)

Dock left/right/bottom · float (future) · collapse · expand · hide · reset

## Layout persistence

Panel sizes/visibility · sidebar/context width · split ratios · toolbar prefs · workspace order — **platform PostgreSQL user prefs** (011)

## Workspace templates

Support Agent · Project Manager · Executive · Developer · Compliance Officer — permissions still gate opens (005)

## Shared sessions (future)

Share layouts · dashboards · tabs · reports · workspace config — **not** personal prefs; recipient permission-checked (007, 013)

## Draft recovery

Unsaved forms · draft notes · comments · filters · searches — survive refresh/close; platform temp state, not engine duplicates (011)

## Undo & recovery

Undo/redo · recently closed tabs/workspaces · session history

## Session metadata (platform)

Name · owner · created · modified · workspace count · last used · pinned · favourite · sharing info — standard audit fields (011)

## Context preservation

Selected project/ticket/document · folder · report · dashboard — aligns with 017 breadcrumbs/context

## Temporary workspaces

Search results · quick comparison · preview · import wizard · review tasks — auto-close when done

## Background state

Jobs continue across session switches — no cancel on switch (012)

## Performance

Lazy load · metadata · cache · incremental restore · parallel load · minimal backend calls (004, 016)

## Multi-device (future)

Desktop · laptop · browser · tablet · mobile — session model client-agnostic; Electron/Tauri-ready (016)

## Accessibility (mandatory)

Keyboard · screen readers · **focus restoration** after switch · reduced motion · high contrast (006)

## Security

Respect permissions · workspace access · connector permissions · sensitive data · admin policies — **never expose inaccessible records**; no secrets in session payload (007, 011, 013)

## Testing (015)

Unit · persistence · performance · Playwright · recovery · regression — **permission tests on restore**

## Build rules

Sessions = first-class platform objects · metadata only · auto-restore · reusable split/dock · layouts independent of modules · productivity over page nav

## Acceptance highlights

Save/restore full environments · multiple named sessions · auto layout persist · accurate tab/panel/context restore · background work survives switch · secure & permission-aware · reusable session model for future clients · **permission re-validation** · **no business data duplication**
