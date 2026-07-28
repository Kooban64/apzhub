# Architecture Overview — APZQEP-ARCH-007

> Companion extract. Authoritative detail: [TRACEABILITY-ARCHITECTURE.md](./TRACEABILITY-ARCHITECTURE.md).

## Capability statement

Traceability connects APZ QEP engineering artefacts through **governed Trace Links**, enabling lineage, coverage, and impact analysis without owning Requirements, Verification, Evidence, or Certification Systems of Record.

## Layered view

```text
Workbench (ARCH-006 grammar)
    → Traceability Platform Service (future)
        → Trace SoR (Trace Links)
        → Projections (coverage, impact) — derived
    ← consumes →
Requirements / Verification / Execution / Evidence / Certification / Documents SoRs
```

## Key separations

| Separation | Rule |
| ---------- | ---- |
| Semantic Relationships vs Trace Links | Requirements owns the former; Traceability owns the latter |
| SoR vs analysis | Coverage/impact are derived |
| Domains vs Traceability | Domains own artefacts; Traceability owns links and analysis contracts |

## Downstream gate

Architecture only. Engineering requires Owner Acceptance + Engineering Instruction.
