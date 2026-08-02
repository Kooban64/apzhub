# Phase 1A — Gap Analysis

| Field                      | Value                       |
| -------------------------- | --------------------------- |
| Programme                  | APZHUB-ENG-002              |
| Phase                      | 1A                          |
| Review                     | Gap Analysis                |
| Status                     | **COMPLETE**                |
| Timestamp (UTC)            | 20260802T121256Z            |
| Authoring of new standards | **FORBIDDEN** in this phase |

---

## Missing enterprise standards (candidates — do not author)

| ID      | Candidate                                              | Gap type                         | Needed for Baseline 1.2 MVP? | Suggested timing                 |
| ------- | ------------------------------------------------------ | -------------------------------- | ---------------------------- | -------------------------------- |
| ES-004  | Enterprise Engineering Workflow                        | Process detail beyond ENG-001    | **NO**                       | After Phase 1A / Stable          |
| ES-005  | Enterprise Engineering Standards (generic conventions) | Naming/commits/evidence generics | **NO**                       | After ES-004 or with it          |
| ES-010+ | API / Database / Domain Event / Documentation          | Domain technical standards       | **NO**                       | Later waves; product-first often |

---

## Overlapping / duplicate governance (none blocking)

| Pair                                    | Finding                                 | Action                                               |
| --------------------------------------- | --------------------------------------- | ---------------------------------------------------- |
| ES-003 vs ENG-001 short template        | Complementary by design                 | Keep; document in adoption guidance                  |
| ES-002 vs SLICE-CERTIFICATION / ENG-001 | Complementary; ES-002 is enterprise law | Products cite ES-002; ENG-001 remains process parent |
| Catalogue vs Baseline                   | Distinct roles (exist vs mandatory)     | Keep                                                 |
| Product frameworks vs Baseline          | Specialisation vs enterprise            | Keep                                                 |

No duplicate Active enterprise standards for the same concern.

---

## Editorial / consistency gaps (optional remediation)

| Gap                                                               | Location                | Severity  | Blocks ACCEPTED? |
| ----------------------------------------------------------------- | ----------------------- | --------- | ---------------- |
| ES-001 §0 still mentions interim “until ES-002 Active”            | APZHUB-TESTING-STANDARD | Editorial | NO               |
| ES-003 §1 still mentions interim certification path               | Spec Template           | Editorial | NO               |
| Review frequency wording slight variance (Annual vs Annual/major) | Headers                 | Editorial | NO               |

These SHOULD be cleaned in a maintenance change-control pass after Board acceptance — not as Baseline 1.2 structural failure.

---

## Future candidates (inventory only)

Retain Catalogue Proposed/Deferred rows. Do not promote during Phase 1A.

---

## Conclusion

**No structural gaps** prevent Baseline 1.2 from operating as the enterprise engineering system. Remaining candidates are **enhancements**.
