# APZQEP-OES-ARCH-014 — COMPLETE

| Item | Value |
| ---- | ----- |
| Document | **APZQEP-OES-ARCH-014** |
| Programme | **APZQEP-ARCH-014** |
| Title | Test Plans Workbench Architecture |
| Role | Authoritative Workbench architecture baseline |
| Status | **ACCEPTED / APPROVED / ARCHITECTURE BASELINED / PROGRAMME CLOSED** |
| Version | **1.0.0-oes** |
| Date | 2026-07-28 |
| Acceptance | **ACCEPTED** — see [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md) |
| Governing standards | Document 000 · OES-000 · OES-001 · OES-002 v1.1.0 |
| Baselines consumed | APZQEP-ARCH-013 **ACCEPTED / BASELINED** · Domain `@apzhub/qep-test-plans` **0.1.0 CERTIFIED** (ENG-060A/CERT-060A) · Infrastructure `@apzhub/qep-test-plans` **0.2.0 INFRASTRUCTURE COMPONENT CERTIFIED** (ENG-060B/CERT-060B) |
| Shell precedent | APZQEP-OES-ARCH-012 (Test Specifications Workbench Architecture) |
| Nature | **Architecture only — no engineering, no React/Next.js, no production code** |

---

## Authoritative content (by reference)

1. [PART-01.md](./PART-01.md) — Executive summary, objectives, principles, constraints, non-goals, fidelity, exclusions
2. [PART-02.md](./PART-02.md) — Information architecture, shell placement, routes, navigation, session restore
3. [PART-03.md](./PART-03.md) — Workbench components: Dashboard, Explorer, Inspector panels, Edit Draft, actions, dialogs, unavailable slots
4. [PART-04.md](./PART-04.md) — Workflow/lifecycle UX, persona journeys, review queue, empty/error states, notifications, Compare contract
5. [PART-05.md](./PART-05.md) — Performance, accessibility, security, observability, AI/MCP boundaries, acceptance criteria
6. [APPENDIX-A.md](./APPENDIX-A.md) — Glossary
7. [APPENDIX-B.md](./APPENDIX-B.md) — Lifecycle presentation state machine
8. [APPENDIX-C.md](./APPENDIX-C.md) — Screen inventory
9. [APPENDIX-D.md](./APPENDIX-D.md) — Navigation maps
10. [APPENDIX-E.md](./APPENDIX-E.md) — Owner Acceptance checklist

Companion:

- [OWNER-SUMMARY.md](./OWNER-SUMMARY.md)
- [ARCHITECTURE-COMPLETION-REPORT.md](./ARCHITECTURE-COMPLETION-REPORT.md)
- [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md) — **ACCEPTED**

---

## Definition (normative summary)

The **Test Plans Workbench** is the presentation surface through which Viewers, Testers, Leads, and QA Managers create, review, approve, schedule, and track Test Plans inside the APZHUB Desktop shell. It presents Dashboard, Explorer, Review queue, Search, and a Plan Inspector (Summary, Metadata, Items/Linked Specifications, Relationships, History, Versions, Audit), with an action surface driven exclusively by server-computed `availableActions`.

The Workbench owns presentation only. It consumes — and does not redefine — the certified Test Plans Domain (`@apzhub/qep-test-plans` 0.1.0) and the certified Test Plans Infrastructure Component (`@apzhub/qep-test-plans` 0.2.0), including its recorded limitations (L-01 deferred version compare; L-02 no dedicated items GET), which this architecture represents honestly rather than fabricating.

---

## Effect

This COMPLETE pack is the **authoritative architectural baseline** for all Test Plans Workbench engineering. Architectural changes thereafter require an ADR or an approved revision. **No engineering was authorised under ARCH-014 itself.**

**Downstream:** **APZQEP-OES-ENG-070A** — Test Plans Workbench Engineering Specification — **IMPLEMENTED / AWAITING OWNER ACCEPTANCE** — [canonical pack](../OES-ENG-070A/README.md). Implementation (`APZQEP-ENG-070A`) still requires a further, separate Owner Programme Instruction after OES-ENG-070A is Accepted.

---

## STOP

```text
APZQEP-ARCH-014
ACCEPTED
APPROVED
ARCHITECTURE BASELINED
PROGRAMME CLOSED
```
