# APZHUB-ENG-002 — Programme Charter

| Field          | Value                                        |
| -------------- | -------------------------------------------- |
| Programme      | APZHUB-ENG-002                               |
| Title          | Portfolio Engineering Standards              |
| Phase          | 0 — Portfolio Engineering Charter            |
| Classification | Enterprise Engineering Governance            |
| Status         | **AUTHORISED** (Owner) · Phase 0 in delivery |
| Engineering    | NONE                                         |
| Repository     | Documentation only                           |

---

## 1. Programme purpose

Establish the governance and, in later phases, publish portfolio engineering standards promoted from proven product practice—initially from APZQEP as reference implementation.

Phase 0 establishes **governance only**.

---

## 2. Owner authorisation (Phase 0)

```text
Status: AUTHORISED
Engineering: NONE
Package / Release / Deployment / Infrastructure / Architecture / Product changes: NONE
```

---

## 3. Authoritative baselines (immutable)

| Baseline                                    | Treatment                             |
| ------------------------------------------- | ------------------------------------- |
| APZHUB Foundation                           | Immutable except maintenance          |
| APZHUB Governance                           | Immutable except maintenance          |
| APZHUB Engineering Operating Standard       | Immutable except maintenance          |
| APZHUB Engineering Slice Standard (ENG-001) | Frozen (ADR-0092)                     |
| APZQEP Release Governance                   | Closed / reference                    |
| APZQEP Engineering Framework v1.0           | Reference implementation              |
| APZQEP-ENG-001                              | **ARCHIVED** · IMMUTABLE · `b9626ada` |

APZQEP-ENG-001 SHALL NOT be reopened. Its Framework SHALL NOT automatically become the APZHUB enterprise standard.

---

## 4. Phase 0 objective

Produce and submit for Product Board Certification the **Portfolio Engineering Charter** and supporting governance satellites.

---

## 5. Phase 0 out of scope

Phase 0 SHALL NOT:

- promote standards
- rewrite APZQEP
- modify existing APZHUB Engineering Standards content beyond indexing/citation
- change product Engineering Frameworks
- author API / Testing / Certification standards as enterprise law
- modify repositories outside documentation
- author engineering slices

---

## 6. Phase boundary

| Phase  | Concern                                                                    |
| ------ | -------------------------------------------------------------------------- |
| **0**  | Governance definition                                                      |
| **1+** | Standards promotion / publication (NOT AUTHORISED until Charter CERTIFIED) |

---

## 7. Governing charter

[PORTFOLIO-ENGINEERING-CHARTER.md](./PORTFOLIO-ENGINEERING-CHARTER.md)

---

## 8. Success / exit

See [SUCCESS-CRITERIA.md](./SUCCESS-CRITERIA.md). Exit = Product Board Certification of the Portfolio Engineering Charter.
