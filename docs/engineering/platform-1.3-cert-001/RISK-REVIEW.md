# Risk Review — Platform-1.3-CERT-001

| ID        | Area              | Severity     | Description                                                            |
| --------- | ----------------- | ------------ | ---------------------------------------------------------------------- |
| R-CERT-01 | Quality / Release | **Critical** | Web production build fails — Platform 1.3 web not shippable            |
| R-CERT-02 | Quality / Observe | **High**     | observe-core typecheck fails — ENG-002 surface not type-clean          |
| R-CERT-03 | Compliance        | **High**     | POPIA formal review still required before notification prod enablement |
| R-CERT-04 | Product           | **High**     | Email SoR absent (PL12-KL-07) — expected fence                         |
| R-CERT-05 | Product           | **High**     | Workflow Execute gated (PL12-KL-09) — expected fence                   |
| R-CERT-06 | Operations        | **Medium**   | Notification delivery process-local store (P13-KL-ND-03)               |
| R-CERT-07 | Governance        | **Low**      | Integration SDK certify wording drift; package remains 1.0.0           |
| R-CERT-08 | Quality           | **Low**      | Format drift / stale OpenAPI assertion                                 |

No Critical _security design_ risks newly identified. Release Critical = build/typecheck.
