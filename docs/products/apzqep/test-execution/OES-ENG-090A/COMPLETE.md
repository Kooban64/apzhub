# APZQEP-OES-ENG-090A — COMPLETE

| Item                | Value                                                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Document            | **APZQEP-OES-ENG-090A**                                                                                          |
| Programme           | **APZQEP-OES-ENG-090A**                                                                                          |
| Title               | Test Execution Engineering Specification                                                                         |
| Role                | Authoritative capability engineering contract (upon Owner Acceptance)                                            |
| Status              | **ACCEPTED / APPROVED / ENGINEERING SPECIFICATION BASELINED / CLOSED**                                           |
| Version             | **1.0.0-oes**                                                                                                    |
| Date                | 2026-07-28                                                                                                       |
| Acceptance          | [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md) · `20260728T200514Z-APZQEP-OES-ENG-090A-ACCEPTANCE.json`            |
| Architecture        | [APZQEP-ARCH-015](../OES-ARCH-015/COMPLETE.md) **ACCEPTED / ARCHITECTURE BASELINED / CLOSED**                    |
| Governing standards | Document 000 · APZQEP Constitution v1.0.0 · OES-000 · OES-001 · OES-002 v1.1.0                                   |
| Standing record     | [STANDING-PROGRAMME-RECORD.md](../../STANDING-PROGRAMME-RECORD.md) **IN FORCE**                                  |
| Frozen dependencies | Requirements · Traceability · Verification · Test Specifications · Test Plans — all **1.0.0 CERTIFIED / FROZEN** |
| Nature              | **Engineering Specification only — no implementation**                                                           |

---

## Authoritative content (by reference)

1. [PART-01.md](./PART-01.md) — Objectives, package boundaries, module structure, fidelity, exclusions
2. [PART-02.md](./PART-02.md) — Domain interfaces, lifecycle, policies, errors, Domain events
3. [PART-03.md](./PART-03.md) — Application services, infrastructure ports, persistence, events, audit, search
4. [PART-04.md](./PART-04.md) — API contracts, security, Workbench contracts
5. [PART-05.md](./PART-05.md) — Testing strategy, observability, acceptance criteria, traceability
6. [APPENDIX-A.md](./APPENDIX-A.md) — Glossary
7. [APPENDIX-B.md](./APPENDIX-B.md) — Lifecycle matrix
8. [APPENDIX-C.md](./APPENDIX-C.md) — Invariants & business rules
9. [APPENDIX-D.md](./APPENDIX-D.md) — Contract catalogue
10. [APPENDIX-E.md](./APPENDIX-E.md) — Acceptance checklist & traceability

Companion:

- [OWNER-SUMMARY.md](./OWNER-SUMMARY.md)
- [ENGINEERING-SPECIFICATION-COMPLETION-REPORT.md](./ENGINEERING-SPECIFICATION-COMPLETION-REPORT.md)
- [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md) — **ACCEPTED**

ADRs (Architecture — Accepted): ADR-0075 … ADR-0086.

---

## Normative summary

Engineering **SHALL** implement Test Execution such that:

- `@apzhub/qep-test-execution` owns Domain / Application / Infrastructure layering with pure Domain.
- `TestExecution` is the sole aggregate SoR with sealed `ExecutionManifest`, steps, outcomes, evidence references, observations, and review.
- Application computes `availableActions` as the sole UI authority.
- API under `/api/v1/qep/executions` enforces auth, authz, validation, audit, concurrency, and typed errors.
- Workbench is presentation-only and never invents transitions.
- Frozen capabilities are referenced only; Test Runs / Evidence / Defects / AI remain outside SoR.

---

## Effect

This COMPLETE pack is the **authoritative Engineering Specification baseline**. Implementation **MUST** conform. No production code under this OES identifier.

**Downstream (recommendation only — NOT AUTHORISED):** **APZQEP-ENG-100A** — Test Execution Engineering.

---

## STOP

```text
APZQEP-OES-ENG-090A
ACCEPTED
APPROVED
ENGINEERING SPECIFICATION BASELINED
CLOSED
```
