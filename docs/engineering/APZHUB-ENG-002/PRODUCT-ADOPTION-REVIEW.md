# Phase 1A — Product Adoption Review

| Field           | Value            |
| --------------- | ---------------- |
| Programme       | APZHUB-ENG-002   |
| Phase           | 1A               |
| Review          | Product Adoption |
| Status          | **COMPLETE**     |
| Timestamp (UTC) | 20260802T121256Z |

---

## Question

Can every APZHUB product adopt Baseline 1.2 without ambiguity?

---

## Adoption model (common)

For any product:

1. Cite **Enterprise Engineering Baseline 1.2** in engineering work.
2. Author specifications using **ES-003** (or a product specialisation that does not omit mandatory sections).
3. Execute tests per **ES-001**.
4. Close work per **ES-002** (PASS / FAIL / STOP).
5. Keep product frameworks/standards as **specialisations** that MAY tighten, MUST NOT weaken.

No product must invent a competing testing, certification, or specification philosophy.

---

## Product-by-product assessment

| Product              | Current maturity vs Baseline 1.2                                                | Adoption path                                                                                                                                    | Ambiguity | Risk                                 |
| -------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------- | ------------------------------------ |
| **APZQEP**           | Reference implementation; product standards already proven source of ES-001…003 | Declare conformance to Baseline 1.2; keep product standards as specialisations / citation bridges; map slice specs to ES-003 structure over time | LOW       | LOW — primarily citation maintenance |
| **APZ Projects**     | Future / nascent product engineering                                            | Adopt ES-003 from first authorised engineering work; inherit ES-001/ES-002                                                                       | LOW       | LOW if adopted at start              |
| **APZ Support**      | Same                                                                            | Same                                                                                                                                             | LOW       | LOW                                  |
| **APZ Time**         | Same                                                                            | Same                                                                                                                                             | LOW       | LOW                                  |
| **APZ Documents**    | Same                                                                            | Same                                                                                                                                             | LOW       | LOW                                  |
| **APZ Law Platform** | Same                                                                            | Same                                                                                                                                             | LOW       | LOW                                  |
| **Future products**  | N/A                                                                             | Baseline 1.2 is default mandatory set at first engineering authorisation                                                                         | LOW       | LOW                                  |

---

## Practical adoption notes

| Topic                                   | Guidance                                                               |
| --------------------------------------- | ---------------------------------------------------------------------- |
| Existing APZQEP slice specs             | Remain valid; new work SHOULD migrate toward ES-003 instance structure |
| ENG-001 short Owner prompts             | Still valid as covers pointing at filled ES-003 specs                  |
| Product Testing/Certification standards | MAY remain; MUST claim conformance to ES-001/ES-002                    |
| Release/GA                              | Still Lifecycle Standard — not blocked or granted by Baseline 1.2      |
| Training burden                         | Three Active standards + Baseline face document — manageable           |

---

## Residual adoption debt (non-blocking)

| Item                                                       | Nature      | Blocks enterprise adoption?                                        |
| ---------------------------------------------------------- | ----------- | ------------------------------------------------------------------ |
| APZQEP citation updates to Baseline 1.2 / ES-IDs           | Maintenance | NO                                                                 |
| Stale “when Active” phrasing in ES-001/ES-003 prose        | Editorial   | NO                                                                 |
| Product frameworks not yet written for non-APZQEP products | Expected    | NO — Baseline is ready; products adopt when they start engineering |

---

## Conclusion

**PASS** — Products can adopt Baseline 1.2 without ambiguity. APZQEP has the lightest lift (conformance citations). Other products should adopt at first engineering authorisation.
