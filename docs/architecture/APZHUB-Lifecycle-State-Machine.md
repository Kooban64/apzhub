# APZHUB Lifecycle State Machine

**Milestone:** PRH-009  
**Status:** Authoritative platform lifecycle transitions

---

## Startup progression

```
initializing
  → bootstrapping
  → configuration-ready
  → identity-ready
  → authorization-ready
  → platform-ready
  → products-ready
  → operational
```

State is derived deterministically from consolidated diagnostics readiness gates unless an operator override is active.

---

## Valid transitions

| From | Allowed transitions |
|------|---------------------|
| `initializing` | `bootstrapping`, `degraded`, `stopped` |
| `bootstrapping` | `configuration-ready`, `degraded`, `recovering`, `stopped` |
| `configuration-ready` | `identity-ready`, `degraded`, `recovering`, `stopped` |
| `identity-ready` | `authorization-ready`, `degraded`, `recovering`, `stopped` |
| `authorization-ready` | `platform-ready`, `degraded`, `recovering`, `stopped` |
| `platform-ready` | `products-ready`, `degraded`, `recovering`, `stopped` |
| `products-ready` | `operational`, `degraded`, `recovering`, `stopped` |
| `operational` | `maintenance`, `degraded`, `stopping`, `recovering` |
| `maintenance` | `operational`, `stopping` |
| `degraded` | `recovering`, `operational`, `stopping`, `stopped` |
| `recovering` | startup states, `operational`, `degraded` |
| `stopping` | `stopped` |
| `stopped` | `initializing`, `recovering` |

Implementation: `packages/platform-lifecycle/src/state-machine.ts`

---

## Readiness gates

| Gate | Satisfied when |
|------|----------------|
| Bootstrapping | Platform bootstrap completed |
| Configuration Ready | Environment validation passed |
| Identity Ready | Identity diagnostics available and database healthy |
| Authorization Ready | Authorization diagnostics available |
| Platform Ready | Bootstrap, config, identity, auth, persistence, session, tenant guard, readiness probe |
| Products Ready | Platform ready and registered products healthy |
| Operational | Products ready and platform health not degraded |

Implementation: `packages/platform-lifecycle/src/lifecycle-context-builder.ts`

---

## Dependency sequencing

Startup order is defined by `sequenceOrder` in capability and product registrations:

1. Configuration → Persistence → Runtime → Bootstrap
2. Identity → Authorization
3. Security stack (security, traffic, session, tenant isolation)
4. Workbench, API framework, Operations
5. Products (Law Platform, Trust Accounting)

Implementation: `packages/platform-lifecycle/src/registrations.ts`

---

## Operator overrides

Explicit runtime state takes precedence:

- **Maintenance mode** → `maintenance`
- **Graceful shutdown** → `stopping` → `stopped`
- **Recovery** → `recovering` until gates satisfied → `operational`

Implementation: `packages/platform-lifecycle/src/platform-lifecycle-manager.ts`
