# CAPABILITY-REGISTRATION — APZQEP-165-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-165-000   |
| Timestamp | 20260804T054651Z |
| Priority  | **FOUNDATIONAL** |

## Mandatory rule

```text
The Orchestration Platform SHALL coordinate registered quality capabilities.
It SHALL NOT contain business logic owned by any capability.
Capabilities register orchestration contracts.
The Orchestration Platform invokes those contracts.
New capabilities shall require registration only.
The orchestration engine shall never require redesign because a new capability exists.
```

This is the supreme Wave 5 architectural principle. Wave numbers are historical delivery labels — not the orchestration contract surface.

## What a “quality capability” is

A registered platform capability that can participate in a Quality Flow via a published **orchestration contract**. Examples:

| Initial V1.1 registrations (existing) | Future registrations (illustrative — not authorised here) |
| ------------------------------------- | --------------------------------------------------------- |
| Automation                            | Security Testing                                          |
| SCM                                   | Accessibility Engineering                                 |
| Quality Intelligence                  | Performance Engineering                                   |
| Evidence                              | Chaos Engineering                                         |
| Reporting (read / project)            | Compliance Engines                                        |
| Dashboard / Visualization (consume)   | External AI Providers (163A/B/C when authorised)          |
| Notifications / Command (touchpoints) | Additional SCM / automation providers                     |

## Orchestration contract (architecture)

Every capability that participates in orchestration SHALL register:

| Field                    | Purpose                                            |
| ------------------------ | -------------------------------------------------- |
| `capabilityId`           | Stable identifier (e.g. `automation`, `scm`, `qi`) |
| `version`                | Contract version                                   |
| `operations[]`           | Invokable operations (start run, evaluate, fetch…) |
| `eventsPublished[]`      | Past-tense events the capability emits             |
| `eventsConsumed[]`       | Events it may subscribe to (optional)              |
| `inputSchema` / `output` | Typed payloads for orchestration steps             |
| `health`                 | Health reporting hook                              |
| `idempotency`            | How duplicate invocations are handled              |
| `timeouts` / `cancel`    | Cancellation and timeout semantics                 |
| `permissions`            | Required platform permissions to invoke            |
| `failureModes`           | Declared failure categories for recovery policy    |

Capabilities **own** their business logic behind the contract. Orchestration stores only references, intents, and coordination state.

## Registration lifecycle

```text
DECLARED → REGISTERED → ACTIVE → DEPRECATED → RETIRED
```

| State      | Meaning                                          |
| ---------- | ------------------------------------------------ |
| DECLARED   | Manifest present; not yet discoverable for flows |
| REGISTERED | Discoverable; not yet used in production flows   |
| ACTIVE     | Eligible for Quality Flow steps                  |
| DEPRECATED | Usable with warning; migration path required     |
| RETIRED    | Not invokable; historical runs retain audit refs |

Registration is **manifest-first** (aligns with Platform SDK 024 / Integration SDK 026 / Service SDK 027 / Event SDK 029). Exact manifest filename for engineering is deferred to APZQEP-165 Owner Auth (recommendation: extend existing SDK manifests or add `orchestration.yaml` capability section — **OUTSTANDING NON-BLOCKING**).

## Discovery

`@apzhub/platform-orchestration` maintains a **Capability Registry** (platform metadata SoR for registration records only). Quality Flows reference `capabilityId` + operation — never package internals.

## Adding a future capability

1. Capability platform (or provider programme) implements its domain.
2. Capability publishes an orchestration contract and registers.
3. Quality Flow / policy definitions reference the new capability where needed.
4. **No redesign** of the orchestration engine is required.

## Explicit rejections

| Anti-pattern                                       | Why rejected                     |
| -------------------------------------------------- | -------------------------------- |
| Hard-coding “Wave 1–4” into engine core            | Breaks on Wave N+1 / new domains |
| Embedding Automation/QI/SCM logic in orchestration | Violates 008/009 boundaries      |
| Capability calling orchestration internals         | Reverse dependency               |
| Silent capability without registration             | Undiscoverable; unauditable      |
