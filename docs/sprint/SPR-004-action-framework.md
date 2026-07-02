# SPR-004 — Action Framework Sprint Guide

> **Sprint:** SPR-004 — Action Framework  
> **Status:** **Complete** — Milestone 4 (`v0.4.0-action-framework`, tag pending owner instruction)  
> **Authority:** [019 — Universal Command Palette](../019-universal-command-palette-action-framework.md) · [command-framework.md](../architecture/command-framework.md)  
> **Baseline:** Milestone 3 complete (`v0.3.0-workbench-framework`)

---

## Purpose

Define and deliver the **Action Framework** — the platform layer that unifies executable actions across the workbench. Implemented in `@apzhub/command-framework` and integrated in `apps/web` (AF-020).

> **Historical note:** Sections below include original planning content retained for traceability. For current architecture, see [command-framework.md](../architecture/command-framework.md).

---

## Vision

The Action Framework becomes the **single execution model** for user-initiated and automated platform behaviour. Every action — whether triggered from the Command Palette, keyboard, toolbar, context menu, workflow, AI agent, or voice — flows through one registry, one permission model, and one audit path.

Document 019 describes the user experience. This sprint guide defines **how it integrates with Baseline v1.0**.

---

## Scope boundary

### In scope (Sprint 004 planning → future implementation)

- Command Framework package design (or workbench-framework extension — ADR required)
- Workbench Action → Platform Command evolution
- Command Registry and discovery from manifests
- WorkbenchCommandBridge implementation
- Command Palette integration architecture
- Keyboard shortcut registry architecture
- Context menu and toolbar action binding architecture
- Automation and workflow execution hooks (interface only)
- AI action execution surface (interface only)
- Voice execution surface (interface only — future)

### Out of scope

- Business capability actions (Milestone 9+)
- Full RBAC population (Milestone 8)
- Event Bus implementation (may consume events; not build bus)
- Search Framework (Milestone 5)
- Workbench engine rewrites

---

## Architectural position

```text
Business Capabilities
        │ register actions in manifest
        ▼
Platform Capabilities (Command Framework)     ← Sprint 004
        │ Command Registry · Palette · Shortcuts
        ▼
Workbench API (executeAction)                   ← Baseline v1.0 ✅
        │ WorkbenchCommandBridge                ← Sprint 004 implement
        ▼
Workbench Manager → Engines                     ← Baseline v1.0 ✅
        ▼
Desktop Shell presentation                    ← Palette UI, menus, toolbar
```

**Rule:** No layer bypasses Workbench API for UI orchestration. Command Framework invokes Workbench through bridge — not engines directly.

---

## Action types

| Category           | Source                        | Example                   |
| ------------------ | ----------------------------- | ------------------------- |
| Workbench Actions  | Built-in platform             | `workbench.view.open`     |
| Platform Commands  | Manifest `workbench.commands` | `platform.theme.toggle`   |
| Capability Actions | Module manifest               | `example.action.demo`     |
| Navigation Actions | Derived from navigation       | Go to workspace           |
| System Actions     | Platform services             | Sign out, reload session  |
| AI Actions         | Agent-orchestrated            | "Open project X" (future) |
| Automation Actions | Workflow engine               | n8n-triggered (future)    |
| Voice Actions      | Speech pipeline               | "Show dashboard" (future) |

All normalise to **Platform Command** envelope internally (Sprint 004 ADR).

---

## Workbench Actions (baseline → Sprint 004)

Baseline v1.0 delivers:

```typescript
// Existing — do not break
type WorkbenchAction =
  | { id: "workbench.view.open"; viewId: string; ... }
  | { id: "workbench.view.close"; viewId: string }
  | ...;

executeAction(action: WorkbenchAction): Promise<WorkbenchRequestResult>;
REQUEST_COMMAND_MAP: Record<string, WorkbenchActionId>;
```

Sprint 004 evolution:

1. Extend `WorkbenchAction` with metadata: `label`, `shortcut`, `paletteGroup`, `icon`
2. Implement `WorkbenchCommandBridge.execute(action)` → routes to Command Registry or direct request map
3. Deprecate direct `execute()` for user-facing flows — palette uses `executeAction` only
4. ADR for any breaking API change

---

## Command Palette

Per Document 019.

### Architecture

```text
User opens palette (Ctrl+Shift+P / Cmd+Shift+P)
        ↓
Shell CommandPalette component
        ↓
useCommandRegistry() hook
        ↓
CommandRegistry.list({ query, context, permissions })
        ↓
User selects command
        ↓
CommandExecutor.execute(commandId, args)
        ↓
WorkbenchCommandBridge | PlatformService | EventBus
```

### Integration points (Baseline v1.0)

| Point               | Location                                       | Sprint 004 work            |
| ------------------- | ---------------------------------------------- | -------------------------- |
| Palette host region | `@apzhub/workspace` Desktop Shell              | UI component               |
| Action list source  | Command Registry                               | New package/module         |
| Permission filter   | Same pattern as `filterWorkbenchRegistryDto()` | Server filter for commands |
| Execution           | `WorkbenchAPI.executeAction()`                 | Bridge implementation      |
| Context             | Selection + Context Engine snapshots           | Read-only grounding        |

### Discovery

Commands declared in manifest:

```yaml
workbench:
  commands:
    - id: platform.theme.toggle
      label: Toggle Theme
      permission: platform.theme.manage
      shortcut: Ctrl+Shift+T
      palette: true
      handler: theme-service:toggle
```

Server extracts command DTOs at hydration — parallel to navigation/views.

---

## Keyboard shortcuts

### Principles

- Command Framework **owns** shortcut registry — not Workbench Manager
- Shortcuts bind to command IDs — not raw engine requests
- Conflict detection at registration time
- User override — Document 023 preferences (future)

### Integration

```text
Shell keydown listener
        ↓
ShortcutRegistry.resolve(keyChord)
        ↓
CommandExecutor.execute(resolvedCommandId)
        ↓
WorkbenchCommandBridge
```

Workbench Action `shortcut` field populated from manifest at registry build.

---

## Context menus

Context menus are **filtered command lists** scoped by surface and selection:

```text
Right-click on selection
        ↓
ContextMenuRegistry.list({ surface, selection, context })
        ↓
Permission-filtered commands
        ↓
CommandExecutor
```

Selection Engine provides `selection` snapshot. Context Engine provides `context` snapshot. No new engine required — registry query with context predicates.

---

## Toolbar actions

Toolbar regions in Desktop Shell bind to command IDs:

```yaml
workbench:
  toolbar:
    - region: workspace
      items:
        - commandId: example.action.demo
          icon: play
```

Presentation only in shell — execution through Command Framework.

---

## Automation

Workflow engines (n8n, future APZHUB workflow) invoke **CommandExecutor** via service API:

```text
Workflow step
        ↓
Platform Service API
        ↓
CommandExecutor.execute({ commandId, args, actor: "system" })
        ↓
Audit event (future Event Bus)
```

Sprint 004: define `CommandExecutor` interface and system actor model. Full workflow integration — later milestone.

---

## Workflow execution

Distinct from single commands — **workflow** runs multi-step orchestrations via Platform Services (Document 012). Action Framework provides:

- `CommandExecutor` for atomic steps
- Workflow manifest kind (future ADR)
- No direct Workbench engine access from workflow runtime

Planning only in Sprint 004.

---

## AI action execution

AI agents (future) must use Command Framework API:

```text
AI Agent
        ↓
CommandFramework.proposeAction({ intent, context })
        ↓
Permission + policy check
        ↓
CommandExecutor.execute (with actor: "ai-agent")
        ↓
Audit trail
```

Workbench Context + Selection engines supply read-only snapshots for grounding. Agents **never** call Workbench engines or Runtime bootstrap.

Sprint 004: document interface; implement stub that rejects until M4+ AI milestone.

---

## Voice execution

Voice pipeline (future) maps utterances to command intents:

```text
Speech → Intent → CommandRegistry.match(intent)
        ↓
CommandExecutor (actor: "voice")
```

Sprint 004: document extension point only. No implementation.

---

## Proposed package structure

ADR required to choose:

**Option A — `@apzhub/command-framework` (recommended)**

```text
packages/command-framework/
├── registry/          CommandRegistry, discovery
├── executor/          CommandExecutor
├── shortcuts/         ShortcutRegistry
├── palette/           Palette query API (not UI)
├── bridge/            WorkbenchCommandBridge impl
└── server/            filterCommandRegistryDto()
```

**Option B — Extend `@apzhub/workbench-framework`**

- Smaller initial scope
- Risk of Workbench package bloat
- Only if ADR justifies

Recommendation: **Option A** — Platform Capability layer package consumed by Workbench and shell.

---

## Implementation strategy (phased)

### Phase 0 — ADRs and schema

- ADR-0024 Command Framework package (proposed)
- ADR-0025 Manifest `workbench.commands` block
- ADR-0026 Command execution and audit model
- Phase 0 report; owner approval gate

### Phase 1 — Command Registry core

- Command type definitions
- Manifest extraction and validation
- In-memory registry
- Server filter DTO
- Unit tests

### Phase 2 — CommandExecutor + WorkbenchCommandBridge

- Implement bridge connecting to existing `REQUEST_COMMAND_MAP`
- `executeAction()` routes through bridge
- Integration tests with Workbench API

### Phase 3 — Command Palette UI

- Shell palette component
- Fuzzy search over registry
- Keyboard activation
- E2E tests

### Phase 4 — Shortcuts + context menus + toolbar

- ShortcutRegistry
- Context menu binding
- Toolbar manifest block
- Conflict detection

### Phase 5 — Automation + AI + voice interfaces

- System actor model
- Stub interfaces for AI/voice/automation
- Documentation only for external integrators

### Phase 6 — Closeout

- Architecture review
- Milestone 4 review (if M4 = Command Framework)
- Release notes
- Tag recommendation

---

## Dependencies

| Dependency                   | Status                          |
| ---------------------------- | ------------------------------- |
| Workbench API v1.0           | ✅ Baseline v1.0                |
| WorkbenchAction types        | ✅                              |
| Permission adapter pattern   | ✅                              |
| Document 019                 | ✅                              |
| Desktop Shell palette region | ⚠ Shell extension needed        |
| RBAC keys                    | ⏳ M8 — use adapter pattern now |
| Event Bus audit              | ⏳ Future                       |

---

## Testing strategy (future implementation)

| Layer       | Tests                                        |
| ----------- | -------------------------------------------- |
| Registry    | Manifest extraction, validation, filter      |
| Executor    | Permission gate, bridge routing, error paths |
| Shortcuts   | Conflict detection, resolution               |
| Palette     | E2E — open, search, execute                  |
| Integration | Full flow: palette → bridge → view open      |

---

## Risks

| Risk                        | Mitigation                                            |
| --------------------------- | ----------------------------------------------------- |
| Breaking Workbench API v1.0 | Bridge preserves existing action IDs; ADR for changes |
| Palette scope creep         | Phase 3 boundary; search integration deferred to M5   |
| Shortcut conflicts          | Central registry with diagnostics                     |
| AI/voice security           | Actor model + permission + audit ADR                  |

---

## Exit criteria (planning phase)

- [x] SPR-004 sprint guide documented
- [x] Extension points aligned with Baseline v1.0
- [x] Implementation strategy phased
- [ ] Owner approval for Sprint 004 implementation
- [ ] Phase 0 ADRs accepted

---

## Stop condition

**Sprint 004 implementation complete (AF-021).** Await AF-022 sprint closeout and owner tag instruction for `v0.4.0-action-framework`.

---

_SPR-004 Action Framework — planning baseline retained; see [command-framework.md](../architecture/command-framework.md) for implemented architecture._
