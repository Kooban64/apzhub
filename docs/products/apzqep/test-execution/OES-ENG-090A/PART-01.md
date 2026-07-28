# APZQEP-OES-ENG-090A

# PART 1 — Objectives, Package Boundaries, Module Structure & Fidelity

| Item                  | Value                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------- |
| Document              | **APZQEP-OES-ENG-090A**                                                                                       |
| Title                 | Test Execution Engineering Specification                                                                      |
| Programme             | **APZQEP-OES-ENG-090A**                                                                                       |
| Capability            | Test Execution                                                                                                |
| Layer                 | Complete Capability Engineering Specification                                                                 |
| Status                | **ACCEPTED / APPROVED / ENGINEERING SPECIFICATION BASELINED / CLOSED**                                        |
| Version               | **1.0.0-oes**                                                                                                 |
| Part                  | **1 of 5**                                                                                                    |
| Date                  | 2026-07-28                                                                                                    |
| Architecture baseline | [APZQEP-ARCH-015](../OES-ARCH-015/COMPLETE.md) **ACCEPTED / ARCHITECTURE BASELINED / CLOSED**                 |
| Governing methodology | [OES-000](../../../../engineering/oes/OES-000-Owner-Engineering-Specification-Standard.md) **FROZEN 1.0.0**   |
| Writing standard      | [OES-001](../../../../engineering/oes/OES-001-Engineering-Writing-Standard.md) **FROZEN 1.0.0**               |
| Review standard       | [OES-002](../../../../engineering/oes/OES-002-Engineering-Review-and-Acceptance-Standard.md) **FROZEN 1.1.0** |
| Constitution          | [APZQEP-CONSTITUTION.md](../../APZQEP-CONSTITUTION.md) **v1.0.0 RATIFIED / BASELINED**                        |
| Document 000          | [000-apzhub-engineering-constitution.md](../../../../000-apzhub-engineering-constitution.md)                  |
| Standing record       | [STANDING-PROGRAMME-RECORD.md](../../STANDING-PROGRAMME-RECORD.md) **IN FORCE**                               |

**Normative language:** **SHALL** / **MUST** = mandatory; **SHOULD** = strong recommendation; **MAY** = optional (RFC 2119 as applied by OES-001).

---

## 1. Executive summary

This document is the authoritative **Engineering Specification** for the Test Execution capability within APZ QEP.

It translates the Owner-Accepted Architecture **APZQEP-ARCH-015** into a complete, implementation-ready engineering contract covering package boundaries, module structure, Domain interfaces, Application services, Infrastructure contracts, API contracts, persistence, events, security, Workbench contracts, testing strategy, observability, acceptance criteria, and engineering traceability.

This programme **SHALL** produce specification, validation, evidence, and Owner decision material only.

This programme **SHALL NOT** produce production code, database migrations, packages, implementation, Engineering Completion Review, certification, version changes, or freeze.

---

## 2. Programme authority

| Field                        | Value                                                                                                             |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Owner Instruction            | APZQEP-OES-ENG-090A — AUTHORISED TO COMMENCE (Engineering Specification)                                          |
| Programme type               | Engineering Specification                                                                                         |
| Sole architectural authority | **APZQEP-ARCH-015** (baselined)                                                                                   |
| Authorises                   | Complete Engineering Specification documentation, validation, evidence, Owner decision pack                       |
| Does not authorise           | Production code · migrations · package creation · implementation · ECR · certification · version changes · freeze |

---

## 3. Programme objective

Define how Test Execution **SHALL** be engineered such that subsequent, separately authorised Engineering programmes can proceed without inventing missing business behaviour or architectural decisions.

The specification **SHALL**:

1. Fix package and module boundaries for Domain, Application, Infrastructure, API, and Workbench.
2. Specify Domain interfaces (aggregate, entities, value objects, commands, invariants, lifecycle).
3. Specify Application services (orchestration, authz, `availableActions`, audit, events).
4. Specify Infrastructure contracts (persistence, outbox, search publication, frozen-capability clients).
5. Specify API contracts and error categories.
6. Specify security, tenancy, and ingestion trust-boundary requirements.
7. Specify Workbench presentation contracts bound to `availableActions`.
8. Specify testing strategy and observability requirements.
9. Provide acceptance criteria and engineering traceability to ARCH-015 / ADRs.
10. Preserve frozen baselines by reference only.

---

## 4. Architectural fidelity

| Source              | Authority                                                                      |
| ------------------- | ------------------------------------------------------------------------------ |
| APZQEP-ARCH-015     | Capability Architecture — **BASELINED** — sole architectural authority         |
| ADR-0075 … ADR-0086 | Accepted architectural decisions                                               |
| This OES            | Engineering contract — **no deviation without ADR or Owner-approved revision** |

Any conflict with ARCH-015 **SHALL** be resolved in favour of ARCH-015 unless an Owner-approved ADR records an intentional change.

This OES **SHALL NOT** redefine Architecture. It **SHALL** refine implementable contracts within Architecture bounds.

---

## 5. Frozen dependencies (immutable)

| Capability          | Package                           | Status                       | Engineering rule                                       |
| ------------------- | --------------------------------- | ---------------------------- | ------------------------------------------------------ |
| Requirements        | `@apzhub/qep-requirements`        | **1.0.0 CERTIFIED / FROZEN** | Reference by id only                                   |
| Traceability        | `@apzhub/qep-traceability`        | **1.0.0 CERTIFIED / FROZEN** | Relationship vocabulary; no fork                       |
| Verification        | `@apzhub/qep-verification`        | **1.0.0 CERTIFIED / FROZEN** | Outcomes do not auto-finalise Verification             |
| Test Specifications | `@apzhub/qep-test-specifications` | **1.0.0 CERTIFIED / FROZEN** | Versioned source refs + resolve for seal               |
| Test Plans          | `@apzhub/qep-test-plans`          | **1.0.0 CERTIFIED / FROZEN** | Plan/item refs + readiness; no result storage on Plans |

Engineering **SHALL NOT** redefine, fork, remediate, rename, weaken, or version-bump any frozen baseline.

Workbench grammar baseline: **APZQEP-ARCH-006** (Accepted) — Workbench **SHALL** reuse shell grammar.

---

## 6. Package boundaries

### 6.1 Recommended package identity

| Package                      | Intended contents                                                                    | Consumed by                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `@apzhub/qep-test-execution` | Domain first; then Application/Infrastructure exports as staged Engineering advances | Platform API / App Router handlers; Workbench clients via HTTP only |

Exact SemVer and publish cadence **SHALL** be decided in separately authorised Engineering / Certification programmes. This OES locks **identity and layering**, not version numbers.

### 6.2 Layer ownership (normative)

```text
@apzhub/qep-test-execution
├── domain/          Pure aggregate, commands, invariants, domain events (no I/O)
├── application/     Use-cases, authz orchestration, availableActions, DTOs
├── infrastructure/  Persistence, outbox, search publication, frozen clients
└── (API surface lives in apps/web Route Handlers / Platform Gateway — not Domain)
```

| Layer          | MAY depend on                                      | SHALL NOT depend on                                                  |
| -------------- | -------------------------------------------------- | -------------------------------------------------------------------- |
| Domain         | Nothing external (pure TS)                         | Persistence, HTTP, React, PermissionService adapters, Event Bus SDKs |
| Application    | Domain; platform authz/audit/event **interfaces**  | React; direct SQL; Workbench                                         |
| Infrastructure | Application ports; Domain rehydrate; platform SDKs | Workbench; Domain business invention                                 |
| API (apps)     | Application use-cases                              | Domain internals; Infrastructure internals from UI                   |
| Workbench      | Public HTTP API only                               | Domain package; Infrastructure; connectors; engines                  |

### 6.3 Boundary rules

1. Modules/Workbench **SHALL** call Platform HTTP APIs only — never Domain packages or connectors.
2. Domain **SHALL** remain pure and deterministic.
3. Application **SHALL** be the sole computer of `availableActions`.
4. Infrastructure **SHALL** translate persistence and integrations without absorbing Domain rules.
5. No module-to-module coupling with other QEP capabilities except via published Platform Service / frozen package contracts.

---

## 7. Module structure (repository)

Planned layout (created only under future Engineering authorisation):

```text
packages/qep-test-execution/          # @apzhub/qep-test-execution
  package.json
  src/
    domain/
    application/
    infrastructure/
  tests/
apps/web/src/app/api/v1/qep/executions/   # Route handlers → Application
modules/qep-test-execution/               # Workbench module (manifest-first)
  module.yaml
  src/                                    # Presentation only
```

Manifest-first **SHALL** apply (`module.yaml`, `service.yaml`, `event.yaml`, `component.yaml` as applicable) before corresponding implementation code in future Engineering programmes (Documents 024–029).

---

## 8. Capability definition (engineering restatement)

A **TestExecution** is the controlled performance of testing work derived from approved Test Plans and/or Test Specifications, recording sealed source manifests, steps, outcomes, evidence references, observations, and review decisions while preserving historical truth.

Test Execution is the **System of Record** for execution instances. It references — and does not redefine — frozen Requirements, Traceability, Verification, Test Specifications, and Test Plans. It does not absorb Test Runs, Evidence Management, Defect Management, Reporting, or AI authority (ARCH-015; ADR-0077, ADR-0080, ADR-0081, ADR-0086).

---

## 9. Explicit exclusions (this programme)

This OES programme **SHALL NOT** deliver:

| Excluded                               | Status                              |
| -------------------------------------- | ----------------------------------- |
| Production TypeScript / React code     | Forbidden                           |
| Package scaffolding under `packages/`  | Forbidden                           |
| Database migrations                    | Forbidden                           |
| Live REST handlers                     | Forbidden                           |
| Workbench UI implementation            | Forbidden                           |
| Engineering Completion Review          | Forbidden                           |
| Certification / Freeze / version bumps | Forbidden                           |
| Modification of frozen baselines       | Forbidden                           |
| AI / MCP runtime features              | Forbidden (boundary specified only) |

---

## 10. Downstream engineering staging (recommendation only)

After Owner Acceptance of this OES, Engineering **MAY** be staged under **separate** Owner Programme Instructions, for example:

| Stage                            | Anticipated programme             | Scope                            |
| -------------------------------- | --------------------------------- | -------------------------------- |
| Domain Engineering               | APZQEP-ENG-090A (or successor id) | Pure Domain package              |
| Infrastructure / API Engineering | Separate Instruction              | Persistence, API, events, search |
| Workbench Engineering            | Separate Instruction              | Presentation module              |

Staging **SHALL NOT** begin without Owner authorisation. This OES does not authorise any Engineering stage.

---

## STOP

```text
PART-01 COMPLETE
PACKAGE BOUNDARIES FIXED
NO PRODUCTION CODE
```
