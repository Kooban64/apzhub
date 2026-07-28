# Architecture Overview — APZQEP-ARCH-009

> Companion extract. Authoritative detail: [VERIFICATION-ARCHITECTURE.md](./VERIFICATION-ARCHITECTURE.md).

## Capability statement

Verification records and governs whether an artefact or requirement has been verified — including authority, outcome, context, and history. It is the System of Record for **Verification Records**, not for Requirements, Trace Links, Tests, Evidence, or Certification.

## Layered view

```text
Workbench (ARCH-006 grammar — future)
    → Verification Platform Service (future)
        → Verification SoR (Records / Decisions / History)
    ← references →
Requirements 1.0.0 · Traceability 1.0.0 · future Test / Execution / Evidence / Certification
```

## Key separations

| Separation                  | Rule                                        |
| --------------------------- | ------------------------------------------- |
| Status vs Outcome           | Lifecycle ≠ conclusion                      |
| Execution vs Verification   | Runs are inputs; decisions are Verification |
| Trace Links vs Verification | Traceability links; Verification decides    |
| SoR vs analysis             | Coverage/Impact remain derived elsewhere    |

## Downstream gate

Architecture only. Engineering requires Owner Acceptance + Engineering Instruction.
