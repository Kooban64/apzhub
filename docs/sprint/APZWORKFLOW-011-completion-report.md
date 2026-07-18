# APZWORKFLOW-011 Completion Report

**Milestone:** APZWORKFLOW-011 — Workflow Engine Wave Certification & Reference Adapter Closeout  
**Status:** COMPLETE  
**Date:** 2026-07-16  
**Classification:** **PRODUCTION_READY_WITH_LIMITATIONS** (retained; wave frozen)  
**Next:** **APZWORKFLOW-012 — Future Workflow Engine Adapters (Camunda, Temporal, Flowable, etc.)** (**roadmap only — await owner approval — do not start**)

---

## Executive Summary

Formally closed the Workflow Engine programme wave. Declared **`@apzhub/integration-n8n`** the official APZHUB Workflow Engine Reference Adapter. Froze Platform + Engine architectures, Gateway/HTTP/Typed Client/Workbench/Integration patterns. Re-validated SoR (001–005) and Engine (006–010) audits via `pnpm audit:workflow-engine-wave`. **No new functionality.** Classification remains **PRODUCTION_READY_WITH_LIMITATIONS**.

## Wave Summary

| Track               | Outcome                                                |
| ------------------- | ------------------------------------------------------ |
| APZWORKFLOW-001…005 | Workflow Platform SoR certified & frozen               |
| APZWORKFLOW-006…010 | n8n Engine vertical certified                          |
| APZWORKFLOW-011     | Wave closeout + Reference Adapter declaration + freeze |

See [Programme Summary](./APZWORKFLOW-011-programme-summary.md) · [Wave Closeout Report](./APZWORKFLOW-011-wave-closeout-report.md).

## Final Architecture

[Final Architecture](../architecture/APZHUB-Workflow-Engine-Final-Architecture.md)

```text
SoR Workbench → Client → HTTP → gateway.workflow.* → Pipeline → Authz → Services → Core → Persistence
Engine Workbench → Client → HTTP → gateway.workflow.engine.* → Pipeline → Authz → Services → SDK → n8n → n8n
```

## Reference Adapter Declaration

**`@apzhub/integration-n8n` is the official APZHUB Workflow Engine Reference Adapter.**  
Future workflow-engine integrations must follow [APZHUB-Workflow-Engine-Reference-Adapter-Standard.md](../architecture/APZHUB-Workflow-Engine-Reference-Adapter-Standard.md).  
Examples (docs only): Camunda, Temporal, Flowable, Zeebe.

## Architecture Freeze

[Architecture Freeze Notice](../architecture/APZHUB-Workflow-Engine-Architecture-Freeze-Notice.md) — contracts, services, Gateway, RequestPipeline, Authz, HTTP, typed clients, Workbenches, Integration SDK pattern, n8n adapter pattern. Changes require ADR + owner approval.

## Quality Evidence

| Gate                                  | Result                                                 |
| ------------------------------------- | ------------------------------------------------------ |
| `pnpm audit:workflow-vertical`        | PASS                                                   |
| `pnpm audit:workflow-engine-vertical` | PASS                                                   |
| `pnpm audit:workflow-engine-wave`     | PASS                                                   |
| OpenAPI validate                      | PASS                                                   |
| Package versions                      | Frozen (n8n 0.1.0 · contracts 0.3.0 · services 0.20.0) |

Details: [Quality Evidence](../reviews/APZWORKFLOW-011-Quality-Evidence.md) · [Wave Certification](../reviews/APZWORKFLOW-011-Wave-Certification.md)

## Production Classification

**PRODUCTION_READY_WITH_LIMITATIONS** — evidence from APZWORKFLOW-005 and APZWORKFLOW-010 retained. Limitations: no execution/scheduling/mutations; read-only adapter; live provider optional; Playwright live env dependent.

## Known Limitations

- Read-only engine metadata only
- Live n8n opt-in
- Definition graphs not fully exposed
- Playwright live LIMITED (external Testing slug conflict)

## Operational Readiness

[Operational Readiness Guide](../guides/APZHUB-Workflow-Engine-Operational-Readiness-Guide.md)

## Documentation Produced

- Wave Closeout Report · Programme Summary · Completion Report
- Reference Adapter Standard · Final Architecture · Architecture Freeze Notice
- Operational Readiness Guide · Future Adapter Development Guide
- Wave Certification · Quality Evidence

## Technical Debt

- Live n8n E2E not required for closeout
- Playwright slug conflict remains platform Testing debt
- SoR audit scripts + harness updated to coexist with engine track (certification defect fixes only: 001/005 version pins & path scoping; workflow-vertical harness versions)

## Future Extension Strategy

New engines under **APZWORKFLOW-012** (roadmap): follow Reference Adapter Standard; manifest-first; Integration SDK; no layer bypass; ADR for deviations.

## Recommendation

**APZWORKFLOW-012 — Future Workflow Engine Adapters (Camunda, Temporal, Flowable, etc.)** only. Do **not** implement until explicit owner approval.

---

**Stop condition met.** Await owner approval before APZWORKFLOW-012 or any additional workflow-engine development.
