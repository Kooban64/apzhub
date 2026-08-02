# APZQEP Engineering Framework — Changelog

| Field    | Value                                                             |
| -------- | ----------------------------------------------------------------- |
| Document | APZQEP-ENGINEERING-FRAMEWORK-CHANGELOG                            |
| Product  | [APZQEP Engineering Framework](./APZQEP-ENGINEERING-FRAMEWORK.md) |
| Purpose  | Engineering-level evolution record (not a Git log duplicate)      |
| Audience | Product Board · Architects · Leads                                |

---

## How to use

Record Framework and extension milestones that matter for governance:

- Framework version baselines and bumps
- New specialised standards
- Normative revisions that change compliance obligations
- Promotions toward APZHUB-wide standards (when decided)

Do **not** list every documentation typo or evidence file. Prefer concise, dated entries with document versions and commit SHAs when available.

---

## Changelog

### 2026-08-02 — Framework v1.0 BASELINED

- **Milestone:** APZQEP Engineering Framework v1.0
- **Status:** BASELINED
- **Core composition:** README, Constitution, Handbook, Engineering Standards v1.0, Engineering Specification Template v1.0, Framework declaration
- **Baseline commit:** `41741490e9de0caa33cca9383281b25d8541a0c8`
- **Citation:** `Conforms to APZQEP Engineering Framework v1.0`
- **Notes:** Documentation milestone only — not a Git product release tag

### 2026-08-02 — Testing Standard v1.0 added

- **Extension:** [APZQEP-TESTING-STANDARD.md](./APZQEP-TESTING-STANDARD.md) v1.0 Normative
- **Programme phase:** APZQEP-ENG-001 Phase 5 — Product Board CERTIFIED
- **Commit:** `54cae6fa81d3caab57c527749f0062729adf4a8f`
- **Impact:** Framework core unchanged; mandatory test levels and evidence rules for slices

### 2026-08-02 — Certification Standard v1.0 added

- **Extension:** [APZQEP-CERTIFICATION-STANDARD.md](./APZQEP-CERTIFICATION-STANDARD.md) v1.0 Normative
- **Programme phase:** APZQEP-ENG-001 Phase 6
- **Commit:** `fc8a8d1d3d08aa72165011c3b92ef7f39aebb1cc`
- **Impact:** Framework core unchanged; PASS / FAIL / STOP, gates, evidence, Board vs engineering vs release certification

### 2026-08-02 — Phase 6 CERTIFIED · specialised expansion paused

- **Product Board:** Phase 6 CERTIFIED
- **Decision:** Pause APZQEP specialised standard authoring
- **Review:** [APZQEP-ENG-001-PROMOTION-REVIEW.md](./APZQEP-ENG-001-PROMOTION-REVIEW.md)
- **Handoff:** [APZHUB-ENG-002 Portfolio Engineering Standards](../../../engineering/APZHUB-ENG-002/README.md) designed

### 2026-08-02 — Promotion Review CERTIFIED · APZQEP-ENG-001 CLOSED

- **Promotion Review:** CERTIFIED
- **Programme:** APZQEP-ENG-001 → **COMPLETE** · Framework enters **MAINTENANCE**
- **Matrix refinement:** Engineering Standards **SPLIT** (APZHUB portfolio doc + APZQEP product doc) — not “partial”
- **Handover:** governance responsibility transitions to APZHUB-ENG-002 (next session)
- **Not started:** APZHUB-ENG-002 execution (deferred by Board)

---

## Planned (paused pending APZHUB-ENG-002)

| Item                   | Intent                                     | Status     |
| ---------------------- | ------------------------------------------ | ---------- |
| API Standard           | Product extension (initially KEEP PRODUCT) | **PAUSED** |
| Domain Event Standard  | Product extension (initially KEEP PRODUCT) | **PAUSED** |
| Database Standard      | Product extension (initially KEEP PRODUCT) | **PAUSED** |
| Documentation Standard | Likely later portfolio promote             | **PAUSED** |
| Engineering Checklists | Merge with portfolio checklists            | **PAUSED** |

---

## Versioning policy (summary)

| Change type                                  | Framework version impact                                   |
| -------------------------------------------- | ---------------------------------------------------------- |
| New specialised standard (additive)          | No Framework bump; changelog entry                         |
| Normative change to a specialised standard   | Bump that standard’s Version; changelog entry              |
| Normative change to Framework core documents | Framework version bump (for example 1.0 → 1.1) + changelog |
| Editorial-only fixes                         | MAY omit changelog entry                                   |
