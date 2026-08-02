# APZHUB Portfolio Engineering — Standard Lifecycle

| Field     | Value                                                                  |
| --------- | ---------------------------------------------------------------------- |
| Document  | PORTFOLIO-LIFECYCLE                                                    |
| Programme | APZHUB-ENG-002                                                         |
| Phase     | 0                                                                      |
| Status    | DRAFT — with Charter                                                   |
| Parent    | [PORTFOLIO-ENGINEERING-CHARTER.md](./PORTFOLIO-ENGINEERING-CHARTER.md) |

---

## 1. Lifecycle states

| State          | Meaning                                                                                 | Consumable as mandatory enterprise law? |
| -------------- | --------------------------------------------------------------------------------------- | --------------------------------------- |
| **Draft**      | Under authorship                                                                        | NO                                      |
| **Review**     | Submitted for Architecture / Engineering / QA / Board review                            | NO                                      |
| **Approved**   | Board accepted; not yet effective date (if staged)                                      | NO until Active                         |
| **Active**     | In force for the portfolio                                                              | YES                                     |
| **Superseded** | Replaced by a newer Active version; prior version cited only for historical conformance | NO for new work                         |
| **Retired**    | No longer recommended; migration path required                                          | NO                                      |
| **Archived**   | Historical record only                                                                  | NO                                      |

---

## 2. Transitions

| From                        | To                                                            | Authority |
| --------------------------- | ------------------------------------------------------------- | --------- |
| Draft → Review              | Engineering lead / programme Owner instruction                |           |
| Review → Approved           | Product Board                                                 |           |
| Approved → Active           | Product Board (or scheduled effective date in Board decision) |           |
| Active → Superseded         | Product Board on adoption of successor version                |           |
| Active/Superseded → Retired | Product Board                                                 |           |
| Retired → Archived          | Product Board                                                 |           |

---

## 3. Versioning rules

1. First Active release of a standard is **v1.0**.
2. Normative change ⇒ bump version (at least minor; major for breaking obligations).
3. Editorial-only fixes MAY keep version if meaning unchanged; prefer changelog note.
4. Supersession MUST name the successor version.
5. Products MUST update citations within a Board-defined adoption window when major versions break prior citations.

---

## 4. Deprecation

Deprecation SHALL state:

- reason;
- successor (if any);
- last date for new citations of the old version;
- residual obligations for in-flight slices.

---

## 5. Programme vs standard lifecycle

APZHUB-ENG-002 phases deliver standards into Draft/Review/Approved/Active.  
Individual standards continue under this lifecycle after the programme phase that created them closes.
