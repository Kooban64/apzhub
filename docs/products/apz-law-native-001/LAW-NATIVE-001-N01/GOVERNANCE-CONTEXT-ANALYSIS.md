# Governance Context Analysis — APZ-LAW-NATIVE-001-N01

| Field     | Value                                     |
| --------- | ----------------------------------------- |
| Slice     | N-01                                      |
| Status    | **COMPLETE**                              |
| Timestamp | 20260805T191100Z                          |
| Board     | Governance Context Principle **IN FORCE** |

## Principle under test

> **Governance should appear where work is performed, not only inside the Law product.**

## Expected consume-by-reference model

| Work surface  | Expected governance signal (by reference) |
| ------------- | ----------------------------------------- |
| APZ Projects  | Applicable policies / project obligations |
| APZ Workflow  | Required approvals / obligation gates     |
| APZ Support   | Regulatory / service obligations          |
| APZ Documents | Retention requirements                    |
| APZQEP        | Compliance evidence linkage               |
| APZ Analytics | Governance trends (observe, not own)      |

Law owns the lifecycle. Other products **reference** Law — they do not become Law.

## Observed state (runtime)

| Check                                                          | Result                                                       | Evidence                                                     |
| -------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Law → Projects / Workflow / Support / Analytics / APZQEP links | **Absent**                                                   | No CTAs or nav in `apps/law-platform`                        |
| Law → Documents (APZ Documents product)                        | **Absent** as peer product; Law has its own Documents module | `legal-documents` manifest + document register UI            |
| Documents → Law                                                | Partial reverse only                                         | `apps/web/lib/documents/work-context.ts` matter → “Open Law” |
| Obligations attach to work contexts                            | **Absent**                                                   | No obligation entities in Law UI                             |
| Governance visible in Productivity Core chrome                 | **Absent**                                                   | Isolated `/workspace/law` practice surface                   |

## Result

**GAPS IDENTIFIED** — Law is an **isolated legal-practice workspace**. Governance Context Principle is **not** expressed in product experience.

| Gap   | Feeds                                                                                   |
| ----- | --------------------------------------------------------------------------------------- |
| L-G05 | N-03+ (context surfaces; may need cross-product contracts later — not N-01 engineering) |

## Note for later slices

N-02 identity work must not treat “more Law admin screens” as progress. N-03 must plan for **context appearance** in other products without collapsing SoRs — analysis only here.
