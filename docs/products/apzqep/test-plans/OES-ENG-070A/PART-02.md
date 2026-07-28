# APZQEP-OES-ENG-070A
# PART 2 — Delivery Work Packages

| Item | Value |
| ---- | ----- |
| Document | APZQEP-OES-ENG-070A |
| Part | **2 of 5** |
| Programme | APZQEP-OES-ENG-070A |
| Status | **IMPLEMENTED / AWAITING OWNER ACCEPTANCE** |

---

## 1. Purpose

Define ordered work packages (WP) that map 1:1 to APZQEP-ARCH-014 surfaces and quality obligations, so that a future `APZQEP-ENG-070A` implementation programme can proceed without inventing scope.

Implementation, once separately authorised, **SHALL** proceed by WP. Skipping a WP's Definition of Done inside a PR is a defect.

---

## 2. Work package catalogue

| WP | Title | Architecture trace | Deliverable |
| -- | ----- | ------------------- | ----------- |
| **WP-01** | Module registration & Sidebar IA | ARCH-014 Part 2 §3 | **APZ QEP** Activity Bar entry (existing) hosts a **Test Plans** Sidebar module; permission-gated nav items (Dashboard, Explorer, Review, Search) |
| **WP-02** | Routes & deep links | ARCH-014 Part 2 §4 | Stable route tree per Appendix C, including `.../compare` as a governed unavailable slot |
| **WP-03** | API client & DTO binding | ENG-060B Parts 3–4 | Typed client for `/api/v1/qep/plans/*`; standard error envelope; correlation id propagation |
| **WP-04** | Explorer | ARCH-014 Part 2 §6 · Part 3 §4 | Columns, filters, sort, pagination (`pageSize` ≤ 50), selection, create affordance |
| **WP-05** | Inspector shell | ARCH-014 Part 3 §6 | Panels: Summary, Metadata, Items/Linked Specs (L-02), Relationships, History, Versions, Audit |
| **WP-06** | Draft create / edit | ARCH-014 Part 3 §5, §7 | Create Draft Form + Edit Draft Form bound to `qep.plan.create` / `qep.plan.update` |
| **WP-07** | Action bar & dialogs | ARCH-014 Part 3 §9–10 | All contract actions rendered strictly from `availableActions`; discrete-POST commands per ENG-060B |
| **WP-08** | Review queue | ARCH-014 Part 2 §7 · Part 4 §5 | Filtered `status=review` surface for approve/reject decisions |
| **WP-09** | Dashboard | ARCH-014 Part 3 §3 | Counts / attention widgets sourced from list/aggregate APIs only |
| **WP-10** | Search UI | ARCH-014 Part 2 §8 | Capability-scoped search + global Unified Search result opening |
| **WP-11** | Relationships / linked specifications | ARCH-014 Part 3 §8 | Reference viewer + add/remove gated by `availableActions`; deep links to foreign Workbenches |
| **WP-12** | Versions & Compare | ARCH-014 Part 3 §6, Part 4 §6 | Version lineage panel (live); **Compare governed unavailable** pending Infrastructure **L-01** — route exists, presentation contract only |
| **WP-13** | History | ARCH-014 Part 3 §6 | Append-only history panel / route |
| **WP-14** | Cross-capability links | ARCH-014 Part 2 §9 | Governed unavailable slots for Execution / Run / Evidence / Defect references |
| **WP-15** | Session / preferences | ARCH-014 Part 2 §10 · Document 018 / 023 | Filter/selection/tab restore + mandatory re-fetch and permission re-validation |
| **WP-16** | Accessibility hardening | ARCH-014 Part 5 §3 | Keyboard operability, focus management, axe clean on primary surfaces |
| **WP-17** | Playwright journeys | Part 4 (this OES) | End-to-end journeys per Appendix D |
| **WP-18** | Docs & evidence | OES-000 §10.3 | Product delivery pack under `docs/products/apzqep/test-plans/workbench/` (future ENG delivery) |

All components delivered under these WPs are **presentation only**. No WP **MAY** encode Domain lifecycle legality beyond rendering server `availableActions`.

---

## 3. Recommended delivery order

```text
WP-01 → WP-02 → WP-03
  → WP-04 → WP-05 → WP-06 → WP-07
  → WP-08 → WP-09 → WP-10
  → WP-11 → WP-12 → WP-13 → WP-14
  → WP-15 → WP-16 → WP-17 → WP-18
```

Notes:

1. WP-03 **MAY** proceed in parallel with WP-01/WP-02.
2. WP-07 **MUST** follow WP-05 (Action Bar depends on the Inspector shell existing).
3. WP-16 and WP-17 **MUST** cover all prior UI WPs before any future Workbench Owner Acceptance.
4. WP-12's Compare sub-scope **MUST NOT** be marked complete as a "working feature" — only as a correctly governed unavailable slot (Part 3 §7).

---

## 4. Per-WP Definition of Done (minimum, applies to all WPs)

Each WP, when implemented under a future authorised `APZQEP-ENG-070A`, **SHALL** include:

1. Implementation conforming to APZQEP-ARCH-014 without architectural invention.
2. Tests appropriate to the WP (Part 4).
3. No new Domain or Infrastructure business rules.
4. Actions rendered only from `availableActions` where applicable.
5. Design System tokens only — no hardcoded colours, spacing, or one-off components.
6. Documentation touch for any non-trivial surface (WP-18 aggregates this).
7. No regression to any prior WP's acceptance criteria.

---

## 5. Explicit exclusions from these WPs

| Excluded | Reason |
| -------- | ------ |
| Live Version Compare API call | Infrastructure limitation **L-01** — deferred; WP-12 delivers the governed unavailable slot only |
| Dedicated `GET .../items` client call | Infrastructure limitation **L-02** — items ship on the Plan DTO; WP-05 binds to `items[]` |
| Fake Test Execution / Run / Evidence / Defect screens | ARCH-014 §11 governed unavailable slots only (WP-14) |
| Domain or Infrastructure migrations / contract changes | ENG-060A/ENG-060B are closed; any change requires a separate programme |
| Capability Certification / Freeze / 1.0.0 promotion | Later, separately authorised Owner Instruction |
| Inventing `availableActions` not present on the DTO | Never — server is sole authority (Part 3 §4) |

---

## 6. Traceability

| WP | ARCH-014 | ENG-060B / contracts |
| -- | -------- | --------------------- |
| WP-01–02 | Part 2 IA / URLs | — |
| WP-03 | — | REST / DTO (Part 4) |
| WP-04 | Part 2 §6 Explorer | List/search |
| WP-05–07 | Part 3 §6–10 Inspector / Actions | Commands + `availableActions` |
| WP-08–10 | Part 2 §7–8, Part 3 §3 Review / Dashboard / Search | List/search |
| WP-11–13 | Part 3 §6, §8 Relationships / Versions / History | DTO fields |
| WP-14 | Part 2 §9 cross-capability | Reference fields |
| WP-15 | Part 2 §10 session restore | Preferences |
| WP-16–17 | Part 5 NFRs | — |
| WP-18 | OES-000 close artefacts | — |

---

## 7. Explicit non-goals (Part 2)

This Part does NOT define technical stack, repository placement, action rendering algorithm, or state model (Part 3); testing pyramid or quality gates (Part 4); AI/MCP boundaries or Owner Acceptance criteria (Part 5).

---

## 8. STOP (Part 2)

```text
APZQEP-OES-ENG-070A
WORK PACKAGES DEFINE SCOPE ONLY
NO WP MAY BE IMPLEMENTED BEFORE OWNER ACCEPTANCE + SEPARATE OWNER INSTRUCTION
```
