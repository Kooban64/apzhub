# APZQEP-OES-ENG-070A — APPENDIX A — Glossary

| Term | Definition |
| ---- | ---------- |
| **ENG-070A** *(future)* | Anticipated Workbench Engineering implementation programme — requires a separate Owner Instruction after this OES is Accepted |
| **OES-ENG-070A** | This Owner Engineering Specification — the delivery contract for the future ENG-070A implementation |
| **ARCH-014** | Test Plans Workbench Architecture — **ACCEPTED / ARCHITECTURE BASELINED / CLOSED** — the immutable architectural baseline this OES translates into a delivery contract |
| **WP** | Work package (Part 2) |
| **Architecture baseline** | APZQEP-ARCH-014 Accepted |
| **API baseline** | ENG-060B Accepted / Certified REST (`/api/v1/qep/plans/*`) |
| **`availableActions`** | Server-authored action list on the Plan DTO — the sole authority for Workbench action rendering (Part 3 §4) |
| **Binding invariant** | *"The Workbench SHALL never determine what a user may do"* — Owner directive recorded at ARCH-014 Acceptance |
| **L-01** | Recorded Infrastructure limitation: version comparison (`CompareVersions` / `GET .../compare`) deferred |
| **L-02** | Recorded Infrastructure limitation: no dedicated `GET .../items`; items ship on the Plan DTO |
| **L-03** | Recorded Infrastructure limitation: package line coverage below aspirational OES objective — accepted with justification; not a Workbench concern |
| **Governed unavailable slot** | A labelled UI area for a feature not yet delivered (e.g. Compare) that shows an honest message rather than fabricated data |
| **Plan Explorer** | List-first inventory surface for Test Plans |
| **Review queue** | Filtered navigation surface for Plans in `review` |
| **Plan Inspector** | Primary detail surface for a single selected Plan |
| **Edit Draft Form** | Mutable editing surface for `draft` / `rejected` Plans |
| **Test Specification** | Certified capability (1.0.0 FROZEN) — design blueprint; referenced by Plan Items |
| **PRWL** | `PRODUCTION_READY_WITH_LIMITATIONS` certification classification |

## END OF APPENDIX A
