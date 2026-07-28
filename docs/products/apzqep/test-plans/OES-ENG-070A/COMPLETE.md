# APZQEP-OES-ENG-070A — COMPLETE

| Item | Value |
| ---- | ----- |
| Document | **APZQEP-OES-ENG-070A** |
| Programme | **APZQEP-OES-ENG-070A** |
| Title | Test Plans Workbench Engineering Specification |
| Capability | Test Plans |
| Layer | Presentation / Workbench Engineering Specification |
| Role | Authoritative Workbench Engineering delivery contract (upon Owner Acceptance) |
| Status | **ACCEPTED / APPROVED / ENGINEERING SPECIFICATION BASELINED / PROGRAMME CLOSED** |
| Version | **1.0.0-oes** |
| Date | 2026-07-28 |
| Acceptance | **ACCEPTED** (2026-07-28) — see [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md) · `20260728T065105Z-APZQEP-OES-ENG-070A-ACCEPTANCE.json` |
| Governing standards | Document 000 · OES-000 · OES-001 · OES-002 v1.1.0 |
| Architecture baseline | [APZQEP-ARCH-014](../OES-ARCH-014/COMPLETE.md) **ACCEPTED / ARCHITECTURE BASELINED / CLOSED** |
| Domain baseline | `@apzhub/qep-test-plans` **0.1.0 CERTIFIED** (CERT-060A) |
| Infrastructure baseline | `@apzhub/qep-test-plans` **0.2.0 INFRASTRUCTURE COMPONENT CERTIFIED** (CERT-060B) |
| Binding invariant | *"The Workbench SHALL never determine what a user may do"* — Owner directive, ARCH-014 Acceptance |
| Nature | **Engineering specification only — does NOT authorise coding** |

---

## Authoritative content (by reference)

1. [PART-01.md](./PART-01.md) — Programme scope, objectives, constraints, baselines, layer ownership, non-goals
2. [PART-02.md](./PART-02.md) — Delivery work packages WP-01…WP-18, order, Definition of Done, exclusions
3. [PART-03.md](./PART-03.md) — Technical approach: stack, repository placement, API rules, action rendering algorithm, state model, Compare contract
4. [PART-04.md](./PART-04.md) — Testing pyramid, Playwright journeys, accessibility gates, performance checks, quality gates
5. [PART-05.md](./PART-05.md) — AI/MCP boundaries, implementation quality gates, Owner Acceptance criteria for this OES
6. [APPENDIX-A.md](./APPENDIX-A.md) — Glossary
7. [APPENDIX-B.md](./APPENDIX-B.md) — Work package → ARCH-014 / ENG-060B traceability
8. [APPENDIX-C.md](./APPENDIX-C.md) — Route & proposed file inventory (proposed paths only — not created)
9. [APPENDIX-D.md](./APPENDIX-D.md) — Test plan checklist
10. [APPENDIX-E.md](./APPENDIX-E.md) — Owner Acceptance checklist

Companion:

- [OWNER-SUMMARY.md](./OWNER-SUMMARY.md)
- [ENGINEERING-SPECIFICATION-COMPLETION-REPORT.md](./ENGINEERING-SPECIFICATION-COMPLETION-REPORT.md)
- [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md) — **PENDING**

---

## Definition (normative summary)

**APZQEP-OES-ENG-070A** is the Owner Engineering Specification that translates the Owner-Accepted Test Plans Workbench Architecture (**APZQEP-ARCH-014**) into an implementable delivery contract: 18 ordered work packages, a technical approach consuming the certified Infrastructure REST surface (`/api/v1/qep/plans/*`) exclusively, a normative `availableActions`-driven action rendering algorithm, a testing and accessibility pyramid, and explicit AI/MCP boundaries with a non-bypassable no-approve-bypass rule.

It honestly represents the certified Infrastructure's recorded limitations — **L-01** (deferred version compare, presented as a governed unavailable slot with a forward-compatible route contract) and **L-02** (no dedicated `GET .../items`; items bind to the Plan DTO) — without requiring or performing their remediation under this programme.

---

## Effect

This `COMPLETE.md` is the **authoritative delivery contract** for Test Plans Workbench Engineering, Owner-Accepted 2026-07-28. A separate Owner Programme Instruction subsequently authorised `APZQEP-ENG-070A`, consistent with the precedent established by APZQEP-OES-ENG-050C → APZQEP-ENG-050C.

**Downstream:** `APZQEP-ENG-070A` — Test Plans Workbench Engineering implementation (React / Next.js) — **authorised and delivered**; reached **Engineering Completion Review (ECR) — PASS**. See [../workbench/README.md](../workbench/README.md). Owner Acceptance of ENG-070A, Certification, and Freeze remain separate, not-yet-performed gates.

---

## STOP

```text
APZQEP-OES-ENG-070A
ACCEPTED / APPROVED / ENGINEERING SPECIFICATION BASELINED / CLOSED

AUTHORISED NEXT: APZQEP-ENG-070A (implementation) — see docs/products/apzqep/test-plans/workbench/
```
