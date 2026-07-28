# APZQEP-OES-ENG-070A
# PART 1 — Programme Scope, Objectives, Constraints & Baselines

| Item | Value |
| ---- | ----- |
| Document | **APZQEP-OES-ENG-070A** |
| Title | Test Plans Workbench Engineering Specification |
| Programme | **APZQEP-OES-ENG-070A** |
| Capability | Test Plans |
| Layer | Presentation / Workbench Engineering Specification |
| Status | **IMPLEMENTED / AWAITING OWNER ACCEPTANCE** |
| Version | **1.0.0-oes** |
| Part | **1 of 5** |
| Governing methodology | [OES-000](../../../../engineering/oes/OES-000-Owner-Engineering-Specification-Standard.md) **FROZEN 1.0.0** |
| Writing standard | [OES-001](../../../../engineering/oes/OES-001-Engineering-Writing-Standard.md) **FROZEN 1.0.0** |
| Review standard | [OES-002](../../../../engineering/oes/OES-002-Engineering-Review-and-Acceptance-Standard.md) **FROZEN 1.1.0** |
| Constitution | Document 000 v1.0.0 |
| Architecture baseline | [APZQEP-ARCH-014](../OES-ARCH-014/COMPLETE.md) **ACCEPTED / ARCHITECTURE BASELINED / CLOSED** |

**Normative language:** **SHALL** / **MUST** = mandatory; **SHOULD** = strong recommendation; **MAY** = optional (RFC 2119 as applied by OES-001).

---

## 1. Executive summary

This OES specifies the **Workbench Engineering** programme that will implement the Test Plans presentation layer for APZ QEP.

It translates the Owner-Accepted Architecture (APZQEP-ARCH-014) into an implementable delivery contract: work packages (Part 2), technical approach (Part 3), testing and quality gates (Part 4), and AI/MCP boundaries plus Owner Acceptance criteria (Part 5).

This programme **SHALL** produce specification only. It **SHALL NOT** create React components, Next.js pages, hooks, stores, REST clients, DTOs, database artefacts, or any other production code. It **SHALL NOT** perform Domain or Infrastructure engineering.

**Implementation MUST NOT begin under this OES.** Coding requires (1) Owner Acceptance of this `COMPLETE.md` under OES-002, and (2) a separate, subsequent Owner Programme Instruction naming the implementation programme (anticipated identifier: **APZQEP-ENG-070A**), consistent with the precedent set by APZQEP-OES-ENG-050C → APZQEP-ENG-050C.

---

## 2. Programme objective

Deliver a delivery-ready specification for a production-quality Test Plans Workbench that:

1. Conforms to APZQEP-ARCH-014 without architectural invention.
2. Consumes ENG-060B REST (`/api/v1/qep/plans/*`) only, via the platform API Gateway.
3. Renders server-computed `availableActions` as the **sole** action authority — never a client-invented transition.
4. Reuses the APZHUB Desktop shell grammar (Documents 005 / 016 / 017) and the Design System (006 / 028) — no parallel shell, no one-off styling.
5. Meets the WCAG AA, performance, and security targets set in APZQEP-ARCH-014 Part 5.
6. Passes unit, component, integration, Playwright, and accessibility gates (Document 015 / OES-002).
7. Presents Version Compare as **governed unavailable** pending Infrastructure limitation **L-01** — honestly, without fabricating a client-side diff.

---

## 3. Baselines (normative, immutable)

| Baseline | Status | Role |
| -------- | ------ | ---- |
| Document 000 | Constitution | Supreme authority on conflict |
| OES-000 / OES-001 / OES-002 v1.1.0 | **FROZEN** | Methodology / writing / review |
| APZQEP-ARCH-013 | **ACCEPTED / ARCHITECTURE BASELINED / CLOSED** | Test Plans Capability Architecture |
| Domain `@apzhub/qep-test-plans` **0.1.0 CERTIFIED** (OES-ENG-060A / ENG-060A / CERT-060A) | **CLOSED** | Certified lifecycle, statuses, invariants |
| Infrastructure `@apzhub/qep-test-plans` **0.2.0 INFRASTRUCTURE COMPONENT CERTIFIED** (OES-ENG-060B / ENG-060B / CERT-060B) | **CLOSED** | Certified REST surface, permissions, `availableActions`, search projection |
| **APZQEP-ARCH-014** (this specification's parent) | **ACCEPTED / ARCHITECTURE BASELINED / CLOSED** (2026-07-28) | Test Plans Workbench Architecture — Parts 1–5, Appendices A–E |
| Recorded Infrastructure limitations L-01 / L-02 / L-03 | **RECORDED** | [KNOWN-LIMITATIONS.md](../infrastructure/KNOWN-LIMITATIONS.md) |
| Documents 005 / 016 / 017 / 018 / 021 | Applicable | Shell, navigation, sessions, notifications frameworks |
| Documents 006 / 028 | Applicable | Design System / UI Component SDK |

This programme **SHALL** treat every row above as an **immutable dependency**. It **SHALL NOT** redefine Domain lifecycle, Infrastructure REST shape, permission names, or Workbench Architecture decisions already baselined in APZQEP-ARCH-014.

---

## 4. Binding invariant (Owner directive, ARCH-014 Acceptance)

> **"The Workbench SHALL never determine what a user may do."**

This principle is an **architectural invariant** across APZQEP and **SHALL** be preserved without exception throughout this OES and any downstream engineering. Every action control's visibility and enablement **SHALL** derive solely from the server-computed `availableActions` array on the Plan DTO (Part 3 §4).

---

## 5. Layer ownership

| Layer | This programme |
| ----- | -------------- |
| Presentation / Workbench | **OWNS** — specification for UI implementation |
| Platform Services / REST | Consumes — **MUST NOT** redefine |
| Domain | Consumes — **MUST NOT** change rules |
| Persistence | **MUST NOT** touch |
| Permissions / Audit / Search engines | Consumes platform — **MUST NOT** re-implement |
| AI / MCP | Boundary only — **MUST NOT** implement |

---

## 6. Explicit non-goals (this OES and its downstream ENG)

This programme **SHALL NOT**:

1. Produce React components, Next.js pages/routes, hooks, stores, REST clients, or DTOs.
2. Perform Domain or Infrastructure changes of any kind.
3. Invent `availableActions`, lifecycle transitions, or any client-side legality the certified Infrastructure has not exposed.
4. Implement Test Execution, Evidence, Defects, Coverage, or any other future capability's domain model.
5. Own notification delivery, search indexing, or audit system of record.
6. Bypass the API Gateway or Platform Services.
7. Introduce mandatory commercial UI libraries outside the approved stack (Document 004).
8. Redesign the Test Plans Workbench Architecture (APZQEP-ARCH-014 is baselined; changes require an ADR or an approved revision).
9. Author a fake or client-simulated Version Compare API call — Compare **SHALL** remain a governed unavailable slot per L-01 (Part 3 §7, Part 5 §3).
10. Perform Capability Certification, Freeze, or promote the package to 1.0.0.
11. Begin implementation before this OES is Owner-Accepted **and** a separate Owner Instruction authorises `APZQEP-ENG-070A`.

---

## 7. Prerequisites already satisfied

| Gate | Status |
| ---- | ------ |
| APZQEP-ARCH-013 Accepted | ✅ |
| Domain 0.1.0 CERTIFIED (CERT-060A) | ✅ |
| Infrastructure 0.2.0 INFRASTRUCTURE COMPONENT CERTIFIED (CERT-060B) | ✅ |
| APZQEP-ARCH-014 Accepted / Architecture Baselined / Closed | ✅ (2026-07-28) |
| Owner authorisation to prepare this OES | ✅ — recorded in APZQEP-ARCH-014 OWNER-ACCEPTANCE.md ("Authorises next") |

## 8. Prerequisites to start coding (not yet satisfied)

| Gate | Required |
| ---- | -------- |
| This OES `COMPLETE.md` Owner-Accepted (OES-002) | ⏳ **PENDING** |
| Separate Owner Instruction naming `APZQEP-ENG-070A` | ⏳ **PENDING** |

Implementation **MUST NOT** start until both gates above are satisfied.

---

## 9. Success criteria (this OES)

This OES is successful when another engineer can implement and later certify the Workbench using only:

- This OES (Parts 1–5, Appendices A–E)
- APZQEP-ARCH-014 (Parts 1–5, Appendices A–E)
- ENG-060B REST documentation (Parts 3–4) and `KNOWN-LIMITATIONS.md`
- The Platform shell / Design System / Module SDK

…without inventing information architecture, actions, business rules, or REST contracts.

---

## 10. Traceability

| This Part | Trace |
| --------- | ----- |
| Architecture principles / boundaries | APZQEP-ARCH-014 Part 1 |
| Baselines | APZQEP-ARCH-013, ENG-060A/CERT-060A, ENG-060B/CERT-060B |
| Known limitations | `docs/products/apzqep/test-plans/infrastructure/KNOWN-LIMITATIONS.md` |
| Methodology | OES-000 / OES-001 / OES-002 |
| Precedent | APZQEP-OES-ENG-050C (Test Specifications Workbench Engineering) |

---

## 11. Explicit non-goals (Part 1 restated)

This Part does NOT define work packages (Part 2), technical approach (Part 3), testing/quality gates (Part 4), or AI/MCP boundaries and acceptance criteria (Part 5).

---

## 12. STOP (Part 1)

```text
APZQEP-OES-ENG-070A
SPECIFICATION ONLY
NO WORKBENCH ENGINEERING IMPLEMENTATION UNDER THIS PART
NO REACT / NEXT.JS / PRODUCTION CODE
```
