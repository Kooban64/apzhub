# APZHUB Module SDK quick reference

Derived lookup for [025](./025-module-sdk-module-manifest-module-development-standard.md).

> **Document Version:** 1.0 · **Developer Specification · Mandatory**  
> Module architecture: [008](./008-module-plugin-connector-architecture.md). Platform SDK: [024](./024-apzhub-platform-sdk-development-framework.md). Registration: [017](./017-navigation-framework-workspace-navigation-architecture.md), [019](./019-universal-command-palette-action-framework.md), [020](./020-unified-search-knowledge-discovery-framework.md).

## Core rule

Every business capability = **Platform Module** with **`module.yaml` manifest first** — not a React app, page, link collection, or OSS wrapper.

## Manifest before code

Manifest = contract · code = implementation · **Cursor never implements before manifest exists** (024)

## What modules are

User-facing capabilities: Projects · Support · Documents · Time Tracking · Automation · Analytics · Testing · Compliance · Security · Monitoring · Administration · HR · CRM · Finance · Legal · AI Assistant — APZHUB names only (002)

## What modules are NOT

Direct backend frontend · links portal · separate app · hardcoded routes · backend wrapper · direct connector calls — **never expose Plane/Kimai/Zammad/Paperless/Metabase/n8n/Kiwi etc.**

## Module may contain

Manifest · navigation · routes · views · components · commands · permissions · search · events · notification **types** · widgets · dashboards · reports · settings · docs · tests — **consumes Platform Services only**

## Lifecycle states

Not installed · installed · configured · enabled · disabled · maintenance · deprecated · removed — Module Registry (015)

## Manifest file

`module.yaml` — identity · capabilities · permissions · routes · commands · search · settings · docs · tests

## Module Registry (platform-owned, 011)

ID · name · version · status · installed/enabled · permissions · nav · commands · search · health · config · dependencies — **shell reads registry, never hardcodes modules**

## Navigation registration (shell renders)

Activity bar · sidebar · routes · context panel · breadcrumbs · badges · shortcuts — permission-filtered (017, 005)

## Commands (019)

Create/open project · ticket · document · timer · workflow · report — via Platform Services · permission-aware

## Permissions (declarative, granular)

project.view/create/edit · ticket.assign · document.approve · workflow.execute — **platform enforces; no module auth engine** (007)

## Search (020)

Register providers to Platform Search Service — no independent search · permission-filtered results

## Events (012)

Publish: ProjectCreated · TicketAssigned · etc. — subscribe via Event Framework · no module-to-module calls

## Notifications (021)

Define **types only** — framework delivers · never send directly

## Settings

Sections in platform Settings Workspace — no separate module settings UI; user prefs separate (023)

## Connector dependencies

Declare required connectors indirectly via Platform Services — e.g. ProjectService backed by Plane connector today, swappable tomorrow — **no direct connector deps in module code** (008)

## Directory structure (`modules/projects/`)

`module.yaml` · README · CHANGELOG · `src/` (views, components, commands, search, events, widgets, reports, settings, permissions, types, utils) · `tests/` (unit, integration, playwright, a11y, performance) · `docs/` (overview, admin, developer, user guides) — monorepo `/modules` (004)

## Testing (mandatory, 015)

Unit · component · integration · **permission** · Playwright E2E · a11y · regression — incomplete until tests pass

## Documentation (mandatory)

Overview · architecture · user/admin/developer guides · configuration · test instructions · limitations — must not contradict 001–024

## Security

Platform auth/authz · validate inputs · no direct backend · no secrets · audit events · hide backends (013, 009)

## Observability

Health · version · dependencies · errors · metrics · config status — Administration Workspace inspectable (014)

## Cursor workflow (12 steps)

1. Read 025 → 2. `module.yaml` → 3. validate → 4. interfaces → 5–9. register nav/commands/permissions/search/events → 10. tests → 11. docs → 12. implement scope only — **no direct backend calls · no shell hardcoding · no skipping tests · phase gate applies**

## Acceptance highlights

Manifest-first · dynamic registration · metadata-driven nav/commands/search · platform permission enforcement · independently testable · enable/disable without shell changes · hidden backends · **no connector/backend direct calls · no direct notify · no standalone search**
