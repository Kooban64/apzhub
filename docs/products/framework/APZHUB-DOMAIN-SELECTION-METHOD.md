# APZHUB — Domain Selection Method

| Field        | Value                                                          |
| ------------ | -------------------------------------------------------------- |
| Programme    | **APZHUB-DOMAIN-SELECTION-001**                                |
| Status       | **IN FORCE**                                                   |
| Timestamp    | 20260806T024000Z                                               |
| Kind         | Portfolio governance — how to choose the next domain           |
| Engineering  | **NONE**                                                       |
| Prerequisite | Domain Strategy **IN FORCE** · Portfolio Baseline **COMPLETE** |

## Purpose

Establish a repeatable method for deciding **which business domain** is built next.

Not by preference.  
Not by engineering interest.  
By **business value**.

Every new domain is a **strategic investment**, not a portfolio completion exercise.

## Governing decision

> **The Portfolio Baseline is complete. Future investment shall begin with deliberate domain selection rather than sequential product expansion. Each new domain must demonstrate measurable enterprise value before authorisation.**

Board record: [../apzhub-domain-selection-001/PRODUCT-BOARD-DOMAIN-SELECTION.md](../apzhub-domain-selection-001/PRODUCT-BOARD-DOMAIN-SELECTION.md)

---

## Selection gate (mandatory)

Before any domain Mission is authorised:

```text
1. Domain exists in Domain Strategy / Catalogue
2. Product Board scores the domain on the Evaluation Matrix
3. Scores + rationale recorded
4. Owner Authorisation names the selected domain
5. Only then: Mission pack → Native Adoption under APZQEP
```

Skipping the matrix is a governance defect.

Lane posture:

| Lane   | Posture                                                                                                                                                                             |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lane 1 | **FROZEN** (evidence-driven exceptions only)                                                                                                                                        |
| Lane 2 | **READY** — may open **after** a scored domain selection · first evaluation: [../apzhub-domain-evaluation-001/](../apzhub-domain-evaluation-001/) (Knowledge — recommendation only) |

---

## Product Board Evaluation Matrix

Score each criterion **1–5** (1 = weak, 5 = strong).  
Weighted score = Σ (score × weight). Maximum = **5.00**.

| Criterion                          | Weight | Question                                                                                                         |
| ---------------------------------- | -----: | ---------------------------------------------------------------------------------------------------------------- |
| **Business Value**                 |    25% | Does this materially improve APZOR's operations or offerings?                                                    |
| **Cross-Domain Benefit**           |    20% | Will multiple existing domains benefit?                                                                          |
| **Operational Readiness**          |    15% | Do the Productivity Core and Governance Layer already support it?                                                |
| **Strategic Importance**           |    15% | Is this part of the company's long-term direction?                                                               |
| **Delivery Complexity**            |    10% | Can it be delivered without disproportionate effort? _(higher score = more deliverable / less disproportionate)_ |
| **Regulatory / Governance Impact** |    10% | Does it strengthen compliance or operational governance?                                                         |
| **Adoption Potential**             |     5% | Will people use it frequently?                                                                                   |

### Scoring notes

1. Record numeric scores **and** a short rationale per criterion.
2. Compare candidates in the same Board session when possible.
3. Highest weighted score is **not automatic authorisation** — Board may override with recorded reason.
4. Delivery Complexity: score **high** when effort is proportionate; score **low** when scope/integration risk is disproportionate.
5. Do not invent new criteria mid-cycle without amending this method.

Template: [../apzhub-domain-selection-001/EVALUATION-SCORECARD.md](../apzhub-domain-selection-001/EVALUATION-SCORECARD.md)

---

## After selection

```text
Selected domain (scored)
        →
Owner Authorisation for Mission
        →
PRODUCT-000 Mission pack
        →
Owner Approval
        →
Native Adoption (N-01…N-04)
        →
Optional RI · update Domain Catalogue / Product Catalogue / RI map
```

Domain Selection Method does **not** replace Mission or Native Adoption. It precedes them.

---

## Relationship to other artefacts

| Artefact                    | Role                                   |
| --------------------------- | -------------------------------------- |
| Portfolio Baseline          | What exists today                      |
| Domain Strategy             | Which domains may exist over 3–5 years |
| **Domain Selection Method** | **Which domain to open next**          |
| Mission / Native Adoption   | How the product is defined and adopted |
| APZQEP                      | How changes are quality-governed       |

---

## Anti-patterns

- Opening a domain because “we have capacity”
- Sequential expansion down a product list
- Engineering preference overriding scored business value
- Starting Finance (or any heavy domain) without matrix evidence
- Treating advisory candidate order as mandatory authorisation
