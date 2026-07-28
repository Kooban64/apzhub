# Architecture Overview — APZQEP-ARCH-010

> Companion extract. Authoritative detail: [VERIFICATION-WORKBENCH-ARCHITECTURE.md](./VERIFICATION-WORKBENCH-ARCHITECTURE.md).

## Capability statement

The Verification Workbench is the primary APZ QEP user experience for planning, assigning, executing, and governing **Verification Records**. It extends the accepted Workbench grammar ([ARCH-006](../requirements-workbench/README.md)) without redesigning the Platform shell.

## Layered view

```text
Platform Desktop Shell (005 / 016–023)
  → QEP Verification module workspace (ARCH-010)
      → Explorer · Queues · Dashboard · Inspector · Timeline · History · Decision · Assignment · Search
          → APZHUB API Gateway
              → Verification Platform Service (ENG-040B)
                  → Verification SoR · history · availableActions · search projection
```

## Key separations

| Separation | Rule |
| ---------- | ---- |
| ARCH-006 vs ARCH-010 | Grammar reused; Verification specialises content |
| Queues vs domain rules | Queues are presentation filters only |
| Status vs Outcome | Distinct UX dimensions |
| SoR vs future analysis | Evidence / Execution / Certification / Coverage / Impact are slots |
| UI vs domain | Client never invents lifecycle or permissions |

## Downstream gate

Architecture only. Workbench engineering requires Owner Acceptance of ARCH-010 **and** a separate Owner Engineering Programme Instruction.
