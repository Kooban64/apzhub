# APZQEP-OES-ENG-060B

# PART 1 — Executive Summary, Objectives, Constraints & Fidelity

| Item                  | Value                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------- |
| Document              | **APZQEP-OES-ENG-060B**                                                                                       |
| Title                 | Test Plans Infrastructure Engineering Specification                                                           |
| Programme             | **APZQEP-OES-ENG-060B**                                                                                       |
| Capability            | Test Plans                                                                                                    |
| Layer                 | Infrastructure Engineering Specification                                                                      |
| Status                | **IMPLEMENTED / AWAITING OWNER ACCEPTANCE**                                                                   |
| Version               | **1.0.0-oes**                                                                                                 |
| Part                  | **1 of 5**                                                                                                    |
| Architecture baseline | [APZQEP-ARCH-013](../OES-ARCH-013/COMPLETE.md) **ACCEPTED / BASELINED**                                       |
| Domain OES            | [APZQEP-OES-ENG-060A](../OES-ENG-060A/COMPLETE.md) **ACCEPTED / BASELINED**                                   |
| Certified Domain      | `@apzhub/qep-test-plans` **0.1.0 CERTIFIED** · [CERT-060A](../domain-certification/OWNER-ACCEPTANCE.md)       |
| Governing methodology | [OES-000](../../../../engineering/oes/OES-000-Owner-Engineering-Specification-Standard.md) **FROZEN 1.0.0**   |
| Writing standard      | [OES-001](../../../../engineering/oes/OES-001-Engineering-Writing-Standard.md) **FROZEN 1.0.0**               |
| Review standard       | [OES-002](../../../../engineering/oes/OES-002-Engineering-Review-and-Acceptance-Standard.md) **FROZEN 1.1.0** |
| Constitution          | Document 000 v1.0.0                                                                                           |

**Normative language:** **SHALL** / **MUST** = mandatory; **SHOULD** = strong recommendation; **MAY** = optional.

---

## 1. Executive summary

This document is the authoritative **Infrastructure Engineering Specification** for the Test Plans capability.

It defines **how Infrastructure SHALL be engineered** so that a future Infrastructure implementation programme (e.g. `ENG-060B`) can proceed without inventing persistence, application orchestration, REST, search, permission, audit, or observability architecture.

This programme **SHALL NOT** implement Infrastructure, produce production code, author migrations, or authorise Workbench.

Test Plans is the first **orchestration** capability in APZQEP. Patterns established here **SHALL** serve as the **reference Infrastructure model** for future orchestration capabilities (Test Execution, Test Runs, Test Suites, Evidence, Certification), via reusable patterns — **not** shared business logic and **not** tight coupling.

---

## 2. Programme objective

Produce a complete, testable Infrastructure specification covering:

1. Repository ports and persistence mapping
2. PostgreSQL persistence model (logical — no SQL / migrations)
3. Application commands and queries
4. REST resource catalogue
5. Search projection architecture
6. Permission catalogue
7. Audit architecture
8. Domain-event publication at Infrastructure boundary
9. Error mapping (Domain → application concerns)
10. Observability
11. AI consumption boundary

---

## 3. Architectural fidelity

| Source              | Authority                                                          |
| ------------------- | ------------------------------------------------------------------ |
| APZQEP-ARCH-013     | Capability Architecture — **BASELINED**                            |
| APZQEP-OES-ENG-060A | Domain engineering contract — **BASELINED**                        |
| APZQEP-CERT-060A    | Domain package **0.1.0 CERTIFIED** — **immutable**                 |
| This OES            | Infrastructure engineering contract — **no deviation without ADR** |

Any conflict with ARCH-013 or OES-ENG-060A **SHALL** be resolved in favour of those baselines unless an Owner-approved ADR records an intentional change.

---

## 4. Immutable Domain package

| Item        | Rule                                                                                                      |
| ----------- | --------------------------------------------------------------------------------------------------------- |
| Package     | `@apzhub/qep-test-plans` **0.1.0 CERTIFIED**                                                              |
| Class       | **DOMAIN_PRODUCTION_READY_WITH_LIMITATIONS**                                                              |
| Mutation    | Infrastructure **SHALL NOT** modify Domain behaviour, invariants, lifecycle rules, or event semantics     |
| Consumption | Application/Infrastructure **SHALL** call Domain commands and reconstruct aggregates via repository ports |
| Remediation | Domain changes require a **separate authorised ENG** programme — never silent Infra edits                 |

---

## 5. Architectural principles (Infrastructure)

| #   | Principle                  | Engineering implication                                                                |
| --- | -------------------------- | -------------------------------------------------------------------------------------- |
| I1  | Domain owns business rules | Infra contains **no** business rules                                                   |
| I2  | Consume Domain             | Commands load aggregate → invoke Domain → persist                                      |
| I3  | Ports & adapters           | Repository interfaces in application/domain boundary; Postgres adapter implements them |
| I4  | Optimistic concurrency     | Persist with `expectedRevision`; map `PlanConcurrencyError`                            |
| I5  | Tenant isolation           | Every row and query scoped by `tenant_id` (+ RLS)                                      |
| I6  | Platform integration       | Authz, Audit, Search, Events via Platform Services — no module-local engines           |
| I7  | Reference patterns         | Orchestration infra patterns reusable; capability packages remain independent          |
| I8  | CQRS-lite                  | Write path = commands; read path = queries (may use projections)                       |
| I9  | No Workbench here          | UI is a future programme                                                               |
| I10 | Spec-first                 | This OES defines contracts; ENG-060B implements them                                   |

---

## 6. Layering (mandatory)

```text
Client / Workbench (future)
        ↓
REST Route Handlers (thin)
        ↓
Platform Authn / Authz / Request context
        ↓
Application Command / Query handlers
        ↓
Certified Domain (@apzhub/qep-test-plans)
        ↓
Repository ports
        ↓
PostgreSQL adapter (Drizzle) + optional InMemory adapter (tests)
```

Infrastructure **SHALL NOT** reverse this dependency. Domain **SHALL NEVER** import adapters, Drizzle, Next.js, or HTTP.

---

## 7. Reference-implementation intent

Future orchestration capabilities **SHOULD** reuse these patterns by convention:

| Pattern                                                                                    | Reuse mode                                          |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| Aggregate head + child tables + append-only history                                        | Structural convention                               |
| `save(aggregate, expectedRevision)` repository port                                        | Port shape convention                               |
| Command orchestration sequence (permission → load → domain → tx → audit → events → search) | Procedural convention                               |
| `qep.{capability}.*` permissions / events / REST under `/api/v1/qep/...`                   | Naming convention                                   |
| Shared pagination / envelope helpers from platform packages                                | Shared **technical** libraries only                 |
| Business invariants                                                                        | **Never** shared — remain in each capability Domain |

Reuse **MUST NOT** create a shared “orchestration business kernel” that couples capabilities.

---

## 8. Explicit exclusions (this programme)

This OES **SHALL NOT** contain or authorise:

- PostgreSQL migrations or SQL scripts
- Repository / adapter / service / controller implementation
- REST handlers, Next.js routes, React, Workbench, UI
- Search engine implementation
- Permission / authentication / authorisation enforcement code
- AI or MCP implementation
- Domain package changes
- Production code of any kind

---

## 9. Downstream programme (not authorised here)

| Programme           | Role                                      | Status                                                         |
| ------------------- | ----------------------------------------- | -------------------------------------------------------------- |
| **APZQEP-ENG-060B** | Infrastructure Engineering implementation | Requires separate Owner Instruction after this OES is Accepted |

---

## STOP (Part 1)

Part 1 defines objectives and constraints only. Normative Infrastructure design continues in Parts 2–5.
