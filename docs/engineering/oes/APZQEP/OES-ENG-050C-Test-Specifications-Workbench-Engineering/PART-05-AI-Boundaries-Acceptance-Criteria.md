# APZQEP-OES-ENG-050C

# PART 5 — AI Boundaries, Quality Gates & Acceptance Criteria

| Item     | Value               |
| -------- | ------------------- |
| Document | APZQEP-OES-ENG-050C |
| Part     | **5 of 5**          |
| Status   | **FILED**           |

---

## 1 AI authority matrix (implementation)

| Activity                               | AI MAY                     | AI MUST NOT                    |
| -------------------------------------- | -------------------------- | ------------------------------ |
| Generate UI from this OES + ARCH-012   | ✅                         | Invent architecture or actions |
| Suggest copy / a11y fixes              | ✅                         | Approve lifecycle              |
| Wire `availableActions`                | ✅ as coded                | Fabricate actions              |
| Decide Owner Acceptance                | ❌                         | ❌                             |
| Change Domain / contracts for ADR-0074 | ❌ without Owner ENG delta | ❌ silently                    |
| Begin coding before this OES Accepted  | ❌                         | ❌                             |

Path for any AI-assisted mutation remains:

```text
Human confirms → Platform API → Authn/Authz/Validation → Domain → Persist/Audit
```

---

## 2 MCP boundaries

MCP tools MUST use the same permissions and `availableActions` semantics. MCP MUST NOT own Workbench state or Specification SoR.

---

## 3 Quality gates before implementation starts

| Gate | Criterion                                         |
| ---- | ------------------------------------------------- |
| G1   | Parts 1–5 + Appendices filed                      |
| G2   | `COMPLETE.md` assembled                           |
| G3   | Owner Acceptance of this OES (OES-002) = ACCEPTED |
| G4   | OES-ARCH-012 Accepted (done)                      |
| G5   | ENG-050B Accepted (done)                          |

---

## 4 Quality gates before Workbench Owner Acceptance (implementation)

| Gate | Criterion                                                                     |
| ---- | ----------------------------------------------------------------------------- |
| I1   | All WP-01…18 complete or explicitly deferred with Owner Conditions            |
| I2   | Playwright E2E-01…10 PASS                                                     |
| I3   | A11Y-01…05 PASS                                                               |
| I4   | Lint / types / build / unit PASS                                              |
| I5   | No Domain/Infra rule changes without separate authority                       |
| I6   | ADR-0074 respected (no invented return-to-draft)                              |
| I7   | Product pack docs under `docs/products/apzqep/test-specifications/workbench/` |
| I8   | Completion report + evidence JSON                                             |
| I9   | Workbench Review PASS (OES-002)                                               |

---

## 5 Owner Acceptance criteria (this OES — design/delivery contract)

This OES is Accepted when the Owner confirms:

1. Scope and non-goals are correct
2. Work packages cover ARCH-012 without gaps or invention
3. Technical approach matches platform stack and sibling Workbenches
4. Testing / a11y gates are sufficient
5. AI/MCP boundaries are explicit
6. STOP condition clear: no code before Acceptance
7. ADR-0074 incorporated

### Outcomes

| Outcome                      | Effect                                     |
| ---------------------------- | ------------------------------------------ |
| **ACCEPTED**                 | APZQEP-ENG-050C implementation authorised  |
| **ACCEPTED WITH CONDITIONS** | Conditions tracked; coding only as allowed |
| **REJECTED / DEFERRED**      | No implementation                          |

---

## 6 Explicit STOP

```text
APZQEP-OES-ENG-050C
SPECIFICATION ONLY UNTIL OWNER ACCEPTANCE
NO REACT / NEXT / UI IMPLEMENTATION BEFORE ACCEPTANCE
AFTER ACCEPTANCE: IMPLEMENT PER WP-01…18 ONLY
NO CERTIFICATION WITHOUT FURTHER OWNER INSTRUCTION
```

---

## END OF PART 5
