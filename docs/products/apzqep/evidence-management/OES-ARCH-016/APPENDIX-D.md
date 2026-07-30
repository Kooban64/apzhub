# APZQEP-OES-ARCH-016 — APPENDIX D — ADRs, Risks, Assumptions & Traceability

## ADRs proposed under ARCH-016

| ADR                                                                                | Title                                              | Status   |
| ---------------------------------------------------------------------------------- | -------------------------------------------------- | -------- |
| [ADR-0087](../../../../adr/ADR-0087-evidence-management-platform-sor.md)           | Evidence Management as Platform Evidence SoR       | Proposed |
| [ADR-0088](../../../../adr/ADR-0088-evidence-storage-abstraction.md)               | Evidence Storage Abstraction (Metadata vs Content) | Proposed |
| [ADR-0089](../../../../adr/ADR-0089-evidence-default-deny-access.md)               | Default-Deny Evidence Access (extends L-02)        | Proposed |
| [ADR-0090](../../../../adr/ADR-0090-evidence-sealing-and-sets.md)                  | Evidence Sealing and EvidenceSet                   | Proposed |
| [ADR-0091](../../../../adr/ADR-0091-evidence-collection-and-consumer-reference.md) | Collections vs Sets; Consumer EvidenceReference    | Proposed |

Related accepted: [ADR-0080](../../../../adr/ADR-0080-test-execution-evidence-boundary.md), [ADR-0083](../../../../adr/ADR-0083-test-execution-available-actions.md).

## Risks & assumptions

See PART-05 §5–§6.

## Traceability matrix

| Owner directive theme        | Architecture artefact                |
| ---------------------------- | ------------------------------------ |
| Evidence as SoR              | PART-01 §3; PART-03 §2; ADR-0087     |
| Domain concepts list         | PART-02 §2                           |
| Lifecycle Creation→Disposal  | PART-03 §1; APPENDIX-B               |
| Integrity / custody          | PART-03 §3; ADR-0090                 |
| Security / L-02 alignment    | PART-04 §2; ADR-0089                 |
| Storage abstraction          | PART-04 §3; ADR-0088                 |
| Relationships                | PART-02 §3.4; PART-04 §4; APPENDIX-C |
| Workbench vision             | PART-05 §1                           |
| External interfaces          | PART-04 §5; APPENDIX-C               |
| NFRs                         | PART-05 §4                           |
| No engineering               | COMPLETE STOP; Completion Report     |
| No Lifecycle Standard change | PART-01; A-07                        |
| Stop at Owner gate           | OWNER-ACCEPTANCE pending             |

## Deferred to Eng Spec

1. Exact state enum names and OpenAPI
2. Physical schema / migrations
3. Storage technology selection
4. Hash algorithm choice
5. ACL grant schema details
6. TE EvidenceAccessPort delegation cutover plan (engineering programme)
