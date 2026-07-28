# Known Limitations Review — APZQEP-CERT-060B

| Field | Value |
| ----- | ----- |
| Programme | APZQEP-CERT-060B |
| Source | ENG-060B Owner Acceptance · [../infrastructure/KNOWN-LIMITATIONS.md](../infrastructure/KNOWN-LIMITATIONS.md) |
| Result | Limitations **do not block** Infrastructure Component production classification with limitations |

## Assessment

| ID | Topic | Owner disposition (ENG-060B) | CERT impact on production readiness |
| -- | ----- | ---------------------------- | ----------------------------------- |
| C-01 / L-01 | Version compare deferred | Deferred capability | **Scope limitation** — does not impair core persist/command/REST/authz path |
| C-02 / L-02 | Dedicated GET items absent | Approved variance | **Scope/API shape** — items available on plan GET; not a correctness defect |
| C-03 | Discrete action POSTs | Accepted (closed) | **None** — not an open limitation |
| C-04 / L-03 | Coverage below objective | Justification accepted | **Quality-objective residual** — behavioural completeness demonstrated; adapters/stubs |

## Determination

| Question | Answer |
| -------- | ------ |
| Do limitations invalidate Infrastructure correctness? | **No** |
| Do they define current component scope? | **Yes** |
| Appropriate class | **INFRASTRUCTURE_PRODUCTION_READY_WITH_LIMITATIONS** |
| Require remediation before CERT? | **No** (Owner already accepted; CERT evaluates as delivered) |

## Explicit non-limitations (correct)

Workbench · Domain changes · soft-delete/unarchive · Capability Freeze · SemVer 1.0.0
