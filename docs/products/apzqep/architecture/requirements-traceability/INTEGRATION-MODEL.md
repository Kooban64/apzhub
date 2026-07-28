# Integration Model — APZQEP-ARCH-007

> Companion extract. Authoritative detail: [TRACEABILITY-ARCHITECTURE.md](./TRACEABILITY-ARCHITECTURE.md) §14.

## Pattern

```text
Domain SoRs ──events/identities──► Traceability Service
                                      │
                                      ├── Trace Link SoR
                                      └── Coverage / Impact projections
                                      │
Workbench / Search / AI / MCP / Certification ◄── query contracts
```

## Rules

- Modules → Platform Services only (009).
- External ALM imports via Integration adapters with mandatory Trace Type mapping (026).
- Requirements Relationship events drive `projection_only` edges — never editable as Trace mutations of Relationship SoR.
- Search indexes are projections; detail reload from SoR.
