# APZHUB Runtime Development Guide

> **Audience:** Engineers extending the Platform Runtime  
> **Authority:** [Architecture Baseline v1.0](../architecture/APZHUB-Architecture-Baseline-v1.0.md) · [platform-runtime.md](../architecture/platform-runtime.md)  
> **Package:** `@apzhub/platform-runtime`

---

## Overview

The Platform Runtime is **UI-agnostic**. It discovers manifests, validates them, registers capabilities, and manages lifecycle and health. Extend it without introducing React, Workbench, or business logic.

**Entry point:** `Runtime.bootstrap()` from `@apzhub/platform-runtime/server`.

---

## Runtime principles

| Principle             | Requirement                                             |
| --------------------- | ------------------------------------------------------- |
| UI-agnostic           | No React, `@apzhub/ui`, `@apzhub/workspace`             |
| Single orchestrator   | All startup through `Runtime.bootstrap()`               |
| Fail-fast             | Invalid manifests and cycles block bootstrap (ADR-0013) |
| Internal API only     | No Registry REST (ADR-0010)                             |
| Sole env access       | Configuration Manager env-source only                   |
| Capability-first      | Primary abstraction is Capability, not Module           |
| Diagnostics mandatory | Every subsystem exposes `getDiagnostics()`              |

---

## Manifest Engine

**Location:** `packages/platform-runtime/src/manifest-engine/`

**Role:** Validate YAML manifests against Zod schemas; produce normalised envelope.

### Extending

1. ADR for new capability kind or schema field
2. Add Zod schema in manifest-engine (`workbench.actions`, `workbench.toolbar`)
3. Add envelope mapper for kind-specific payload
4. Unit tests with valid/invalid fixtures
5. Update [platform-manifest-specification.md](../architecture/platform-manifest-specification.md)

Action extraction is handled by `@apzhub/command-framework` at app hydration — not in Manifest Engine directly.

**Do not** modify SDK documents 025–029 without owner approval — Registry adapts to SDKs.

---

## Discovery

**Location:** `packages/platform-runtime/src/discovery-engine/`

**Role:** Scan configured filesystem roots; load YAML; emit discovered capabilities.

### Extending

- Add discovery root in configuration (ADR if new top-level folder)
- Respect ignore patterns for build artefacts
- Keep scan deterministic for reproducible bootstrap

Future: watch mode for development (deferred).

---

## Dependency Graph

**Location:** `packages/platform-runtime/src/dependency-graph/`

**Role:** Resolve dependencies; topological sort; cycle detection.

### Extending

- New dependency edge types require schema + graph builder update
- Cycles must fail bootstrap with actionable diagnostics
- Only `dependencies-resolved` capabilities proceed to registration

---

## Capability Registry

**Location:** `packages/platform-runtime/src/capability-registry/`

**Role:** In-memory index; kind-specific getters; lifecycle metadata storage.

### Public access

```typescript
const registry = Runtime.registry();
registry.getComponents();
registry.getThemes();
// workbench navigation extraction helpers
```

### Extending

- New index or getter — add to `PlatformRegistry` facade
- Registration hooks: `beforeRegister`, `afterUnregister` (extension points)
- Batch registration with rollback on failure

Persistence (PostgreSQL cache) — ADR-0009, deferred.

---

## Lifecycle

**Location:** `packages/platform-runtime/src/lifecycle-manager/`

**Role:** Validate state transitions; history; diagnostics.

### States

```text
discovered → validated → dependencies-resolved → registered
  → initialised → healthy → active
```

Failure: `failed`, `disabled`, `degraded`.

### Extending

- New states require ADR and transition table update
- Orchestrator coordinates: transition via Lifecycle Manager, then update Registry
- Never skip states on happy path

See [lifecycle-manager.md](../architecture/lifecycle-manager.md).

---

## Configuration

**Location:** `packages/platform-runtime/src/configuration-manager/`

**Role:** Authoritative runtime configuration.

**Precedence:** defaults → environment → overrides.

### Extending

- Add keys to configuration schema with defaults
- Read env only through env-source module
- Expose via `Configuration.get()` and `Runtime.configuration()`
- Add Configuration Health Provider if key affects health

---

## Health

**Location:** `packages/platform-runtime/src/health-manager/`

**Role:** Provider-based health aggregation.

### Built-in providers

- Runtime
- Configuration
- Registry
- Lifecycle

### Extending

```typescript
Health.registerProvider({
  id: "my-provider",
  check: async () => ({ status: "healthy", ... }),
});
```

New providers for subsystems or capabilities — follow provider interface; no direct orchestrator edits for health logic.

---

## Orchestration

**Location:** `packages/platform-runtime/src/runtime-orchestrator/`

**Role:** Fixed startup pipeline (ADR-0014).

```text
Configuration → Discovery → Manifest → Dependency Graph
  → Registry → Lifecycle → Health → Platform Ready
```

### Extending

- New pipeline step requires ADR
- Steps are idempotent where possible
- Fail-fast with structured error in diagnostics
- Platform ready transitions capabilities to `active`

**Do not** add Workbench or UI steps to Runtime orchestrator.

---

## Diagnostics

Every subsystem implements diagnostics:

```typescript
getDiagnostics(): SubsystemDiagnostics;
```

`Runtime.getDiagnostics()` aggregates:

- Startup step results and duration
- Configuration summary
- Discovery counts
- Manifest validation counts
- Dependency resolution summary
- Lifecycle state distribution
- Health provider summary
- Warnings and fatal errors

When adding a subsystem, wire into integrated diagnostics in orchestrator.

---

## Application integration

| File                               | Role                                                                                                                                                                        |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web/instrumentation.ts`      | Bootstrap hook                                                                                                                                                              |
| `apps/web/lib/runtime-init.ts`     | `Runtime.bootstrap()` helper                                                                                                                                                |
| `apps/web/app/api/health/route.ts` | Runtime summary + Action Framework `commands` + Knowledge `knowledge` + Event/Notification `events` / `notifications` + Activity/Timeline `activities` / `timelines` fields |

Runtime runs **server-side only**. Client bundles must not import `@apzhub/platform-runtime/server`.

Action Registry bootstrap (`bootstrapActionRegistry`) runs in `apps/web/lib/command-hydration.ts` after Runtime is ready — see [command-framework.md](../architecture/command-framework.md).

Knowledge Registry bootstrap (`bootstrapKnowledgeRegistry`) runs in `apps/web/lib/knowledge-hydration.ts` with parallel Action and Workbench DTO registration for providers — see [knowledge-discovery-framework.md](../architecture/knowledge-discovery-framework.md).

Event and Notification Registry bootstrap runs in `apps/web/lib/event-notification-hydration.ts` with shared `EventNotificationContext` — see [event-notification-framework.md](../architecture/event-notification-framework.md).

### Event & Notification Framework (SPR-006)

Manifest extraction supports `events` and `notifications.routes` blocks. Runtime discovers capability declarations; app bootstrap composes:

```text
bootstrapEventRegistry() + bootstrapNotificationRegistry()
        ↓
filterEventRegistryDto() + filterNotificationRegistryDto()
        ↓
createAppEventNotificationContext() + wireAppEventNotifications()
```

Health endpoint exposes `events` and `notifications` summaries alongside runtime, commands, and knowledge fields.

**Rules:**

- Runtime subsystems do not import `@apzhub/event-notification-framework/react`
- Event Bus is in-process — no external broker in M6
- Capabilities publish events; Notification Framework maps to notifications

See [Event & Notification onboarding](../developer/event-notification-onboarding.md).

### Activity & Timeline Framework (SPR-007)

Manifest extraction supports `activities.types` and `activities.timelines` blocks. Runtime discovers capability declarations; app bootstrap composes:

```text
bootstrapActivityRegistry() + bootstrapTimelineRegistry()
        ↓
filterActivityRegistryDto() + filterTimelineRegistryDto()
        ↓
buildActivityTimelineHydrationBundle()
        ↓
ActivityTimelineProvider (client metadata only)
```

Activity Mapping wires via shared Event Bus in `wireAppActivityTimeline()` — parallel subscriber to notification mapping. Same `capability.action.executed` event may produce both notification and activity items.

**Rules:**

- Runtime subsystems do not import `@apzhub/activity-timeline-framework/react`
- Activity Mapping subscribes only — never publishes events
- Capabilities publish events; Activity Framework maps to timeline items
- Session-scoped activity store — no persistence in M7

See [Activity Timeline onboarding](../developer/activity-timeline-onboarding.md) · [activity-timeline-framework.md](../architecture/activity-timeline-framework.md).

---

## Testing

| Test type   | Focus                                    |
| ----------- | ---------------------------------------- |
| Unit        | Each subsystem in isolation              |
| Integration | Full bootstrap pipeline, failure paths   |
| Fixtures    | Valid/invalid manifests in test fixtures |

Coverage thresholds: ≥ 85% on runtime subsystems (per package config).

---

## Safe extension checklist

- [ ] ADR filed for boundary or pipeline changes
- [ ] No React/UI dependencies added to package.json
- [ ] Manifest schema tested with fixtures
- [ ] Lifecycle transitions validated
- [ ] Diagnostics updated
- [ ] Integration test for bootstrap path
- [ ] Architecture doc updated

---

_APZHUB Runtime Development Guide — safe extension of the Platform Runtime._
