# APZQEP — Test Plans Capability

> **Domain:** **0.1.0 CERTIFIED** (CERT-060A)  
> **Infrastructure ENG:** **ENG-060B ACCEPTED / CLOSED**  
> **Infrastructure CERT:** **APZQEP-CERT-060B** — **CERTIFIED / APPROVED / CLOSED** · **INFRASTRUCTURE_PRODUCTION_READY_WITH_LIMITATIONS**  
> **Package:** `@apzhub/qep-test-plans` **1.0.0 CERTIFIED** (Domain + Infrastructure + Workbench all Component-CERTIFIED, integrated Capability CERTIFIED)  
> **Workbench Architecture:** **APZQEP-ARCH-014** — **ACCEPTED / ARCHITECTURE BASELINED / PROGRAMME CLOSED**  
> **Workbench Engineering Specification:** **APZQEP-OES-ENG-070A** — **ACCEPTED / ENGINEERING SPECIFICATION BASELINED / CLOSED**  
> **Workbench Engineering:** **APZQEP-ENG-070A** — **ACCEPTED / APPROVED / PROGRAMME CLOSED**  
> **Workbench Component Certification:** **APZQEP-CERT-070A** — **CERTIFIED / APPROVED / CLOSED** · **WORKBENCH_PRODUCTION_READY_WITH_LIMITATIONS**  
> **Integrated Capability Certification:** **APZQEP-CERT-080A** — **CERTIFIED / APPROVED / CLOSED** · **PRODUCTION_READY_WITH_LIMITATIONS**  
> **Freeze:** **APZQEP-FREEZE-080A** — **FROZEN / APPROVED / CLOSED** (see [freeze/](./freeze/README.md)) · `@apzhub/qep-test-plans` **1.0.0 CERTIFIED / FROZEN / BASELINE ESTABLISHED**

## Packs

| Pack | Status | Entry |
| ---- | ------ | ----- |
| [domain-certification/](./domain-certification/README.md) | **CERTIFIED / CLOSED** | Domain Component |
| [infrastructure/](./infrastructure/README.md) | **ACCEPTED / CLOSED** | [OWNER-ACCEPTANCE](./infrastructure/OWNER-ACCEPTANCE.md) |
| [CERT-060B/](./CERT-060B/README.md) | **CERTIFIED / APPROVED / CLOSED** | [OWNER-ACCEPTANCE](./CERT-060B/OWNER-ACCEPTANCE.md) |
| [OES-ARCH-014/](./OES-ARCH-014/README.md) | **ACCEPTED / ARCHITECTURE BASELINED / CLOSED** | [OWNER-ACCEPTANCE](./OES-ARCH-014/OWNER-ACCEPTANCE.md) |
| [OES-ENG-070A/](./OES-ENG-070A/README.md) | **ACCEPTED / ENGINEERING SPECIFICATION BASELINED / CLOSED** | [OWNER-ACCEPTANCE](./OES-ENG-070A/OWNER-ACCEPTANCE.md) |
| [workbench/](./workbench/README.md) | **ACCEPTED / APPROVED / PROGRAMME CLOSED** | [OWNER-ACCEPTANCE](./workbench/OWNER-ACCEPTANCE.md) — **ACCEPTED / CLOSED** |
| [CERT-070A/](./CERT-070A/README.md) | **CERTIFIED / APPROVED / CLOSED** | [OWNER-ACCEPTANCE](./CERT-070A/OWNER-ACCEPTANCE.md) — **CERTIFIED / CLOSED** |
| [capability-certification/](./capability-certification/README.md) | **CERTIFIED / APPROVED / CLOSED** | [OWNER-ACCEPTANCE](./capability-certification/OWNER-ACCEPTANCE.md) — **CERTIFIED / APPROVED / CLOSED** |
| [CERT-080A/](./CERT-080A/README.md) (pointer) | — | → [capability-certification/](./capability-certification/README.md) |
| [freeze/](./freeze/README.md) | **FROZEN / APPROVED / CLOSED** | [OWNER-FREEZE-DECISION](./freeze/OWNER-FREEZE-DECISION.md) — FROZEN / APPROVED / CLOSED |

## Lifecycle

```text
CERT-060A CERTIFIED · Domain 0.1.0
  → ENG-060B ACCEPTED / CLOSED
  → CERT-060B CERTIFIED / APPROVED / CLOSED · Infrastructure 0.2.0 INFRASTRUCTURE COMPONENT CERTIFIED
  → ARCH-014 ACCEPTED / ARCHITECTURE BASELINED / PROGRAMME CLOSED
  → OES-ENG-070A ACCEPTED / ENGINEERING SPECIFICATION BASELINED / CLOSED
  → ENG-070A ACCEPTED / APPROVED / PROGRAMME CLOSED
  → CERT-070A CERTIFIED / APPROVED / CLOSED · Workbench 0.2.0 WORKBENCH COMPONENT CERTIFIED
  → APZQEP-CERT-080A CERTIFIED / APPROVED / CLOSED · Test Plans Integrated Capability Certification · @apzhub/qep-test-plans 1.0.0 CERTIFIED
  → Version Promotion 1.0.0 APPLIED
  → APZQEP-FREEZE-080A FROZEN / APPROVED / CLOSED · @apzhub/qep-test-plans 1.0.0 CERTIFIED / FROZEN / BASELINE ESTABLISHED  ← baseline
```

## STOP

```text
Programme: APZQEP-CERT-080A

Status: CERTIFIED
APPROVED
CLOSED

Programme: APZQEP-FREEZE-080A

Status: FROZEN
APPROVED
CLOSED

@apzhub/qep-test-plans
1.0.0
CERTIFIED
FROZEN
BASELINE ESTABLISHED
PRODUCTION_READY_WITH_LIMITATIONS

Authorised next delivery: none under existing identifiers — new Owner-authorised programme required. Portfolio: Requirements, Traceability, Verification, Test Specifications, Test Plans — all 1.0.0 FROZEN.
```
