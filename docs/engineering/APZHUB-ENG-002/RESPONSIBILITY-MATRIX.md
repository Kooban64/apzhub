# Phase 1A — Responsibility Matrix

| Field           | Value                 |
| --------------- | --------------------- |
| Programme       | APZHUB-ENG-002        |
| Phase           | 1A                    |
| Review          | Responsibility Matrix |
| Status          | **COMPLETE**          |
| Timestamp (UTC) | 20260802T121256Z      |

---

## Primary chain

```text
Specify (ES-003)
    ↓
Test (ES-001)
    ↓
Certify (ES-002)
```

---

## Ownership matrix

| Concern                                       | Owner                              | MUST NOT own                                           |
| --------------------------------------------- | ---------------------------------- | ------------------------------------------------------ |
| Engineering contract structure / placeholders | **ES-003**                         | Testing levels; certification vocabulary               |
| What must be tested / evidence of tests       | **ES-001**                         | PASS/FAIL/STOP outcomes; Board CERTIFIED               |
| Certification outcomes, gates, audit trail    | **ES-002**                         | Test pyramid detail; specification section list        |
| What is mandatory today                       | **Baseline**                       | Normative technical rules (points to standards)        |
| What exists in any lifecycle state            | **Catalogue**                      | Adopted-set definition                                 |
| Promotion rules / Dual Approval / Abstraction | **Charter + Promotion Principles** | Product implementation detail                          |
| Slice day-to-day process                      | **ENG-001 / ES-000**               | Enterprise Baseline membership (unless Board folds in) |
| Release / GA / freeze                         | **Lifecycle Standard**             | Engineering unit PASS (ES-002 explicitly separates)    |

---

## Workflow alignment

| Workflow      | Controlling standard                                                        | Consumes                                                         |
| ------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Specification | ES-003                                                                      | Baseline citation; inherits ES-001/ES-002                        |
| Testing       | ES-001                                                                      | Spec Testing section (ES-003); feeds ES-002 testing gate         |
| Certification | ES-002                                                                      | Spec Acceptance Criteria (ES-003); ES-001 levels as testing gate |
| Traceability  | Spec Dependencies + Final Report (ES-003) + CERTIFICATION evidence (ES-002) | Catalogue / Baseline for enterprise IDs                          |

---

## Overlap check

| Potential overlap                      | Assessment                                                                           |
| -------------------------------------- | ------------------------------------------------------------------------------------ |
| ES-001 vs ES-002 testing gate          | **Complementary** — ES-001 defines content; ES-002 requires gate PASS                |
| ES-003 Testing section vs ES-001       | **Complementary** — ES-003 declares levels; ES-001 norms them                        |
| ES-003 Certification section vs ES-002 | **Complementary** — ES-003 records required outcome; ES-002 defines vocabulary/gates |
| ENG-001 short template vs ES-003       | **Complementary** — short cover vs full contract (stated in ES-003)                  |
| Board CERTIFIED vs engineering PASS    | **Separated** in ES-002                                                              |

---

## Conclusion

**PASS** — Specify / Test / Certify ownership is clear and non-conflicting.
