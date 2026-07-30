# APZQEP-OES-ARCH-016 — COMPLETE

| Item                | Value                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------- |
| Document            | **APZQEP-OES-ARCH-016**                                                                           |
| Programme           | **APZQEP-ARCH-016**                                                                               |
| Title               | Evidence Management Capability Architecture                                                       |
| Role                | Authoritative architecture baseline                                                               |
| Status              | **ACCEPTED / APPROVED / ARCHITECTURE BASELINED / CLOSED**                                         |
| Version             | **1.0.0-arch**                                                                                    |
| Date                | 2026-07-30                                                                                        |
| Acceptance          | [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md) · `20260730T023000Z-APZQEP-ARCH-016-ACCEPTANCE.json` |
| Evidence            | `20260730T021800Z-APZQEP-ARCH-016.json`                                                           |
| Governing standards | Document 000 · APZQEP Constitution v1.0.0 · OES-000 · OES-001 · OES-002 · Lifecycle Standard v1.0 |
| Standing record     | [STANDING-PROGRAMME-RECORD.md](../../STANDING-PROGRAMME-RECORD.md) **IN FORCE**                   |
| Prior selection     | [CAPABILITY-002](../../CAPABILITY-002/README.md) **ACCEPTED / CLOSED**                            |
| Nature              | **Architecture only — no engineering**                                                            |

---

## Authoritative content (by reference)

1. [PART-01.md](./PART-01.md) — Executive summary, authority, scope, definition
2. [PART-02.md](./PART-02.md) — Context, domain model, aggregates
3. [PART-03.md](./PART-03.md) — Lifecycle & System of Record
4. [PART-04.md](./PART-04.md) — Security, storage, integration, interfaces
5. [PART-05.md](./PART-05.md) — Workbench vision, NFRs, boundaries, AC
6. [APPENDIX-A.md](./APPENDIX-A.md) — Glossary
7. [APPENDIX-B.md](./APPENDIX-B.md) — Lifecycle state machine
8. [APPENDIX-C.md](./APPENDIX-C.md) — Capability boundaries & contracts
9. [APPENDIX-D.md](./APPENDIX-D.md) — Risks, assumptions, ADRs, traceability

Companion:

- [OWNER-SUMMARY.md](./OWNER-SUMMARY.md)
- [ARCHITECTURE-VALIDATION-REPORT.md](./ARCHITECTURE-VALIDATION-REPORT.md)
- [ARCHITECTURE-COMPLETION-REPORT.md](./ARCHITECTURE-COMPLETION-REPORT.md)
- [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md) — **ACCEPTED**

ADRs ADR-0087 … ADR-0091 — **Accepted**.

---

## Definition (normative summary)

**Evidence Management** is the authoritative System of Record for quality evidence in APZQEP: identity, content locator, integrity, classification, ownership, access, lifecycle, retention, disposition, provenance, collections, and sealed sets.

Consuming capabilities hold **EvidenceReference** pointers and **SHALL NOT** duplicate evidence content as SoR. Test Execution continues under ADR-0080; this architecture completes the target SoR that ADR-0080 anticipated.

---

## Effect

This COMPLETE pack is the **authoritative architectural baseline** for all Evidence Management engineering. Architectural changes require ADR or approved revision. No engineering under ARCH-016.

**Downstream:** **APZQEP-OES-ENG-091A** — Evidence Management Engineering Specification — authorised separately.

---

## STOP

```text
APZQEP-ARCH-016
ACCEPTED
APPROVED
ARCHITECTURE BASELINED
CLOSED
```
