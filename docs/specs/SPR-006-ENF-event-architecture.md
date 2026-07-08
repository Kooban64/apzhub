# SPR-006 — Event Architecture and Taxonomy

> **Story:** EN-001 — Event & Notification Architecture  
> **Sprint:** SPR-006 — Event & Notification Framework  
> **Status:** Specification — **no implementation**  
> **Authority:** [Document 029](../029-platform-event-sdk-event-bus-event-manifest-specification.md) · [Document 012](../012-event-driven-architecture-background-processing-workflow-framework.md) · [Event Framework](../architecture/event-framework.md) · ADRs [0030](../adr/ADR-0030-event-notification-framework-package.md) · [0031](../adr/ADR-0031-event-registry-and-bus.md)

---

## 1. Purpose

Define the **Event Architecture** — event model, registry integration, Event Bus contracts, and **canonical Event taxonomy** for APZHUB.

Events enable decoupled communication. Events are **not** notifications.

**EN-001 scope:** Architecture and taxonomy only. No Event Bus implementation.

---

## 2. Vision

```text
Platform Capability completes work
        ↓
Publishes registered Domain Event
        ↓
Platform Event Bus dispatches
        ↓
Independent subscribers react (notifications · activity · audit · search)
```

Per Document 012 and 029 — modules do not notify, audit, or activity directly; they publish events.

---

## 3. Registered Event model

### 3.1 Definition

A **Registered Event** is metadata describing a publishable platform event — stored in **EventRegistry**, not the event instance itself.

| Property        | Description                                                               |
| --------------- | ------------------------------------------------------------------------- |
| `eventId`       | Stable lowercase dot-notation (e.g. `capability.action.executed`)         |
| `version`       | Semver schema version                                                     |
| `category`      | Canonical taxonomy value (§4)                                             |
| `label`         | Human-readable name for diagnostics                                       |
| `publisher`     | Declaring capability or service id                                        |
| `subscribers`   | Declared consumer ids (`notifications`, `activity`, `audit`, `search`, …) |
| `payloadSchema` | Zod schema or JSON schema reference                                       |
| `status`        | `active` · `planned` · `deprecated`                                       |
| `permission`    | Optional publish gate (M8 RBAC population)                                |

### 3.2 Platform Event instance

When published, a **Platform Event** is a single **PlatformEventEnvelope** instance — see [SPR-006-ENF-event-envelope.md](./SPR-006-ENF-event-envelope.md).

| Property        | Instance vs registration |
| --------------- | ------------------------ |
| `eventId`       | From registration        |
| `envelopeId`    | Unique per publish       |
| `payload`       | Instance-specific data   |
| `timestamp`     | Publish time             |
| `correlationId` | Trace chain              |

### 3.3 Rules

1. **Register before publish** — unregistered `eventId` rejected
2. **Publish after success** — not before transaction/commit (Document 029 §10)
3. **Idempotent subscribers** — duplicate delivery safe (Document 029 §11)
4. **No notification publish** — notification subsystem never calls `publish()`
5. **Server-only publish in SPR-006** — no client Event Bus API

---

## 4. Event taxonomy

### 4.1 Canonical categories

APZHUB defines **four primary event categories**. Every platform catalogue event uses one of these in SPR-006.

| Category               | `category` value | Scope                                        | Publisher typical            |
| ---------------------- | ---------------- | -------------------------------------------- | ---------------------------- |
| **System Events**      | `system`         | Platform infrastructure, lifecycle, health   | platform-runtime, auth       |
| **User Events**        | `user`           | Authenticated user behaviour and preferences | auth, preferences, workbench |
| **Capability Events**  | `capability`     | Domain state changes from capabilities       | command-framework, modules   |
| **Integration Events** | `integration`    | Connector and external system boundaries     | integration adapters         |

### 4.2 System Events — examples

| eventId                               | Publisher        | Trigger                   | Example payload                   |
| ------------------------------------- | ---------------- | ------------------------- | --------------------------------- |
| `system.platform.bootstrap.completed` | platform-runtime | Runtime bootstrap success | `{ durationMs, capabilityCount }` |
| `system.platform.bootstrap.failed`    | platform-runtime | Bootstrap failure         | `{ phase, errorCode }`            |
| `system.platform.health.degraded`     | platform-runtime | Health check failure      | `{ subsystem, status }`           |
| `system.platform.health.recovered`    | platform-runtime | Health restored           | `{ subsystem }`                   |
| `system.registry.conflict.detected`   | platform-runtime | Duplicate registration    | `{ registryId, key }`             |
| `system.config.reloaded`              | platform-runtime | Config hot reload         | `{ source }`                      |

### 4.3 User Events — examples

| eventId                   | Publisher           | Trigger              | Example payload                      |
| ------------------------- | ------------------- | -------------------- | ------------------------------------ |
| `user.session.started`    | auth                | User login success   | `{ userId, sessionId }`              |
| `user.session.ended`      | auth                | Logout or expiry     | `{ userId, reason }`                 |
| `user.preference.changed` | preferences-service | Preference update    | `{ key, scope, value }`              |
| `user.workspace.switched` | workbench-framework | Workspace change     | `{ fromWorkspaceId, toWorkspaceId }` |
| `user.profile.updated`    | auth                | Profile field change | `{ userId, fields }`                 |

### 4.4 Capability Events — examples

| eventId                               | Publisher                     | Trigger                      | Example payload                   |
| ------------------------------------- | ----------------------------- | ---------------------------- | --------------------------------- |
| `capability.action.executed`          | command-framework             | Successful action execute    | `{ actionId, actor, resultCode }` |
| `capability.action.failed`            | command-framework             | Failed action execute        | `{ actionId, actor, errorCode }`  |
| `capability.theme.changed`            | theme-service                 | Theme toggle/set             | `{ themeId, previousThemeId }`    |
| `capability.navigation.opened`        | workbench-framework           | View/route open              | `{ routeId, workspaceId }`        |
| `capability.knowledge.query.executed` | knowledge-discovery-framework | Query completed (future)     | `{ queryId, resultCount }`        |
| `capability.example.record.created`   | example-capability            | Business record create (M9+) | `{ recordId }`                    |

**SPR-006 first live publisher:** `capability.action.executed` via Action audit hook (EN-014).

### 4.5 Integration Events — examples

| eventId                                | Publisher           | Trigger                   | Example payload                         |
| -------------------------------------- | ------------------- | ------------------------- | --------------------------------------- |
| `integration.connector.registered`     | platform-runtime    | Connector manifest loaded | `{ connectorId }`                       |
| `integration.connector.sync.started`   | integration-adapter | Sync job start            | `{ connectorId, jobId }`                |
| `integration.connector.sync.completed` | integration-adapter | Sync success              | `{ connectorId, recordCount }`          |
| `integration.connector.sync.failed`    | integration-adapter | Sync failure              | `{ connectorId, errorCode, retryable }` |
| `integration.webhook.received`         | integration-gateway | Inbound webhook           | `{ source, eventType }`                 |
| `integration.api.rate_limited`         | integration-gateway | Rate limit hit            | `{ connectorId, retryAfterMs }`         |

### 4.6 Document 029 extended categories

When primary four categories are insufficient, register with explicit extended values:

| Extended category | Use when                                                      |
| ----------------- | ------------------------------------------------------------- |
| `security`        | Auth failures, policy violations, MFA                         |
| `infrastructure`  | Deployment, scaling, resource limits                          |
| `business`        | Business-domain events (prefer `capability` when from module) |
| `notification`    | Meta-events about notification system (rare)                  |
| `ai`              | AI agent actions (future)                                     |

Extended categories require ADR note if they introduce new subscriber contracts.

---

## 5. Event Registry integration

### 5.1 Bootstrap pipeline

```text
Runtime manifest discovery
        ↓
Extract events from manifests + event.yaml
        ↓
Merge PlatformEventCatalogue (built-in)
        ↓
EventRegistry.register() for each
        ↓
Diagnostics: duplicates, orphans, planned stubs
```

### 5.2 Registry vs Event Bus

| Concern       | EventRegistry               | InProcessEventBus            |
| ------------- | --------------------------- | ---------------------------- |
| Stores        | Event metadata              | Nothing (stateless dispatch) |
| Lifecycle     | Bootstrap                   | Runtime server process       |
| Client access | Read-only DTO (diagnostics) | No client access             |

### 5.3 Distinction from ADR-0015

| ADR-0015 manifest discovery    | Event Registry (this spec)            |
| ------------------------------ | ------------------------------------- |
| Validates capability manifests | Indexes publishable event definitions |
| All YAML kinds                 | Event declarations only               |
| Bootstrap validation           | Publish-time enforcement              |

---

## 6. Event Bus contract (specification)

### 6.1 Publish

```typescript
interface EventBusPublishResult {
  readonly ok: boolean;
  readonly envelopeId?: string;
  readonly errorCode?: "EVENT_NOT_REGISTERED" | "INVALID_ENVELOPE" | "PUBLISH_FAILED";
}

publish(envelope: PlatformEventEnvelope): EventBusPublishResult;
```

### 6.2 Subscribe

```typescript
interface EventSubscription {
  readonly subscriptionId: string;
  readonly eventPattern: string; // exact id or prefix pattern (EN-004 spec)
  readonly handler: (envelope: PlatformEventEnvelope) => void | Promise<void>;
}

subscribe(options: EventSubscription): string; // returns subscriptionId
unsubscribe(subscriptionId: string): boolean;
```

### 6.3 Subscriber isolation

Subscriber exceptions are caught, logged, and do not prevent other subscribers from receiving the event.

---

## 7. Manifest registration

See [SPR-006-ENF-event-manifest.md](./SPR-006-ENF-event-manifest.md).

---

## 8. Extension points

| Extension              | SPR-006 | Future                       |
| ---------------------- | ------- | ---------------------------- |
| InProcessEventBus      | ✅      | External transport adapter   |
| Platform catalogue     | ✅      | Module events from manifests |
| Action audit publisher | EN-014  | —                            |
| Knowledge query events | Stub    | Ranking subscriber           |
| Persistent event log   | Stub    | M7/M10                       |
| Event replay           | Stub    | M10                          |

---

## 9. Acceptance criteria (EN-001)

- [x] Event taxonomy documented with four canonical categories
- [x] Examples provided for each category
- [x] Registered Event model defined
- [x] Event Bus contract specified
- [x] Registry integration documented
- [x] ADR-0031 accepted
- [ ] Owner review before EN-002 — pending

---

_SPR-006 Event Architecture and Taxonomy — EN-001._
