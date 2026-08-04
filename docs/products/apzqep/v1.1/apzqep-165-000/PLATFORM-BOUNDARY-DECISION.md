# PLATFORM-BOUNDARY-DECISION — APZQEP-165-000

| Field     | Value                      |
| --------- | -------------------------- |
| Programme | APZQEP-165-000             |
| Timestamp | 20260804T054651Z           |
| Decision  | **ADOPTED (architecture)** |

## Decision

Wave 5 introduces a **thin reusable coordination package**:

```text
@apzhub/platform-orchestration
```

plus APZQEP **composition** (Platform Services + optional thin `qep-*` module/views) that configures Quality Flows for the quality product.

Workflow / orchestration **business rules** belong in Platform Services backed by the orchestration package — **not** in UI, widgets, or ad-hoc scripts.

## Alternatives considered

| Option                                                                | Verdict             | Why                                                                               |
| --------------------------------------------------------------------- | ------------------- | --------------------------------------------------------------------------------- |
| A. Reusable `@apzhub/platform-orchestration` + APZQEP composition     | **SELECTED**        | Matches Waves 1–4 package pattern; reusable; capability-registration future-proof |
| B. APZQEP-only module/service with no reusable package                | Rejected as primary | Blocks other APZHUB products; encourages product-local orchestration forks        |
| C. Workflow definitions only in product YAML with no platform package | Rejected            | Insufficient shared engine, audit, registry, state machine                        |
| D. Absorb logic into Dashboard / Experience package                   | **REJECTED**        | Presentation must not own GO or workflow rules                                    |
| E. `@apzhub/platform-experience` mega-package                         | **REJECTED**        | Dumping ground; violates prior Board guidance                                     |

## Layer mapping (008 / 009 / 025 / 026 / 027)

| Concern                                        | Layer                                                 |
| ---------------------------------------------- | ----------------------------------------------------- |
| Orchestration contracts, registry, flow engine | Platform package + Platform Services                  |
| Capability execution                           | Existing capability platforms / connectors            |
| APZQEP Quality Flow UX                         | Module (presentation)                                 |
| SCM/Automation/QI providers                    | Integration/provider registries (unchanged ownership) |

## Explicit rejections

- Workflow business rules in dashboards
- Module → connector direct calls
- Authoritative duplication of Evidence / QI / Automation SoR
- Orchestration executing tests or scoring quality

## Certification question

```text
Can additional APZHUB products reuse @apzhub/platform-orchestration
without inheriting APZQEP business logic?

Required answer: YES
```

Answered **YES** by construction: products register their own capabilities and flows.
