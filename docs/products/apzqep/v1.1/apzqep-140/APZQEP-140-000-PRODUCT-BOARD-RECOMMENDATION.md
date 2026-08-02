# APZQEP-140-000 — Product Board Recommendation

| Field        | Value                                                                |
| ------------ | -------------------------------------------------------------------- |
| Programme    | APZQEP-140                                                           |
| Phase        | **000**                                                              |
| Title        | Core Quality Engineering Architecture                                |
| Status       | **RECOMMENDED FOR AUTHORISATION** — not yet authorised               |
| Prerequisite | APZQEP-120 Product Board **CERTIFIED / PROGRAMME COMPLETE / CLOSED** |
| Framing      | Lightweight Product Capability Architecture (not Suite coding)       |
| Timestamp    | 20260802T163026Z                                                     |

---

## Why 000 before S14

APZQEP-140 should begin with architecture, not Suite Management implementation.

The architecture SHALL define enough structure for user-facing capabilities to fit together cleanly — without delaying delivery unnecessarily.

## Scope of 000

| Topic                 | Intent                                  |
| --------------------- | --------------------------------------- |
| Capability boundaries | Streams A–D ownership and interfaces    |
| Domain ownership      | SoR per capability                      |
| APIs                  | Platform Gateway contracts (sketch)     |
| Events                | Domain event catalogue additions        |
| UI modules            | Workbench module boundaries             |
| Data ownership        | Platform vs engine vs projection        |
| Integration points    | QKI, Notifications, Commands, Evidence  |
| Roadmap sequencing    | S14–S19 (or revised) after architecture |

## Out of scope for 000

- Suite / Case / Run / Execution / Defect implementation
- Frontend product UIs beyond IA sketches
- AI / QI / Executive Experience rebuilds
- Governance or platform package redesign

## Capability streams (Board)

```text
A Test Management   → Suites, Cases, Parameters, Libraries
B Execution         → Runs, Execution, Results, Evidence
C Quality           → Defects, Traceability, Coverage, Risk
D Reporting         → Dashboards, Analytics, Executive Reporting
```

## Authority

APZQEP-140-000 requires a formal **Owner Authorisation Pack** before architecture engineering starts.

After 000 approval, implementation slices (S14+) proceed under per-slice Owner authority.
