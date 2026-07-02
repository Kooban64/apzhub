# APZHUB Command Palette quick reference

Derived lookup for [019](./019-universal-command-palette-action-framework.md).

> **Implementation:** Sprint 004 complete — `@apzhub/command-framework` + `@apzhub/workspace` Desktop Shell. Architecture: [command-framework.md](./architecture/command-framework.md). Onboarding: [action-framework-onboarding.md](./developer/action-framework-onboarding.md).

> **Document Version:** 1.0 · **Platform Specification · Core Platform Standard**  
> DEF summary: [005 §14](./005-desktop-experience-workspace-framework.md). Shell: [016](./016-desktop-shell-architecture-user-experience-framework.md). Navigation/search: [017](./017-navigation-framework-workspace-navigation-architecture.md). Execution: [009](./009-platform-service-layer-integration-framework.md).

## What it is

**Universal Command Palette (UCP)** — primary command interface. Platform capability: modules contribute; shell presents. Not just search — an **Action Engine**.

## Vision

Fastest way to interact with APZHUB; most actions without menus. Familiar to Cursor/VS Code/JetBrains users; intuitive for business users.

## Discoverable via palette

Actions · objects · commands · reports · people · projects · documents · tickets · settings · workflows

## Activation

**Ctrl + Shift + P** (default) · header button · quick launcher · voice (future) · AI assistant (future) — opens instantly

## Command categories (one per command)

Platform · workspace · record · navigation · search · workflow · administration · connector · AI (future) · developer

## Module registration fields

Command ID · display name · description · category · required permission · shortcut · icon · parameters · keywords · handler · visibility rules — auto-discovered (008, 011)

## Example commands

Create/open project · create/assign ticket · upload document · start timer · generate report · open analytics · switch workspace · run workflow · audit history · manage users · settings

## Navigation commands

Open workspace/tab · switch session · recent · favourites · go to dashboard · quick nav (017, 018)

## Search integration

Global · workspace · recent · pinned · favourites · saved searches — organised, prioritised, permission-filtered; must not duplicate nav (017)

## Intelligent ranking

Usage frequency · recent · workspace context · permissions · current record/module · user prefs · AI ranking (future) — platform metadata (011)

## Parameters

Multi-step lightweight dialogs (006 overlays) — e.g. Create Project → name → template → department → create

## Context awareness

Adapts to workspace · selection · record · permissions · org · session — **only executable commands shown**; server authoritative (005, 007)

## Keyboard

Arrows · Tab · Enter · Escape · Ctrl+P · Ctrl+Shift+P · quick selection · multi-step — fully accessible (006, 016)

## Command history

Recent · pinned · favourite · frequently used — platform user prefs (011, 018)

## Command groups

Navigation · creation · editing · administration · reports · automation · security · AI

## Command chaining (future)

Multi-command workflows — orchestrated via Platform Services (009, 012)

## AI integration (future)

Summarise · analyse · draft · explain · meeting notes · compliance — same registration/permission/execution path as modules

## Module independence

Modules register; shell renders — **cannot modify palette architecture** (008)

## Permissions

Auth · roles · permissions · business policies · context — no hidden admin commands; superadmin = explicit tier (005, 007); hidden = undiscoverable (017)

## Execution path (mandatory)

```
Shell surface → useCommandRegistry().execute(actionId)
            → DefaultActionExecutor
            → WorkbenchCommandBridge | Platform Service
            → Workbench Request Bus → Workbench Manager
```

Implemented in SPR-004. Service handlers return `NOT_IMPLEMENTED` until Platform Service wiring. Never direct engine calls (003, 009, 010).

## Extensibility

Commands · categories · shortcuts · groups · AI actions · search providers — no palette architecture changes

## Performance

Instant open · incremental search · cache metadata · no backend until execution · thousands of commands (004, 016)

## Accessibility (mandatory)

Keyboard · screen readers · focus management · high contrast · reduced motion — WCAG AA (006)

## Testing (015)

Unit · registration · **permission** · Playwright · a11y · performance · regression — unavailable commands not listed/executable

## Build rules

Reusable platform service · dynamic module registration · no hardcoded module commands · engine-independent execution · keyboard-first · AI-ready · **primary interaction model**

## Acceptance highlights

Modules register independently · permission-aware · fast context-sensitive search · full keyboard · executes via Platform Services · AI integrates naturally · extensible without architecture changes · majority of actions via palette · **no discoverable unavailable commands** · **no service/connector bypass**
