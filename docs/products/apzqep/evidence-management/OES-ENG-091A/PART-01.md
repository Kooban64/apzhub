# APZQEP-OES-ENG-091A

# PART 1 — Objectives, Package Boundaries, Module Structure & Fidelity

| Item                  | Value                                                                                         |
| --------------------- | --------------------------------------------------------------------------------------------- |
| Document              | **APZQEP-OES-ENG-091A**                                                                       |
| Title                 | Evidence Management Engineering Specification                                                 |
| Programme             | **APZQEP-OES-ENG-091A**                                                                       |
| Capability            | Evidence Management                                                                           |
| Layer                 | Complete Capability Engineering Specification                                                 |
| Status                | **IMPLEMENTED / AWAITING OWNER EVIDENCE MANAGEMENT ENGINEERING SPECIFICATION DECISION**       |
| Version               | **1.0.0-oes**                                                                                 |
| Part                  | **1 of 5**                                                                                    |
| Date                  | 2026-07-30                                                                                    |
| Architecture baseline | [APZQEP-ARCH-016](../OES-ARCH-016/COMPLETE.md) **ACCEPTED / ARCHITECTURE BASELINED / CLOSED** |
| Governing methodology | OES-000 / OES-001 / OES-002 · Lifecycle Standard v1.0 · Build Contract                        |
| Constitution          | APZQEP Constitution v1.0.0 · Document 000                                                     |
| Standing record       | [STANDING-PROGRAMME-RECORD.md](../../STANDING-PROGRAMME-RECORD.md) **IN FORCE**               |

**Normative language:** **SHALL** / **MUST** / **SHOULD** / **MAY** (RFC 2119 as applied by OES-001).

---

## 1. Executive summary

This document is the authoritative **Engineering Specification** for Evidence Management within APZ QEP.

It translates Owner-Accepted Architecture **APZQEP-ARCH-016** into an implementation-ready engineering contract covering package boundaries, Domain interfaces, Application services, repository and storage contracts, API contracts, security (L-02 fail-closed), lifecycle rules, integrity, events, integrations via `EvidenceReference`, Workbench contracts, testing, observability, performance, migration, and readiness.

This programme **SHALL** produce specification, validation, evidence, and Owner decision material only.

This programme **SHALL NOT** produce production code, database migrations, packages, APIs, UI, TE modifications, Lifecycle Standard changes, or architectural revisions.

---

## 2. Programme authority

| Field                        | Value                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------- |
| Owner Instruction            | APZQEP-OES-ENG-091A — AUTHORISED TO COMMENCE (Engineering Specification)                    |
| Programme type               | Engineering Specification                                                                   |
| Sole architectural authority | **APZQEP-ARCH-016** (baselined)                                                             |
| Authorises                   | Complete Engineering Specification documentation, validation, evidence, Owner decision pack |
| Does not authorise           | Production code · migrations · package creation · API/UI · TE changes · engineering waves   |

---

## 3. Programme objective

Define how Evidence Management **SHALL** be engineered such that subsequent, separately authorised Engineering programmes can proceed without inventing architectural decisions.

The specification **SHALL**:

1. Fix package and module boundaries for Domain, Application, Infrastructure, API, and Workbench.
2. Specify Domain aggregates, commands, invariants, lifecycle, integrity.
3. Specify Application / policy / integrity / retention / audit service responsibilities.
4. Specify repository and StoragePort contracts (technology undecided).
5. Specify API contracts, validation, errors, security.
6. Specify integration contracts for TE and future consumers via `EvidenceReference`.
7. Specify events, observability, performance targets, testing strategy, migration.
8. Provide acceptance criteria and traceability to ARCH-016 / ADRs.
9. Preserve TE **1.0.1** and frozen baselines by non-interference.

---

## 4. Architectural fidelity

| Source              | Authority                                                                      |
| ------------------- | ------------------------------------------------------------------------------ |
| APZQEP-ARCH-016     | Capability Architecture — **BASELINED** — sole architectural authority         |
| ADR-0087 … ADR-0091 | Accepted architectural decisions                                               |
| ADR-0080 · ADR-0083 | Related Accepted (TE evidence boundary · availableActions)                     |
| This OES            | Engineering contract — **no deviation without ADR or Owner-approved revision** |

Any conflict with ARCH-016 **SHALL** be resolved in favour of ARCH-016 unless an Owner-approved ADR records an intentional change.

This OES **SHALL NOT** redefine Architecture. It **SHALL** refine implementable contracts within Architecture bounds.

---

## 5. Delivered / frozen dependencies (immutable under this OES)

| Capability                                                 | Status                         | Engineering rule                                               |
| ---------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------- |
| Requirements / Traceability / Verification / Specs / Plans | **1.0.0 FROZEN**               | Reference by id only; no fork                                  |
| Test Execution                                             | **1.0.1** Limited Availability | Do not modify packages under this OES; integrate via contracts |
| L-02 / CERT-002                                            | **CLOSED**                     | Fail-closed evidence access principles mandatory               |
| Platform authz / audit / events / search / gateway         | Platform                       | Reuse; do not fork                                             |

---

## 6. Package boundaries

### 6.1 Recommended package identity

| Package                | Intended contents                                                                    | Consumed by                                                 |
| ---------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| `@apzhub/qep-evidence` | Domain first; then Application/Infrastructure exports as staged Engineering advances | Platform API / App Router handlers; Workbench via HTTP only |
| Module id              | `qep-evidence`                                                                       | Shell registration via Module Registry (manifest-first)     |
| Platform service name  | `EvidenceService`                                                                    | Never storage-vendor-named                                  |

Exact SemVer and publish cadence **SHALL** be decided in separately authorised Engineering / Certification programmes.

### 6.2 Layer ownership (normative)

```text
@apzhub/qep-evidence
├── domain/          Pure aggregates, commands, invariants, domain events (no I/O)
├── application/     Use-cases, authz/ACL, availableActions, DTOs, orchestration
├── infrastructure/  Metadata persistence, StoragePort adapter, outbox, search publication
└── (API surface lives in apps/web Route Handlers / Platform Gateway — not Domain)
```

### 6.3 Boundary rules

1. Presentation **SHALL NOT** contain business rules or access decisions.
2. Application **SHALL** authenticate, authorise (fail-closed), validate, invoke Domain, persist, audit, publish events, return `availableActions`.
3. Domain **SHALL** be pure (no I/O, no HTTP, no storage SDKs).
4. Storage engines **SHALL** be reached only via Infrastructure `StoragePort`.
5. Consumers **SHALL NOT** import Infrastructure; they call platform APIs / published application ports.
6. Modules **SHALL NOT** call connectors or other modules directly ([008](../../../../008-modules-connectors.md) / [025](../../../../025-module-sdk-module-manifest-module-development-standard.md)).

---

## 7. Module structure (repository — future Engineering)

```text
packages/qep-evidence/          # library package
modules/qep-evidence/           # module.yaml + Workbench registration
apps/web/.../api/v1/qep/evidence/   # Route Handlers (gateway path)
```

Manifests (`module.yaml`, `service.yaml`, `event.yaml`, `component.yaml`) **SHALL** precede implementation per Platform SDK (024–029).

---

## 8. Capability definition (engineering restatement)

An **Evidence** item is a governed, identifiable record of quality-relevant content together with metadata establishing integrity, ownership, classification, lifecycle, access, retention, and provenance.

**Evidence Management** is the SoR for that record. Other capabilities hold **EvidenceReference** only (ADR-0087 / ADR-0091 / ADR-0080).

---

## 9. Explicit exclusions (this programme)

- Production code, migrations, OpenAPI generation as code, UI components, Storybook stories
- Storage technology product selection
- Modification of `@apzhub/qep-test-execution`
- Architectural redesign, Lifecycle Standard revision
- Engineering waves (ENG-110A+)

---

## 10. Downstream engineering staging (recommendation only)

| Stage              | Recommended id      | Scope                                     | Authorised? |
| ------------------ | ------------------- | ----------------------------------------- | ----------- |
| Wave 1 Scaffolding | **APZQEP-ENG-110A** | Package/module shell, manifests, CI hooks | **NO**      |
| Wave 2 Domain      | APZQEP-ENG-110B     | Domain model + tests                      | **NO**      |
| Wave 3 Application | APZQEP-ENG-110C     | Use-cases, ACL, availableActions          | **NO**      |
| Wave 4 Infra & API | APZQEP-ENG-110D     | Persistence, StoragePort, REST            | **NO**      |
| Wave 5 Workbench   | APZQEP-ENG-110E     | Explorer / preview surfaces               | **NO**      |

Separate Owner Wave Instructions required. OES Acceptance alone does **not** commence Engineering.

---

## STOP

```text
PART-01 COMPLETE — package and fidelity locked
NO PRODUCTION CODE
```
