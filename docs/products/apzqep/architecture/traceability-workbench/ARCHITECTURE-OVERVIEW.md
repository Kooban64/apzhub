# Architecture Overview — APZQEP-ARCH-008

> Companion extract. Authoritative detail: [TRACEABILITY-WORKBENCH-ARCHITECTURE.md](./TRACEABILITY-WORKBENCH-ARCHITECTURE.md).

## Capability statement

The Traceability Workbench is the primary APZ QEP user experience for creating, exploring, analysing (presentation), and governing **Trace Links**. It extends the accepted Workbench grammar ([ARCH-006](../requirements-workbench/README.md)) without redesigning the Platform shell.

## Layered view

```text
Platform Desktop Shell (005 / 016–023)
  → QEP Traceability module workspace (ARCH-008)
      → Trace Explorer · Matrix · Editor · Inspector · History · Search · Analysis slots
          → APZHUB API Gateway
              → Traceability Platform Service (ENG-030A Part 2)
                  → Trace Link SoR · history · taxonomy · search projection
```

## Key separations

| Separation | Rule |
| ---------- | ---- |
| ARCH-006 vs ARCH-008 | Grammar reused; Traceability specialises content |
| Trace Links vs Requirements Relationships | Distinct UX and permissions |
| SoR vs analysis | Coverage / Impact are future projections |
| UI vs domain | Client never invents lifecycle or authority |

## Downstream gate

Architecture only. Workbench engineering requires Owner Acceptance of ARCH-008 **and** a separate Owner Engineering Programme Instruction.
