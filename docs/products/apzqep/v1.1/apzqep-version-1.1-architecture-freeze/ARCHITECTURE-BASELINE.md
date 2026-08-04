# Architecture Baseline — APZQEP Version 1.1

Frozen pipeline (immutable):

```text
External Change → Trigger → Quality Flow → Impact → Policy → Governance
  → Approval → Decision → Event Backbone
       ├─ Automation Coordination
       └─ Source Change Coordination
            → QI Enrichment (advisory)
            → Evidence Integration
            → Executive Experience (projection)
            → Operational Platform (descriptive)
            → Workspace Experience (composition)
```

| Wave | Programme  | Role                                | Status    |
| ---- | ---------- | ----------------------------------- | --------- |
| 1    | APZQEP-161 | Enterprise Automation Foundation    | CERTIFIED |
| 2    | APZQEP-162 | Source Control Integration Platform | CERTIFIED |
| 3    | APZQEP-163 | Quality Intelligence Platform       | CERTIFIED |
| 4    | APZQEP-164 | Dashboard & Quality Experience      | CERTIFIED |
| 5    | APZQEP-165 | Continuous Quality Orchestration    | CERTIFIED |

## Standing boundaries (frozen)

- One responsibility per slice / capability
- Modules never call connectors or backends directly (platform services / orchestration)
- Event Backbone is the only cross-capability publication path for Wave 5 facts
- References only — no duplication of authoritative content
- Advisory never overrides authoritative
- Presentation / projection / composition never own business state
- Operational readiness is descriptive, never prescriptive

Authoritative architecture sources remain: APZQEP-165-000, PBR-APZQEP-165-000,
and Wave 1–4 architecture / PBR packs.
