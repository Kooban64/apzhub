# SPR-004 — Architecture Review

> **Sprint:** SPR-004 — Action Framework  
> **Review date:** 2026-06-28  
> **Scope:** AF-001 through AF-022 (Action Framework delivery)  
> **Recommendation:** **Approve Sprint 004 closeout** — proceed to owner review; tag `v0.4.0-action-framework` when instructed

---

## Executive summary

SPR-004 successfully delivers `@apzhub/command-framework` as the APZHUB unified action layer. The Action Registry, executor, bridge, shortcut registry, and client hydration integrate with the Workbench Request Bus without bypassing engine boundaries. Four Desktop Shell surfaces consume a single permission-filtered registry DTO and execute through one shared `DefaultActionExecutor`.

Application wiring in `apps/web` completes the end-to-end path from Runtime bootstrap to user interaction. Gateway stubs for AI, voice, and automation preserve extension points without introducing premature execution paths.

**Overall architectural verdict:** **APPROVED WITH OBSERVATIONS**

Observations are documented limitations (service handlers, manifest bridge id resolution) scoped to future stories — not architectural violations.

---

## Architecture compliance

| ADR / Rule                                      | Compliance                                             |
| ----------------------------------------------- | ------------------------------------------------------ |
| ADR-0024 Command Framework package              | ✅ Dedicated `@apzhub/command-framework` package       |
| ADR-0025 Manifest `workbench.actions` / toolbar | ✅ Zod schema + extraction                             |
| ADR-0026 Execution and actor model              | ✅ Executor, actors, audit hook, gateway routing       |
| Document 000 §6.1 API layering                  | ✅ Runtime → Workbench → Action Framework → Capability |
| No capability → engine bypass                   | ✅ Surfaces → executor → bridge → Request Bus          |
| No business modules                             | ✅ Confirmed                                           |
| Baseline v1.0 frozen                            | ✅ No baseline document edits                          |
| Phased review gates (ADR-0017)                  | ✅ AF completion reports per story                     |

---

## Subsystem review

### Action Framework package

**Role:** Platform Capability layer for action registration, discovery, permission-filtered hydration, and execution.

**Verdict:** ✅ Approved

- Clear package boundaries: `index`, `server`, `react` exports
- Registry immutability via frozen descriptors
- Server bootstrap atomic with platform catalogue + manifest extraction
- Client registry read-only — synchronisation extension points documented, not implemented

**Observations:** `COMMAND_FRAMEWORK_STATUS` and server status strings could be aligned (TD-AF9-04) — cosmetic.

---

### Registry model

**Role:** Authoritative in-memory action index with search, context filtering, and diagnostics.

**Verdict:** ✅ Approved

```text
Platform Action Catalogue (builtin)
        +
Manifest extraction (capabilityRecords)
        ↓
DefaultActionRegistry
        ↓
mapActionRegistryDto + filterActionRegistryDto
        ↓
ClientActionRegistry (read-only hydration)
```

| Concern                | Assessment                                           |
| ---------------------- | ---------------------------------------------------- |
| Action identity        | Stable ids; immutability enforced                    |
| Platform vs capability | `source: builtin \| manifest` distinction clear      |
| Permission filter      | Server-side before client; matches Workbench pattern |
| Search / context       | Palette and context menu use registry queries        |
| Toolbar DTO            | Separate from action list; references by `commandId` |

**Observations:** Action visibility predicates partially implemented — server DTO does not yet encode full visibility model (TD-AF16-03).

---

### Execution pipeline

**Role:** Route action requests through permission gate, actor routing, handler dispatch, and Workbench bridge.

**Verdict:** ✅ Approved with observations

```text
execute(actionId, { actor, args })
        ↓
Registry lookup
        ↓
Permission check (WorkbenchPermissionAdapter)
        ↓
Actor routing (user | system | ai-agent | voice)
        ↓
Handler dispatch
  workbench-bridge → bridge.toAction(actionId, args) → workbenchExecute
  service/event    → NOT_IMPLEMENTED
        ↓
ActionResult → audit hook
```

**Strengths:**

- Structured result codes (`SUCCESS`, `FORBIDDEN`, `NOT_FOUND`, `NOT_IMPLEMENTED`, etc.)
- Audit reference generation
- Gateway routing for non-user actors without bypassing executor

**Observations:**

- `bridge.toAction()` receives **manifest action id**, but bridge `supports()` checks **bridge action ids** only (TD-AF20-01). Manifest actions like `platform.home.navigate` with `handler: workbench-bridge:workbench.navigation.reveal` fail dispatch unless id matches bridge id.
- Service handlers correctly return `NOT_IMPLEMENTED` — but scaffold manifests expose user-visible actions that do not execute (TD-AF20-02).

---

### Workbench integration

**Role:** Connect Action Framework to Workbench API via bridge and shared executor.

**Verdict:** ✅ Approved

| Integration point                                 | Implementation                                |
| ------------------------------------------------- | --------------------------------------------- |
| `WorkbenchCommandBridge`                          | AF-007 — maps bridge ids to `WorkbenchAction` |
| `createWorkbenchActionExecutorFromActionExecutor` | AF-020 — wraps executor for Workbench API     |
| `WorkbenchProvider.resolveActionExecutor`         | AF-020 — DI hook without bus redesign         |
| `actionToRequest()`                               | Publish path from executor to Request Bus     |
| Shared permission adapter                         | Same instance in Workbench and executor       |

**Execution paths:**

1. **Shell surfaces** → `useCommandRegistry().execute()` → shared executor
2. **Workbench API** → `executeAction()` → injected `WorkbenchActionExecutor` → same executor

No duplicate executor stacks. No direct engine access from `@apzhub/workspace` surfaces.

**Observations:** `resolveActionExecutor` uses forward-ref bus pattern — acceptable integration compromise documented in AF-020.

---

### Platform Assets

**Role:** Built-in manifest declarations for platform actions, toolbar regions, and shortcuts.

**Verdict:** ✅ Approved

| Asset                    | Manifest                    | Extracted                       |
| ------------------------ | --------------------------- | ------------------------------- |
| `platform.theme.toggle`  | `theme.yaml`                | Action + toolbar + Ctrl+Shift+T |
| `platform.home.navigate` | `platform-home/module.yaml` | Action + Ctrl+Shift+H           |
| Workspace toolbar region | `theme.yaml`                | `toolbarRegionCount ≥ 1`        |

Extraction pipeline:

```text
Runtime.bootstrap()
        ↓
mapPlatformCapabilitiesToActionRecords()
        ↓
bootstrapActionRegistry()
        ↓
extractToolbarRegionsFromCapabilities() (auto)
        ↓
registerShortcutsFromActions()
```

Orphan toolbar items filtered with diagnostics. Integration test validates full chain.

**Observations:** Service handler for theme toggle not implemented — asset is structurally correct but functionally incomplete.

---

### Workbench Surfaces

**Role:** Presentation-only consumers of hydrated registry in `@apzhub/workspace`.

**Verdict:** ✅ Approved

| Surface          | Pattern compliance            | Tests           |
| ---------------- | ----------------------------- | --------------- |
| Command Palette  | Workbench Surface Pattern     | Component + E2E |
| Global shortcuts | `execute()` pipeline          | Component + E2E |
| Context menu     | Context filter + registry     | Component       |
| Toolbar          | DTO region + registry resolve | Component + E2E |

All surfaces require `CommandRegistryProvider` ancestor. Enabled via `DesktopShell` flags in `apps/web`.

**Observations:**

- Palette shortcut (Ctrl+Shift+P) is shell-owned — correct separation from Action Registry shortcuts
- Context menu receives selection snapshot via props — not live subscription (TD-AF16-02); acceptable for M4

---

### Invocation Sources

**Role:** Actor attribution and gateway routing for non-user execution origins.

**Verdict:** ✅ Approved (interface scope)

| Source     | Actor        | Route                         | Status          |
| ---------- | ------------ | ----------------------------- | --------------- |
| User UI    | `user`       | Executor → bridge/handler     | ✅ Implemented  |
| System     | `system`     | Executor with allow-list      | ✅ Structure    |
| AI agent   | `ai-agent`   | AiActionGateway stub          | NOT_IMPLEMENTED |
| Voice      | `voice`      | VoiceActionGateway stub       | NOT_IMPLEMENTED |
| Automation | `automation` | AutomationCommandGateway stub | NOT_IMPLEMENTED |

Gateway stubs return structured `NOT_IMPLEMENTED` outcomes. Executor diagnostics include gateway phase. No capabilities import gateways for production behaviour — governance guide enforces.

**Observations:** Correct deferral per sprint scope. Event Bus audit trail for actions remains future work.

---

## Cross-cutting concerns

### Permission model

Server `filterActionRegistryDto()` + executor `permissionAdapter.can()` mirror Workbench registry filtering. Auth adapter structure ready; RBAC population deferred to Milestone 8 — consistent with M3.

### Diagnostics

| Layer     | Mechanism                                         |
| --------- | ------------------------------------------------- |
| Registry  | `getDiagnostics()`                                |
| Hydration | `buildActionRegistryHydrationDiagnostics()`       |
| Health    | `/api/health` → `commands` (allow-all visibility) |
| Dev UI    | `ActionFrameworkDiagnostics` hidden span          |

Production operators should use health endpoint, not dev UI.

### Testing architecture

672 unit/component tests + 19 E2E tests. Integration test covers Runtime → bootstrap → toolbar → shortcuts. App wiring tested via `createAppActionExecutorBundle`.

---

## Risks

| Risk                                       | Severity        | Mitigation                                 |
| ------------------------------------------ | --------------- | ------------------------------------------ |
| Manifest actions fail bridge dispatch      | Medium          | TD-AF20-01; document in onboarding         |
| Service actions visible but non-functional | Medium          | TD-AF20-02; theme service story            |
| Empty RBAC allows all actions              | Medium until M8 | Server filter + adapter pattern in place   |
| Shortcut conflicts undetected in prod UI   | Low             | Diagnostics at registration; health counts |
| Sprint 005 scope creep into action debt    | Medium          | Closeout backlog separates concerns        |

---

## Overall architectural verdict

**APPROVED WITH OBSERVATIONS**

SPR-004 delivers a coherent Action Framework that respects Baseline v1.0 layering, ADRs 0024–0026, and the Workbench Surface Pattern. The registry model, execution pipeline, Workbench integration, Platform Assets, surfaces, and invocation source stubs are architecturally sound.

Observations identify **implementation gaps within approved architecture** (handler resolution, service wiring) — not design failures. These are tracked in technical debt and do not block milestone release as platform infrastructure.

---

## Recommendations

1. **Approve closeout** and Milestone 4 release recommendation
2. **Prioritise handler resolution** (TD-AF20-01) early in post-M4 backlog
3. **Implement theme service** or hide non-functional toolbar actions until ready
4. **Do not expand** Action Framework scope in Sprint 005 — Search Framework is M5 focus

---

_SPR-004 Architecture Review — Action Framework subsystem compliance._
