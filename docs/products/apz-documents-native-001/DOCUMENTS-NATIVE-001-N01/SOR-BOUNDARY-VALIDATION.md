# System of Record Boundary Validation — APZ-DOCUMENTS-NATIVE-001-N01

| Field     | Value                                                                            |
| --------- | -------------------------------------------------------------------------------- |
| Slice     | N-01                                                                             |
| Status    | **COMPLETE**                                                                     |
| Timestamp | 20260805T141500Z                                                                 |
| Result    | **PASS**                                                                         |
| Mission   | [../../apzdocuments/SYSTEM-OF-RECORD.md](../../apzdocuments/SYSTEM-OF-RECORD.md) |

## Ownership checks

| Datum                         | Expected SoR  | Observed in Documents product                         | Result |
| ----------------------------- | ------------- | ----------------------------------------------------- | ------ |
| Document lifecycle & metadata | APZ Documents | Document entities via `/api/v1/documents`             | **OK** |
| Project metadata              | APZ Projects  | Not stored as Documents SoR fields                    | **OK** |
| Ticket metadata               | APZ Support   | Not stored as Documents SoR fields                    | **OK** |
| Time / utilisation            | APZ Time      | Not stored as Documents SoR fields                    | **OK** |
| Quality evidence metadata     | APZQEP        | Not absorbed into Documents SoR                       | **OK** |
| Cross-product linkage         | By reference  | `DocumentReference` / relationship kinds in contracts | **OK** |

## Relationship model (contracts)

Domain supports kinds such as `belongs_to_project`, `belongs_to_support`, `attached_to`, `evidence_for`, with `reference: { product, externalId, label? }` — **by reference**, preserving SoR discipline.

## Notes (not SoR failures)

| Note                                                                                        | Classification                                                                 |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Consumer products do not yet **wire** references in UX                                      | Attach-to-work gap (G-15–G-17), not SoR duplication                            |
| Client relate input omits `reference` vs richer HTTP/domain                                 | Contract/UX readiness gap (G-22) — risk of future misuse if filled incorrectly |
| No evidence that Projects/Support business state is duplicated into Documents tables for UI | Compliant                                                                      |

## Verdict

**PASS** — Documents owns document lifecycle and document metadata; foreign business SoRs are not duplicated in the Documents plane. Relationships are designed as references.

No solutions implemented in this slice.
