# APZQEP-OES-ARCH-013  
# PART 5 — AI/MCP Boundaries, Quality, Deliverables & Acceptance Criteria

| Item | Value |
| ---- | ----- |
| Document | APZQEP-OES-ARCH-013 |
| Part | **5 of 5** |
| Programme | APZQEP-ARCH-013 |

---

## 1. AI boundary

### 1.1 Stance

AI is a **future consumer** of Test Plans architecture. This programme **SHALL NOT** implement AI.

### 1.2 Where AI MAY assist (future, separately authorised)

| Assistance | Constraint |
| ---------- | ---------- |
| Plan creation drafts | Suggestions only; human/Owner workflow remains authoritative |
| Coverage analysis | Read-only analysis over references; no SoR writes without approval |
| Gap analysis | Identify missing Specifications vs Requirements/Trace projections |
| Duplicate detection | Suggest similar plans; no silent merge |
| Planning assistance | Ordering / scheduling suggestions |

### 1.3 AI MUST NOT (ever, without new governance)

- Approve, reject, start, or complete plans autonomously as authority  
- Bypass `availableActions` / permissions  
- Mutate frozen Requirements / Specs / Verification  
- Become SoR for Plans  
- Execute tests or invent run results  

---

## 2. MCP boundary

### 2.1 Stance

MCP is a **future consumer** interface. This programme **SHALL NOT** implement MCP servers or tools.

### 2.2 Future MCP MAY expose (architectural)

- Read plan summary / items / status  
- List plans with permission filters  
- Propose Draft plan payloads for human confirmation  

### 2.3 MCP MUST NOT

- Hold elevated privileges beyond the invoking user  
- Perform privileged lifecycle transitions without the same authz path as REST  
- Cache Plan SoR as authoritative outside the platform  

---

## 3. Accessibility (architectural)

Future Workbench **SHALL** meet WCAG AA targets (Document 006 / 015):

- Keyboard complete workflows  
- Focus management for dialogs  
- Status not colour-only  
- Semantic structure for Explorer / Inspector  

Detailed a11y contracts belong in future Workbench Architecture OES.

---

## 4. Performance (architectural)

| Concern | Target posture |
| ------- | -------------- |
| Explorer | Server pagination; ≤ 50 / page default |
| Inspector items | Paginate large item sets |
| Dashboard | Bounded widgets |
| Search | Platform search; bounded pageSize |
| Compare | Pairwise version compare |

No load-test campaign is part of ARCH-013.

---

## 5. Security (architectural)

1. Authn / authz on every future API.  
2. Tenant isolation.  
3. Least privilege roles (Part 3).  
4. Audit for governance transitions.  
5. No secrets in Plan content.  
6. Zero Trust request path (Document 013).

---

## 6. Quality gates for this architecture programme

| Gate | Criterion |
| ---- | --------- |
| OES-000 | Pack shape, lifecycle phase, no engineering |
| OES-001 | Structure, RFC 2119, terminology |
| OES-002 | Reviewable under Architecture Review class |
| Frozen baselines | No redefinition of Req / Trace / Ver / Specs |
| Completeness | Domain, lifecycle, nav, relationships, integrations defined |
| Exclusions | No production code / ENG artefacts |

---

## 7. Deliverables (this programme)

| Artefact | Path |
| -------- | ---- |
| Pack README | `docs/products/apzqep/test-plans/README.md` |
| Parts 1–5 | `OES-ARCH-013/PART-0N.md` |
| Appendices A–E | `OES-ARCH-013/APPENDIX-*.md` |
| COMPLETE | `OES-ARCH-013/COMPLETE.md` |
| Owner Summary | `OES-ARCH-013/OWNER-SUMMARY.md` |
| Completion Report | `OES-ARCH-013/ARCHITECTURE-COMPLETION-REPORT.md` |
| Owner Acceptance (pending) | `OES-ARCH-013/OWNER-ACCEPTANCE.md` |

---

## 8. Acceptance criteria

Architecture **SHALL**:

1. Conform to Document 000, OES-000, OES-001, and be reviewable under OES-002.  
2. Preserve capability independence of frozen baselines.  
3. Integrate with Requirements, Traceability, Verification, and Test Specifications by reference.  
4. Define complete information architecture (Plan, Items, Scope, Status, ownership, scheduling, readiness).  
5. Define complete lifecycle with explicit transitions.  
6. Define complete navigation, explorer, inspector, dashboard, and search attributes.  
7. Define relationships and future integration points (Execution, Runs, Evidence, Defects).  
8. Define architectural REST resources and events.  
9. Define AI and MCP boundaries without implementation.  
10. Contain **no** engineering, implementation, or production code.

---

## 9. Explicit exclusions (restated)

Do **NOT** implement: Domain · Repositories · REST · Workbench · Database · Search · Permissions catalogues · Testing · Infrastructure · AI · MCP · Engineering · Production code.

---

## 10. Recommended delivery cadence (organisational)

For every new capability after this architecture is Accepted:

1. Architecture Programme (ARCH)  
2. Owner Architecture Acceptance  
3. Engineering Specification (OES)  
4. Owner OES Acceptance  
5. Engineering Implementation (ENG)  
6. Engineering Completion Review (ECR)  
7. Owner Acceptance  
8. Independent Certification (CERT)  
9. Version Promotion  
10. Owner Freeze  

---

## 11. STOP (Part 5)

```text
APZQEP-ARCH-013
ACCEPTED / ARCHITECTURE BASELINED / CLOSED
NO ENGINEERING UNDER ARCH-013
NEXT: APZQEP-OES-ENG-060A (Owner Instruction)
```
