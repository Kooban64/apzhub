# Product Lifecycle Standard

> **Programme:** APZHUB-PRODUCTS-000  
> **Related:** [PRODUCT-ENGINEERING-HANDBOOK](./PRODUCT-ENGINEERING-HANDBOOK.md) · [AI-WORKFLOW](../foundation/AI-WORKFLOW.md)

---

## Lifecycle

Every APZHUB product follows this sequence. Do not skip stages. Do not implement before Owner Approval.

```text
Idea
  ↓
Vision
  ↓
Architecture
  ↓
Owner Approval
  ↓
Programme
  ↓
Implementation
  ↓
Testing
  ↓
Certification
  ↓
Acceptance
  ↓
Release
  ↓
Maintenance
```

---

## Stage definitions

| Stage              | Outcome                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| **Idea**           | Problem/opportunity noted; not authorised work                                                    |
| **Vision**         | `VISION.md` — user value, scope boundaries, non-goals                                             |
| **Architecture**   | `ARCHITECTURE.md` — product design on platform; ADRs if needed                                    |
| **Owner Approval** | Explicit Owner authorisation of a named programme                                                 |
| **Programme**      | Sprint guide / backlog stories bound to the product                                               |
| **Implementation** | Code and config within approved scope                                                             |
| **Testing**        | Unit + integration (and E2E when required)                                                        |
| **Certification**  | Audit / certify gates — see [PRODUCT-CERTIFICATION-STANDARD](./PRODUCT-CERTIFICATION-STANDARD.md) |
| **Acceptance**     | Programme Acceptance Report → Owner Acceptance → CLOSED                                           |
| **Release**        | Versioned release per [PRODUCT-RELEASE-STANDARD](./PRODUCT-RELEASE-STANDARD.md)                   |
| **Maintenance**    | Limitations, patches, roadmap updates — still Owner-gated for new programmes                      |

---

## Mapping to APZHUB Engineering Lifecycle

Product stages align with the mandatory platform lifecycle ([AI-WORKFLOW](../foundation/AI-WORKFLOW.md)):

| Product stage                | Platform lifecycle                                    |
| ---------------------------- | ----------------------------------------------------- |
| Idea → Vision → Architecture | Bootstrap + Recommendation prep                       |
| Owner Approval               | Owner Approval                                        |
| Programme → Implementation   | Implementation                                        |
| Testing → Certification      | Testing → Certification                               |
| Acceptance                   | Programme Acceptance Report → Owner Acceptance        |
| Release → Maintenance        | Post-acceptance; next programme requires new Approval |

---

## Rules

1. Bootstrap with **AI-MANIFEST** before any product work.
2. Confirm [CURRENT-MILESTONE](../foundation/CURRENT-MILESTONE.md) authorises the programme.
3. Prefer product capability work; extend platform only when blocked.
4. After Owner Acceptance, update product `RELEASES.md` / `KNOWN-LIMITATIONS.md` and Knowledge Foundation status docs as required.
