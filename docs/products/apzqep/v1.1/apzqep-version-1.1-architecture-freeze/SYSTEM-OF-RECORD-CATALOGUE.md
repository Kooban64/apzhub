# System of Record Catalogue — APZQEP Version 1.1

## Authoritative business / platform SoRs

| Artefact                           | Owner slice | Notes                                 |
| ---------------------------------- | ----------- | ------------------------------------- |
| Quality Flow Definition / Instance | QO-004      | Lifecycle SoR                         |
| Impact Graph                       | QO-005      | Correlation SoR                       |
| Policy / Selection Decision        | QO-006      | Selection SoR                         |
| Governance Decision                | QO-007      | Gate composition SoR                  |
| Approval Bundle                    | QO-008      | Human authority SoR                   |
| Decision Package                   | QO-009      | Platform conclusion SoR               |
| Event Envelope / History           | QO-010      | Transport facts (immutable)           |
| Automation Coordination Package    | QO-011      | Coordination SoR (`execution: false`) |
| Source Change Package              | QO-012      | Identity SoR (no SCM)                 |
| Evidence Integration Package       | QO-014      | Integration SoR (refs only)           |
| Operational Readiness Package      | QO-016      | Ops readiness SoR (descriptive)       |
| Workspace Experience Package       | QO-017      | Composition SoR (no business state)   |

## Advisory / projection SoRs (not decision authorities)

| Artefact                                | Owner slice | Notes                                   |
| --------------------------------------- | ----------- | --------------------------------------- |
| Quality Intelligence Enrichment Package | QO-013      | Advisory only; never corrective         |
| Report Views (derived)                  | QO-014      | Consume evidence; never become evidence |
| Executive Experience Package            | QO-015      | Projection only; never presentation     |

## Certification artefacts (not business SoRs)

| Artefact                                | Owner     | Notes                     |
| --------------------------------------- | --------- | ------------------------- |
| Enterprise Release Certification Report | QO-018    | Conformance certification |
| Version 1.1 Architecture Freeze pack    | This pack | Baseline freeze record    |

Wave 1–4 engines retain ownership of their own business SoRs (automation runs,
SCM artefacts, QI signals, dashboards) behind provider-neutral platform services.
