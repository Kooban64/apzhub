# APZQEP-OES-ARCH-014 — APPENDIX A — Glossary

| Term                          | Definition                                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Test Plan**                 | Governed aggregate representing an executable collection of Test Specifications for a scoped validation activity (ARCH-013)    |
| **Plan Item**                 | Membership of a Specification (reference + version pin) within a Plan                                                          |
| **Plan Scope / Plan Type**    | Catalogue class describing planning context (Release, Product, Feature, Milestone, Sprint, Regression, Certification, Custom)  |
| **Plan Status**               | Lifecycle state of the Plan aggregate (ENG-060A `PlanStatus`)                                                                  |
| **`availableActions`**        | Server-computed permitted actions for the current principal on a given Plan; the sole authority for Workbench action rendering |
| **Explorer**                  | List-first inventory surface for Test Plans                                                                                    |
| **Review queue**              | Filtered navigation surface for Plans in `review`                                                                              |
| **Plan Inspector**            | Primary detail surface for a single selected Plan                                                                              |
| **Edit Draft Form**           | Mutable editing surface for `draft` / `rejected` Plans                                                                         |
| **Governed unavailable slot** | A labelled UI area for a feature not yet delivered (e.g. Compare) that shows an honest message rather than fabricated data     |
| **L-01**                      | Recorded Infrastructure limitation: version comparison (`CompareVersions` / `GET .../compare`) deferred                        |
| **L-02**                      | Recorded Infrastructure limitation: no dedicated `GET .../items`; items ship on the Plan DTO                                   |
| **Test Specification**        | Certified capability (1.0.0 FROZEN) — design blueprint; referenced by Plan Items                                               |
| **Test Execution / Run**      | Future capabilities — own run results; reference Plans                                                                         |
| **PRWL**                      | `PRODUCTION_READY_WITH_LIMITATIONS` certification classification                                                               |
| **ARCH-014**                  | This Workbench Architecture programme                                                                                          |
| **OES-ARCH-014**              | This Owner Engineering Specification pack                                                                                      |
| **ENG-060C** _(placeholder)_  | Anticipated future Workbench Engineering programme identifier — not authorised by this pack                                    |
