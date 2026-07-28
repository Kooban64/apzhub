# Owner Acceptance — APZQEP-ARCH-005

> **Decision:** **ACCEPTED / CLOSED / COMPLETE**  
> **Date:** 2026-07-26  
> **Authority:** Owner Architecture Acceptance  
> **Classification:** Authoritative Architecture  
> **Document revision:** 1.1.0-arch

## Decision record

| Field               | Value                                                                                        |
| ------------------- | -------------------------------------------------------------------------------------------- |
| Programme           | APZQEP-ARCH-005                                                                              |
| Title               | Requirements Relationship Architecture                                                       |
| Specification       | [REQUIREMENTS-RELATIONSHIP-ARCHITECTURE.md](./REQUIREMENTS-RELATIONSHIP-ARCHITECTURE.md)     |
| Decision            | **ACCEPTED / CLOSED / COMPLETE**                                                             |
| Classification      | Authoritative Architecture                                                                   |
| Acceptance evidence | `docs/operations/evidence/portfolio-recert/20260726T075000Z-APZQEP-ARCH-005-ACCEPTANCE.json` |

## Binding architecture foundations

The following are now binding for APZ QEP:

- Relationship Taxonomy
- Relationship Behaviour Model
- Relationship Strength
- Relationship Criticality
- Relationship Classification
- Relationship Scope
- Relationship Semantic Profile
- Relationship Lifecycle
- Relationship Integrity
- Version Interaction
- Baseline Interaction
- Traceability Consumption Model
- AI Governance
- Taxonomy Governance
- Implementation Neutrality

This specification supersedes all previous informal discussions regarding relationship semantics. Future engineering shall conform to it.

## Preserved foundations

- ENG-020D Content Version immutability
- ENG-020E Baseline immutability
- Requirements remain the Relationship System of Record
- Platform 1.4 owns authentication, authorisation, audit, observability and search
- Traceability remains a downstream consumer
- Tenant isolation remains mandatory
- Historical engineering facts remain immutable

## Engineering authorisation consequence

This acceptance does **not** by itself start coding.

| Programme           | Phase        | Implementation          |
| ------------------- | ------------ | ----------------------- |
| **APZQEP-ENG-020F** | **PLANNING** | **AUTHORISED TO BEGIN** |

Engineering may proceed only under a separate Owner Engineering Programme Instruction.

**Recommended next step:** Owner Engineering Specification for APZQEP-ENG-020F (expected three-part programme: Domain → Persistence/Services/APIs → Workbench/Search/Audit/Testing/Ops), before implementation work.
