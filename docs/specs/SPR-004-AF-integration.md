# SPR-004 — Integration Technical Specifications (AF-018 – AF-022)

> **Stories:** AF-018 through AF-022  
> **ADRs:** [0024](../adr/ADR-0024-command-framework-package.md) · [0026](../adr/ADR-0026-command-execution-model.md)

---

## AF-018 — Automation, AI, and voice stubs

### Objective

Export extension interfaces; stub non-user actors.

### Files

```text
packages/command-framework/src/gateways/automation-gateway.ts
packages/command-framework/src/gateways/ai-action-gateway.ts
packages/command-framework/src/gateways/voice-action-gateway.ts
packages/command-framework/src/gateways/stubs.ts
```

### Interfaces

Per ADR-0026 — `AutomationCommandGateway`, `AiActionGateway`, `VoiceActionGateway`.

Stub implementations return:

```typescript
{ ok: false, code: "NOT_IMPLEMENTED", commandId: "...", actor: "ai-agent" }
```

Wire in CommandExecutor for actors `ai-agent` and `voice`.

### Documentation

Add section to [Capability Development Guide](../governance/APZHUB-Capability-Development-Guide.md) — "Future execution gateways" (AF-021 may consolidate).

### Tests

- Each stub returns NOT_IMPLEMENTED
- Executor routes ai-agent actor to AiActionGateway
- Executor routes voice actor to VoiceActionGateway

**Implemented (AF-018):** see [SPR-004-AF-invocation-sources.md](./SPR-004-AF-invocation-sources.md).

---

## AF-020 — Application integration

### Objective

Wire command framework into `apps/web`.

### Server changes

`apps/web/lib/workbench-hydration.ts` (or sibling `command-hydration.ts`):

1. After `Runtime.bootstrap()`, extract commands from registry
2. `filterCommandRegistryDto(dto, permissionAdapter)`
3. Serialise into page props or RSC payload alongside workbench DTO

### Client changes

`apps/web/lib/command-shell-provider.tsx`:

1. `createCommandRegistryFromDto(dto)`
2. `createCommandExecutor({ registry, bridge, adapter, workbenchExecute })`
3. Provide React context for `useCommandRegistry`
4. Pass executor to `createWorkbenchAPI({ bus, executor })`

### Next.js config

Add `@apzhub/command-framework` to `transpilePackages`.

### Desktop shell

Mount CommandPalette, global shortcuts, context menu, toolbar from workspace with providers.

### Tests

- Integration test: hydration module produces non-empty commands in dev fixture
- Full quality gates green

### Dependencies

AF-005, AF-008, AF-010 minimum; palette/surfaces stories for full UI.

---

## AF-021 — Documentation

### Objective

Document implemented Action Framework.

### Deliverables

| File                                                     | Action                                                 |
| -------------------------------------------------------- | ------------------------------------------------------ |
| `docs/architecture/command-framework.md`                 | New — subsystems, flows, diagrams                      |
| `docs/governance/APZHUB-Capability-Development-Guide.md` | Add `workbench.commands` section (align with ADR-0025) |
| `docs/governance/APZHUB-Workbench-Development-Guide.md`  | Bridge integration section                             |
| `packages/command-framework/README.md`                   | Package usage                                          |
| `CHANGELOG.md`                                           | Unreleased → v0.4.0 section                            |
| `docs/README.md`                                         | Index command-framework architecture                   |

**Do not edit** `APZHUB-Architecture-Baseline-v1.0.md` — baseline frozen.

---

## AF-022 — Sprint closeout

### Objective

Close Sprint 004; prepare Milestone 4 release.

### Deliverables

| Document                                                | Content                             |
| ------------------------------------------------------- | ----------------------------------- |
| `docs/sprint/SPR-004-closeout.md`                       | Story completion table, debt, gates |
| `docs/reviews/SPR-004-architecture-review.md`           | Subsystem compliance                |
| `docs/reviews/MILESTONE-004-action-framework-review.md` | Verdict                             |
| `docs/releases/v0.4.0-action-framework.md`              | Release notes                       |

### Recommended tag

`v0.4.0-action-framework` — create only on owner instruction.

### Exit criteria

- AF-001 through AF-021 complete
- All quality gates pass
- E2E includes spr-004-command-palette.spec.ts
- Technical debt register updated

---

_Integration specifications — AF-020 after core stories; AF-021/022 at sprint end._
