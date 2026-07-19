# Definition of Ready

> **Programme:** APZHUB-OPERATIONS-001  
> **Related:** [DEFINITION-OF-DONE](./DEFINITION-OF-DONE.md) · [AI-WORKFLOW](../foundation/AI-WORKFLOW.md) · [Product Engineering Reference Implementation](../products/APZHUB-PRODUCT-ENGINEERING-REFERENCE-IMPLEMENTATION.md)

---

## Purpose

Mandatory criteria **before any implementation begins** (product, platform, or material docs-governance delivery that claims “ready for code”).

---

## Minimum criteria (all required)

| #   | Criterion                              | Evidence                                                                      |
| --- | -------------------------------------- | ----------------------------------------------------------------------------- |
| 1   | **Approved vision**                    | Product `VISION.md` / programme objective accepted in scope                   |
| 2   | **Architecture**                       | `ARCHITECTURE.md` and/or ADR; freezes identified                              |
| 3   | **Dependencies available**             | Required packages/adapters/HTTP on disk (repository-first)                    |
| 4   | **Acceptance criteria**                | Testable outcomes in Sprint Guide / stories                                   |
| 5   | **Product / programme Owner Approval** | Explicit Owner Approval of the **named** programme                            |
| 6   | **Repository quality maintained**      | QA-002 PRODUCTION READY baseline held; CI not knowingly broken                |
| 7   | **Definition Pack / IR** (products)    | Pack complete; product **Implementation Ready** (or Owner exception recorded) |
| 8   | **In/out of scope frozen**             | Sprint Guide lists exclusions; Wave/freeze STOP rules known                   |
| 9   | **Bootstrap complete**                 | AI-MANIFEST + CURRENT-MILESTONE authorise this programme                      |

---

## Product-specific Ready (Phase 3)

From Product Engineering practice (PROJECTS-001 pattern):

1. Product Definition Pack complete (PRODUCTS-002)
2. Architecture Owner-approved
3. Dependencies available
4. Marked Implementation Ready
5. Owner Approval of named programme
6. Sprint Guide filed

---

## Not Ready — STOP

Do **not** start implementation if:

- Only a chat recommendation exists
- Dependencies are “planned” but absent on disk
- Freeze break without ADR + Owner
- Acceptance criteria are vague
- Repository quality gates are red without remediation plan

Raise Recommendation / ADR / Owner Approval instead.
