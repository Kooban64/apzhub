# Product Definition Standard

> **Programme:** APZHUB-PRODUCTS-003 · Baseline: Certified Platform 1.4

## Mandate

Every APZHUB product **shall** complete a Product Definition before any architecture, engineering, implementation, or coding begins.

Product Definition is a **methodology stage**, not an implementation programme. It produces a Definition pack that becomes the business, operational, technical, and commercial contract for later stages.

## Objectives

1. Define the product fully from idea to engineering handoff.
2. Ensure business, operational, technical, security, AI, and commercial perspectives are complete.
3. Prevent premature architecture or code.
4. Provide a reusable template and checklist for every product.
5. Hand off a clear, auditable package to Architecture.

## Definition pack location

```text
docs/products/{product-id}/definition/
  README.md
  PRODUCT-DEFINITION.md          # filled template (required)
  BUSINESS-APPROVAL.md           # Owner / business decision record
  CHECKLIST.md                   # completed checklist copy
  EVIDENCE/                      # optional supporting artefacts
```

Existing product folders may host `definition/` as a subfolder. New products start with Definition only — no module/service code until later Owner-authorised programmes.

## Completeness rule

A Definition is **complete** only when:

- All twenty template sections are filled or explicitly marked **N/A** with rationale
- [PRODUCT-DEFINITION-CHECKLIST.md](./PRODUCT-DEFINITION-CHECKLIST.md) is fully checked
- Business Approval is recorded
- Architecture Handoff section is signed off by Product Manager (ready for Architecture programme)

Incomplete Definitions **block** Architecture entry.

## Authority chain

```text
Owner Decision (named product Definition programme or portfolio authority)
  → Product Definition (this standard)
  → Business Approval
  → Architecture programme (separate Owner Approval)
```

Filling a template does **not** authorise Architecture or Implementation.

## Alignment

| Concern                       | Binding reference                              |
| ----------------------------- | ---------------------------------------------- |
| Product Engineering Framework | [../framework/](../framework/README.md)        |
| Platform freezes              | Platform 1.4 CERT / AI-MANIFEST                |
| Layering                      | Module → Platform Service → Connector → Engine |
| Native vs Platform-backed     | Framework Architecture Standard                |

## Prohibitions during Definition

- No application code
- No Platform 1.4 changes
- No Platform 2.0
- No product-specific architecture ADRs that imply implementation (Architecture stage owns ADRs)
- No designing “implementation-ready” packages beyond Definition content
