# PRODUCT-ASSESSMENT-METHODOLOGY

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZHUB-ADOPT-001 |
| Timestamp | 20260803T084305Z |

## 1. Purpose

Objective portfolio assessment against the Enterprise Engineering Lifecycle (APZHUB-ENG-003) and Enterprise Standards (ES-001, ES-002, ES-003). No engineering, migration, redesign, or standards change.

## 2. Authoritative baseline (consume only)

| Baseline                                                             | Source                                 |
| -------------------------------------------------------------------- | -------------------------------------- |
| Enterprise Governance 1.0 STABLE                                     | APZHUB-ENG-002                         |
| Enterprise Engineering Baseline 1.x STABLE (1.2)                     | APZHUB-ENTERPRISE-ENGINEERING-BASELINE |
| Enterprise Engineering Lifecycle                                     | APZHUB-ENG-003                         |
| Product Board / Certification / Readiness / Release / Ops / Evidence | APZHUB-ENG-003 pack                    |
| ES-001 / ES-002 / ES-003                                             | Unchanged standards                    |
| Reference Implementation                                             | APZQEP Version 1.0 GA (not assessed)   |

## 3. Products in scope

APZ Projects · APZ Support · APZ Time · APZ Documents · APZ Analytics · APZ Workflow · APZ Law Platform

**Excluded:** APZQEP (Enterprise Reference Implementation).

## 4. Evidence sources

| Source class            | Examples                                                                               |
| ----------------------- | -------------------------------------------------------------------------------------- |
| Product packs           | `docs/products/{id}/`, `docs/products/apz-{id}/`                                       |
| Release packs           | `docs/releases/{id}/`                                                                  |
| Architecture / security | `docs/architecture/`, `docs/security/`                                                 |
| Code presence           | `integrations/`, `packages/`, `apps/`                                                  |
| Portfolio registers     | PRODUCT-CATALOGUE, PORTFOLIO-RELEASE-REGISTER, ENG-002 adoption review, ENG-003 matrix |
| Milestone / status      | CURRENT-MILESTONE, PRODUCT-STATUS (if any)                                             |

## 5. Compliance scale

| Rating                    | Meaning                                                 |
| ------------------------- | ------------------------------------------------------- |
| NOT STARTED               | No material evidence of the practice                    |
| INITIAL                   | Named or started; thin / informal                       |
| PARTIAL                   | Artefacts exist; incomplete vs ENG-003                  |
| SUBSTANTIAL               | Strong historical practice; ENG-003 face incomplete     |
| COMPLETE                  | Meets ENG-003 expectation for the area                  |
| REFERENCE                 | APZQEP-class only (not assigned to adoption candidates) |
| **Evidence Insufficient** | Cannot judge; missing evidence listed                   |

## 6. Maturity levels

See [PRODUCT-MATURITY-MODEL.md](./PRODUCT-MATURITY-MODEL.md). Level 6 reserved for Enterprise Reference (APZQEP). Do not force products upward.

## 7. Adoption readiness

| Rating          | Meaning                                                  |
| --------------- | -------------------------------------------------------- |
| READY           | Clear authority; can enter Phase 1 under Owner Auth      |
| PARTIALLY READY | Historical delivery exists; governance face gaps first   |
| NOT READY       | Authority conflicts or catalogue gaps block safe Phase 1 |

## 8. Conflict rule

Where historical Production ACCEPTED conflicts with ENG-002 “nascent”, product README “Awaiting Acceptance”, or catalogue omission → record **status inconsistency** and prefer **Evidence Insufficient** / lower readiness rather than inventing resolution.
