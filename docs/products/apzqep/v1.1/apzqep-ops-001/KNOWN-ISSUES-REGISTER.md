# KNOWN-ISSUES-REGISTER — APZQEP Version 1.0 GA

| Field     | Value                             |
| --------- | --------------------------------- |
| Programme | APZQEP-OPS-001                    |
| Timestamp | 20260803T072224Z                  |
| Rule      | Observation only — no engineering |

## Accepted residuals (Board — not release blockers)

| ID     | Class                    | Description                                                    | Status                                                                                        |
| ------ | ------------------------ | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| KI-001 | Enhancement / UX         | Shell Cap navigation may show Cap routes until API 403         | **CLOSED** — QX-P1-01 Cap nav permission filter evidenced (20260808T054600Z)                  |
| KI-002 | Architecture Observation | Project membership attribute ACL refinement deferred           | **DEFERRED → V1.2** — QX-P1-05 disposition (20260808T054600Z); Cap RBAC remains V1.1 boundary |
| KI-003 | Packaging                | Cap A–F packages remain 0.1.0 until promotion execution        | **CLOSED** — QX-PR-06 promoted Caps A–F to 1.0.0 (20260807T213600Z)                           |
| KI-004 | Documentation            | Historical APZQEP-150 artefacts retain immutable NO-GO wording | Accepted residual                                                                             |
| KI-005 | Future Capability        | Cap-specific accessibility coverage to evolve                  | Accepted residual                                                                             |

## Technical debt register (observation)

| ID     | Description                              | Evidence                       | Status                         |
| ------ | ---------------------------------------- | ------------------------------ | ------------------------------ |
| TD-001 | Cap shell permission-aware nav filtering | APZQEP-152 / 150R residuals    | **CLOSED** — QX-P1-01          |
| TD-002 | Project-scoped attribute ACL             | Board architectural refinement | **DEFERRED → V1.2** — QX-P1-05 |

## Open production defects

| ID  | Summary                       | Status |
| --- | ----------------------------- | ------ |
| —   | None recorded at OPS-001 open | —      |

New items enter via feedback or incident process. Reclassification of residuals as release blockers requires Product Board review.
