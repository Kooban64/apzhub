# Platform Manifest Specification — Recommendations

> **Status:** Recommendation (SPR-002 planning)  
> **Authority:** Documents [025](../025-module-sdk-module-manifest-module-development-standard.md)–[029](../029-platform-event-sdk-event-bus-event-manifest-specification.md)  
> **Constraint:** **Do not modify** existing SDK documents. This document proposes a unified model for the Registry runtime only.

---

## 1. Purpose

SDK documents 025–029 define **separate manifest files** per capability kind. The Platform Registry requires a **unified internal model** to index, validate, and query all capabilities consistently.

This specification:

- Proposes a **Platform Manifest Envelope** — a normalised internal representation
- Maps existing SDK manifests into the envelope **without changing SDK specs**
- Proposes **extensions** for kinds not yet fully specified (themes, workers, commands)
- Recommends **optional** consolidation patterns for future SDK revisions (owner decision only)

---

## 2. Design principles

| Principle                              | Rationale                                                                 |
| -------------------------------------- | ------------------------------------------------------------------------- |
| **SDK manifests remain authoritative** | Registry adapts to SDKs; not vice versa                                   |
| **Single internal envelope**           | One validation pipeline; one storage shape                                |
| **Kind-specific payloads**             | Preserve rich SDK structures as typed sub-objects                         |
| **Filesystem-first**                   | YAML files remain human-readable and Cursor-friendly                      |
| **Explicit kind**                      | Every manifest declares its kind (recommended addition to existing files) |

---

## 3. Platform Manifest Envelope (internal)

The Registry normalises every manifest into:

```typescript
interface PlatformManifestEnvelope {
  /** Normalised metadata */
  id: string;
  name: string;
  version: string;
  kind: CapabilityKind;
  manifestSchemaVersion: string;
  sourcePath: string;
  contentHash: string;

  metadata: {
    category?: string;
    owner?: string;
    description?: string;
    tags?: string[];
    icon?: string;
  };

  compatibility: {
    platformVersion?: string;
    requires?: string[];
  };

  lifecycle: {
    status: "installed" | "enabled" | "disabled" | "deprecated";
  };

  health?: {
    enabled: boolean;
    endpoint?: string;
  };

  dependencies?: {
    platform?: string[];
    services?: string[];
    integrations?: string[];
    modules?: string[];
  };

  /** Kind-specific payload — one of the sections below */
  payload: CapabilityPayload;
}
```

### 3.1 Capability kinds

```typescript
type CapabilityKind =
  | "module"
  | "service"
  | "integration"
  | "component"
  | "event"
  | "theme"
  | "command"
  | "search-provider"
  | "worker"
  | "dashboard"
  | "widget"
  | "report"
  | "ai-provider" // future
  | "feature-flag"; // future
```

---

## 4. Mapping from existing SDK manifests

### 4.1 Module (`module.yaml` — Document 025)

| SDK root key                               | Envelope mapping                             |
| ------------------------------------------ | -------------------------------------------- |
| `module.id`                                | `id`                                         |
| `module.name`                              | `name`                                       |
| `module.version`                           | `version`                                    |
| `kind`                                     | `"module"` (recommended new top-level field) |
| `metadata.*`                               | `metadata`                                   |
| `compatibility.*`                          | `compatibility`                              |
| `navigation`, `permissions`, `commands`, … | `payload.module.*`                           |

**Embedded projections** (same file, multiple indices):

| SDK section         | Registry index                                |
| ------------------- | --------------------------------------------- |
| `commands[]`        | `kind: command` entries with `sourceModuleId` |
| `searchProviders[]` | `kind: search-provider`                       |
| `widgets[]`         | `kind: widget`                                |
| `dashboards[]`      | `kind: dashboard`                             |
| `reports[]`         | `kind: report`                                |

### 4.2 Service (`service.yaml` — Document 027)

| SDK root key            | Envelope mapping              |
| ----------------------- | ----------------------------- |
| `service.id`            | `id`                          |
| `service.name`          | `name`                        |
| `service.version`       | `version`                     |
| `dependencies.platform` | `dependencies.platform`       |
| `integrations[]`        | `dependencies.integrations`   |
| `events.publishes[]`    | `payload.service.events`      |
| `permissions[]`         | `payload.service.permissions` |

### 4.3 Integration (`integration.yaml` — Document 026)

| SDK root key       | Envelope mapping                   |
| ------------------ | ---------------------------------- |
| `integration.id`   | `id`                               |
| `integration.type` | `payload.integration.type`         |
| `capabilities[]`   | `payload.integration.capabilities` |
| `health.*`         | `health`                           |

### 4.4 Component (`component.yaml` — Document 028)

**Current SPR-001 format** (minimal):

```yaml
id: button
name: Button
category: primitive
version: 0.0.0
description: Token-driven button primitive.
```

**Recommended additions** (non-breaking):

```yaml
kind: component
manifestSchemaVersion: "1.0"
component:
  id: button
  name: Button
  version: 0.0.0
metadata:
  category: primitive
  description: Token-driven button primitive.
theme:
  supportsDarkMode: true
storybook:
  enabled: true
tests:
  unit: true
  accessibility: true
```

Registry accepts **both** flat and nested formats during transition.

### 4.5 Event (`event.yaml` — Document 029)

| SDK root key     | Envelope mapping              |
| ---------------- | ----------------------------- |
| `event.id`       | `id`                          |
| `event.version`  | `version`                     |
| `publisher`      | `payload.event.publisher`     |
| `subscribers[]`  | `payload.event.subscribers`   |
| `payload` schema | `payload.event.payloadSchema` |

---

## 5. Proposed extensions (not in SDK docs yet)

These are **recommendations** for Registry completeness. Future SDK revisions may adopt them.

### 5.1 Theme (`theme.yaml` — aligns with Document 022)

```yaml
kind: theme
manifestSchemaVersion: "1.0"

theme:
  id: apzhub-dark
  name: APZHUB Dark
  version: 1.0.0

metadata:
  category: platform
  mode: dark

compatibility:
  platformVersion: ">=0.2.0"

presentation:
  tokenSet: packages/theme/src/tokens.css
  extends: apzhub-light # optional

health:
  enabled: false
```

### 5.2 Standalone command (`command.yaml` — optional alternative to module-embedded)

For platform-level commands (not module-owned):

```yaml
kind: command
manifestSchemaVersion: "1.0"

command:
  id: platform.toggle-theme
  label: Toggle Theme
  category: Appearance
  shortcut: Ctrl+Shift+T

metadata:
  owner: platform

execution:
  type: client-action
  handler: theme.toggle

permissions:
  required: []
```

**Recommendation:** Prefer module-embedded commands (025/019) for module actions; use standalone `command.yaml` only for platform/shell commands until Command Palette sprint.

### 5.3 Worker (`worker.yaml` — aligns with Document 012)

```yaml
kind: worker
manifestSchemaVersion: "1.0"

worker:
  id: search-indexer
  name: Search Index Worker
  version: 1.0.0

metadata:
  category: infrastructure

schedule:
  type: cron
  expression: "0 * * * *"

events:
  subscribes:
    - ProjectCreated
    - DocumentUpdated

health:
  enabled: true
```

### 5.4 Dashboard / Widget / Report (embedded in module.yaml — recommended)

**Recommendation:** Keep dashboards, widgets, and reports **embedded in `module.yaml`** per 025 examples. Registry projects them into separate indices. Standalone files only if a future SDK revision requires shared dashboards across modules.

### 5.5 AI provider (future)

```yaml
kind: ai-provider
manifestSchemaVersion: "1.0"

aiProvider:
  id: local-llm
  name: Local LLM
  version: 0.0.0
  status: disabled
```

Registry indexes with `status: disabled` until AI sprint.

### 5.6 Feature flag (future)

```yaml
kind: feature-flag
manifestSchemaVersion: "1.0"

featureFlag:
  id: registry-persistence
  name: Registry PostgreSQL Cache
  default: true
```

---

## 6. Unified vs separate manifest files

### Option A — Separate files per SDK (current — **recommended**)

| Advantages                   | Disadvantages                              |
| ---------------------------- | ------------------------------------------ |
| Matches docs 025–029 exactly | More files to scan                         |
| Clear ownership per kind     | Embedded commands require projection logic |
| Cursor workflow unchanged    |                                            |

### Option B — Single `platform.yaml` per package

| Advantages               | Disadvantages                              |
| ------------------------ | ------------------------------------------ |
| One file per package     | **Conflicts with manifest-first SDK docs** |
| Easier atomic versioning | Requires SDK revision                      |

### Option C — Hybrid

- Keep SDK manifest files
- Optional `platform.bundle.yaml` re-exports references (not recommended for SPR-002)

**Recommendation:** **Option A** — separate SDK manifests + Registry normalisation layer.

---

## 7. Recommended additions to existing manifests (SPR-002)

Non-breaking fields to add during implementation:

| Field                           | Applies to    | Purpose                     |
| ------------------------------- | ------------- | --------------------------- |
| `kind`                          | All manifests | Explicit kind for discovery |
| `manifestSchemaVersion`         | All manifests | Schema evolution            |
| `compatibility.platformVersion` | All manifests | Version gating              |

Do **not** restructure existing `component.yaml` files unless ADR approved — Registry parser handles flat format.

---

## 8. Validation ownership

| Layer                  | Owner                                            |
| ---------------------- | ------------------------------------------------ |
| YAML syntax            | Registry discovery                               |
| SDK schema compliance  | `@apzhub/platform-runtime/manifests` Zod schemas |
| SDK document authority | Documents 025–029 (unchanged)                    |
| Unified envelope       | Registry normaliser                              |

---

## 9. Open questions for owner

1. Require nested `component:` root vs continue supporting flat SPR-001 format?
2. Adopt standalone `command.yaml` for platform commands in SPR-002 or defer to Command Palette sprint?
3. File `theme.yaml` per theme vs programmatic registration for built-in light/dark?

---

_Recommendations only — no SDK document changes in this sprint._
