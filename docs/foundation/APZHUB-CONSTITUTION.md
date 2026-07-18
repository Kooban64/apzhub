# APZHUB Constitution

> **Purpose:** Immutable programme principles governing all APZHUB engineering  
> **Audience:** Every developer, reviewer, owner, and AI agent  
> **Authoritative references:** [000 — Engineering Constitution](../000-apzhub-engineering-constitution.md) — **supreme authority on conflict**  
> **Related documents:** [APZHUB-MASTER-BRIEF](./APZHUB-MASTER-BRIEF.md) · [001 — Vision](../001-project-vision-and-guiding-principles.md) · [003 — Architecture](../003-overall-system-architecture-design-principles.md)  
> **Reading order:** Read first in the Knowledge Foundation  
> **Last updated:** 2026-07-10  
> **Current status:** **Immutable** — changes require owner approval and ADR

---

## Authority

This document consolidates immutable programme principles for the Knowledge Foundation. On any conflict:

1. **[000 — Engineering Constitution](../000-apzhub-engineering-constitution.md)** — supreme authority
2. **Foundation documents 001–029** — architectural and engineering standards
3. **This Constitution** — programme-level consolidation for onboarding and AI context
4. ADRs, sprint guides, and implementation docs — must comply with all above

No sprint guide, backlog item, or AI-generated code may override these principles without explicit owner direction and ADR.

---

## Immutable principles

### Platform ownership

| Principle                                           | Rule                                                                                                                              |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Platform Core owns cross-cutting capabilities**   | Identity, authorization, governance, operations, security, lifecycle, runtime, workbench, events, notifications, search, activity |
| **Products consume Platform capabilities**          | Law Platform and future products use Platform packages — never reimplement                                                        |
| **Products never duplicate Platform functionality** | No product-local IAM, ops console, or event bus                                                                                   |
| **Workbench is always APZHUB**                      | One desktop shell; permission-driven UI; no engine-branded layouts                                                                |

### Integration boundary

| Principle                                               | Rule                                                                           |
| ------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Vendor systems are hidden behind adapters**           | Clients never call Plane, Kimai, Paperless, etc.                               |
| **Capability services never handle vendor credentials** | Flow: Service → Adapter → Integration SDK → Auth Provider → Connection Manager |
| **Credentials stay inside the integration boundary**    | Never in diagnostics, errors, logs, events, or user responses                  |
| **User-facing names are APZHUB names**                  | Projects, Documents, Time Tracking — not engine names                          |

### Platform-owned domains

| Domain                        | Owner                                                                       |
| ----------------------------- | --------------------------------------------------------------------------- |
| **Identity**                  | Platform Core (`@apzhub/platform-identity`, `@apzhub/auth`)                 |
| **Authorization**             | Platform Core (`@apzhub/platform-authorization`)                            |
| **Governance & provisioning** | Platform Core (`@apzhub/platform-governance`)                               |
| **Security & resilience**     | Platform Core (`@apzhub/platform-security`)                                 |
| **Operations & lifecycle**    | Platform Core (`@apzhub/platform-operations`, `@apzhub/platform-lifecycle`) |

BetterAuth handles authentication only. APZHUB owns permissions, roles, provisioning, and audit.

### Engineering discipline

| Principle                                     | Rule                                                        |
| --------------------------------------------- | ----------------------------------------------------------- |
| **Planning precedes implementation**          | Requirements → architecture → design → implementation       |
| **Architecture before coding**                | Read foundation docs and ADRs before writing code           |
| **ADR before significant change**             | New technology, boundary change, or constitution conflict   |
| **Documentation is mandatory**                | Specs, architecture, completion reports for every milestone |
| **Testing is mandatory**                      | Unit, integration, API, E2E; CI must pass before merge      |
| **Security by design**                        | Zero Trust on every request; least privilege                |
| **Tenant isolation by design**                | All connections, data, and operations are tenant-scoped     |
| **Backward compatibility where practical**    | SDK semver; no breaking exports without approval            |
| **No shortcuts that compromise architecture** | No Module→Connector bypass; no frontend-only authz          |

### Layered architecture (non-negotiable)

```text
Presentation → Application → Domain → Services → Adapters → Backend Engines
```

- Modules call Platform Services only
- Platform Services call Integration SDK / connectors only
- Connectors translate errors; never expose raw backend errors
- Reverse dependencies prohibited

See [003 — Overall System Architecture](../003-overall-system-architecture-design-principles.md).

### Quality and release

| Principle              | Rule                                                                        |
| ---------------------- | --------------------------------------------------------------------------- |
| **Definition of Done** | Tests pass, docs complete, reviewed, architecture compliant                 |
| **CI every commit**    | Lint, types, build, tests, security checks                                  |
| **Phase gates**        | Stop at sprint boundaries; await owner approval for next milestone          |
| **Manifest first**     | `module.yaml`, `service.yaml`, `integration.yaml`, `event.yaml` before code |

See [015 — Quality Framework](../015-software-quality-testing-qa-cicd-release-management-framework.md).

---

## What this Constitution does not do

- It does **not** replace [000](../000-apzhub-engineering-constitution.md) — that document remains supreme
- It does **not** define implementation details — see foundation docs 001–029
- It does **not** authorise work — see [CURRENT-MILESTONE](./CURRENT-MILESTONE.md)

---

## Amendment process

1. Owner identifies conflict or required evolution
2. ADR drafted with alternatives and consequences
3. Foundation document updated if architectural standard changes
4. This Constitution updated only for programme-level principle consolidation
5. All indexes and AI context documents updated

Unilateral changes by developers or AI agents are **not permitted**.
