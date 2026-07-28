# APZQEP-OES-ENG-070A

# PART 5 — AI/MCP Boundaries, Quality Gates & Owner Acceptance Criteria

| Item      | Value                                       |
| --------- | ------------------------------------------- |
| Document  | APZQEP-OES-ENG-070A                         |
| Part      | **5 of 5**                                  |
| Programme | APZQEP-OES-ENG-070A                         |
| Status    | **IMPLEMENTED / AWAITING OWNER ACCEPTANCE** |

---

## 1. Purpose

This Part defines the **AI authority matrix**, **MCP boundaries**, the **quality gates that gate implementation start and Workbench Owner Acceptance**, and the **Owner Acceptance criteria for this OES itself**. It is the final normative Part before Appendices and `COMPLETE.md` assembly.

**Workbench Engineering implementation remains NOT AUTHORISED until this OES is Owner-Accepted under OES-002, and a separate Owner Instruction names `APZQEP-ENG-070A`.**

---

## 2. AI authority matrix (implementation-time)

| Activity                                                                  | AI MAY                                | AI MUST NOT                                                      |
| ------------------------------------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------- |
| Generate UI from this OES + APZQEP-ARCH-014 (once ENG-070A is authorised) | ✅                                    | Invent architecture, routes, or actions not specified            |
| Suggest copy, a11y fixes, or refactors                                    | ✅                                    | Approve a lifecycle transition                                   |
| Wire `availableActions` exactly as coded by the server                    | ✅                                    | Fabricate, cache, or infer an action not present in the response |
| Suggest draft Plan content (title, objective, item selection)             | ✅ (future, separately authorised)    | Auto-submit, auto-approve, or bypass human confirmation          |
| Decide Owner Acceptance, Review outcomes, or Certification                | ❌                                    | ❌                                                               |
| Change Domain or Infrastructure contracts                                 | ❌ without a separate Owner ENG delta | ❌ silently                                                      |
| Begin coding before this OES is Accepted and ENG-070A is authorised       | ❌                                    | ❌                                                               |
| Implement a client-side Version Compare to work around L-01               | ❌                                    | ❌ — always                                                      |

### 2.1 Mandatory AI-assisted mutation path

```text
Human confirms in Workbench
  → Platform API command
  → Authn / Authz / Validation (server)
  → Domain transition
  → Persistence / events / audit (server)
```

No alternate path exists. **No AI approve bypass under any circumstance** — this restates the binding invariant from Owner ARCH-014 Acceptance (Part 1 §4 of this OES).

---

## 3. MCP boundaries (future)

1. MCP tools, if ever built, **MUST** use the same permissions and `availableActions` semantics as the REST surface — no privilege elevation beyond the invoking user.
2. MCP **MUST NOT** own Workbench state, cache Plan data as authoritative, or become a parallel system of record.
3. MCP **MUST NOT** perform a privileged lifecycle transition through any path other than the same authz pipeline used by REST.
4. This OES **SHALL NOT** implement MCP servers or tools.

---

## 4. Quality gates before implementation start (`APZQEP-ENG-070A`)

| Gate | Criterion                                                                                                                               |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| G1   | Parts 1–5 + Appendices A–E of this OES filed                                                                                            |
| G2   | `COMPLETE.md` assembled and self-consistent                                                                                             |
| G3   | Owner Acceptance of this OES (OES-002) = **ACCEPTED** (or **ACCEPTED WITH CONDITIONS** with conditions tracked)                         |
| G4   | APZQEP-ARCH-014 Accepted / Architecture Baselined / Closed (done, 2026-07-28)                                                           |
| G5   | Domain 0.1.0 CERTIFIED (CERT-060A) and Infrastructure 0.2.0 INFRASTRUCTURE COMPONENT CERTIFIED (CERT-060B) remain closed and unmodified |
| G6   | A separate Owner Programme Instruction names `APZQEP-ENG-070A`                                                                          |

Implementation **MUST NOT** start if any of G1–G6 fail.

---

## 5. Quality gates before future Workbench Owner Acceptance (implementation-time preview)

| Gate | Criterion                                                                                                                 |
| ---- | ------------------------------------------------------------------------------------------------------------------------- |
| I1   | All WP-01…18 (Part 2) complete, or explicitly deferred with documented Owner-approved rationale                           |
| I2   | Mandatory Playwright journeys E2E-01…14 (Part 4 §3) PASS                                                                  |
| I3   | Accessibility gates A11Y-01…06 (Part 4 §4) PASS                                                                           |
| I4   | Negative/boundary tests N-01…06 (Part 4 §6) PASS                                                                          |
| I5   | Lint / types / build / unit / integration PASS                                                                            |
| I6   | No Domain/Infrastructure rule changes made without separate authority                                                     |
| I7   | `availableActions` algorithm (Part 3 §4) respected with zero invented transitions                                         |
| I8   | Compare presented strictly as governed unavailable per Part 3 §7 — no fabricated diff, no call to a non-existent endpoint |
| I9   | Product delivery pack filed under `docs/products/apzqep/test-plans/workbench/` (WP-18)                                    |
| I10  | Engineering Completion Review (ECR) PASS under OES-002 v1.1.0                                                             |

---

## 6. Owner Acceptance criteria (this OES — design/delivery contract)

This OES (`COMPLETE.md`) is **Accepted** only when the Owner confirms:

1. **Completeness** — Parts 1–5 and Appendices A–E are filed and `COMPLETE.md` is ready for review.
2. **Fidelity** — the specification does not redefine APZQEP-ARCH-014, the certified Domain (0.1.0), or the certified Infrastructure (0.2.0/CERT-060B).
3. **Scope correctness** — work packages (Part 2) cover ARCH-014 surfaces without gaps or invention.
4. **Technical approach** — the stack, repository placement, and action rendering algorithm (Part 3) match the approved platform stack (Document 004) and sibling QEP Workbenches.
5. **Testing sufficiency** — the test pyramid, Playwright journeys, and accessibility gates (Part 4) are sufficient to certify a production-quality Workbench later.
6. **AI/MCP boundaries** — explicit, non-bypassable, with the no-approve-bypass rule stated without exception (Part 5 §2–3).
7. **Honesty about L-01/L-02/L-03** — the Compare presentation contract (Part 3 §7) and items-on-DTO binding (Part 3 §3 rule 8) are represented accurately, with no fabricated features.
8. **STOP condition is unambiguous** — no code may be written under this OES; a separate Owner Instruction is required to authorise `APZQEP-ENG-070A`.
9. **Traceability** — every baseline (ARCH-013, ARCH-014, ENG-060A/CERT-060A, ENG-060B/CERT-060B, Documents 000/005/006/015/016/017/018/021/028) is respected and correctly cited.

### 6.1 Outcomes (OES-002)

| Outcome                      | Effect                                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **ACCEPTED**                 | This OES is baselined; a separate Owner Instruction **MAY** subsequently authorise `APZQEP-ENG-070A` implementation |
| **ACCEPTED WITH CONDITIONS** | Listed conditions **MUST** close before or as the first `APZQEP-ENG-070A` gate                                      |
| **REJECTED**                 | Rework Parts of this OES; no implementation authorised                                                              |
| **DEFERRED**                 | Parked; no implementation authority                                                                                 |

AI **MUST NOT** issue any of these outcomes.

---

## 7. Explicit STOP

```text
APZQEP-OES-ENG-070A
SPECIFICATION ONLY UNTIL OWNER ACCEPTANCE
NO REACT / NEXT.JS / UI IMPLEMENTATION BEFORE ACCEPTANCE
AFTER ACCEPTANCE: A SEPARATE OWNER INSTRUCTION IS STILL REQUIRED
  TO AUTHORISE APZQEP-ENG-070A IMPLEMENTATION
NO CAPABILITY CERTIFICATION WITHOUT FURTHER OWNER INSTRUCTION
```

---

## 8. Traceability

| This Part       | Trace                                    |
| --------------- | ---------------------------------------- |
| AI/MCP          | ARCH-014 Part 5 §6–7 · OES-000 AI matrix |
| Review outcomes | OES-002 v1.1.0                           |
| Quality / DoD   | Document 015                             |
| Prior Parts     | This OES Parts 1–4                       |
| Precedent       | APZQEP-OES-ENG-050C Part 5               |

---

## 9. Acceptance criteria (summary, restated)

This OES **SHALL**:

1. Conform to Document 000, OES-000, OES-001, and be reviewable under OES-002.
2. Preserve fidelity to APZQEP-ARCH-014, the certified Domain (0.1.0), and the certified Infrastructure (0.2.0).
3. Define complete, implementable work packages (WP-01…18) with a recommended order and Definition of Done.
4. Define a complete technical approach: stack, repository placement, API consumption rules, the normative action rendering algorithm, state model, Design System discipline, security, and the Compare presentation contract.
5. Define a sufficient testing pyramid, Playwright journeys, accessibility gates, and quality gates for both implementation start and future Owner Acceptance.
6. Define AI and MCP boundaries without implementation, with an explicit no-approve-bypass rule.
7. Contain **no** engineering, implementation, or production code.

---

## 10. STOP (Part 5)

```text
APZQEP-OES-ENG-070A
IMPLEMENTED
AWAITING OWNER ACCEPTANCE

NO WORKBENCH ENG IMPLEMENTATION
NO UI CODE
```
