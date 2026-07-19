# APZ Time — Implementation Ready Decision

> **Programme:** APZHUB-TIME-READINESS-002  
> **Classification:** DOCUMENTATION ONLY  
> **Assessment:** [APZ-TIME-FINAL-READINESS-ASSESSMENT.md](./APZ-TIME-FINAL-READINESS-ASSESSMENT.md)  
> **Date:** 2026-07-19

---

## Decision

# IMPLEMENTATION READY

APZ Time is promoted from **Planning** to **Implementation Ready**.

---

## Basis

| Gate                                                                                              | Result                               |
| ------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Product Definition Pack complete                                                                  | **Met**                              |
| Architecture approved (pack + Kimai domain ACCEPTED)                                              | **Met**                              |
| Dependencies available (Kimai **0.2.0** CERTIFIED_DOMAIN · services **0.26.1** · HTTP **1.10.0**) | **Met**                              |
| Marked Implementation Ready (pack · portfolio · matrix)                                           | **Met** by this programme            |
| Principal READINESS-001 blocker (Kimai domain)                                                    | **Removed** — KIMAI-002 **ACCEPTED** |

Aligned to PRODUCTS-003 / Projects precedent: Workbench, module UI, and product Playwright do **not** block IR.

---

## What this decision does **not** authorise

- Production code for APZ Time
- Workbench UI / React components
- Release 1.0 implementation
- Architecture or package changes
- Any named product programme without separate Owner Approval

**Implementation Ready ≠ authorised.** Definition of Ready still requires Owner Approval of a **named** programme + Sprint Guide before code.

---

## Documentation updated by this decision

| Artefact                                           | Change                                         |
| -------------------------------------------------- | ---------------------------------------------- |
| `docs/products/time/IMPLEMENTATION-READINESS.md`   | Maturity → **Implementation Ready**            |
| `docs/products/time/README.md`                     | Maturity → **Implementation Ready**            |
| Portfolio / readiness matrix / summary             | APZ Time → **Implementation Ready**            |
| Navigation (AI-MANIFEST, CURRENT-*, releases/time) | Reflect IR + READINESS-002 Awaiting Acceptance |

---

## Next

1. Owner Acceptance of **APZHUB-TIME-READINESS-002**.
2. Owner Approval of a **named** APZ Time Phase 1 / Workbench programme (see [Phase 1 Scope](./APZ-TIME-1.0-PHASE-1-SCOPE.md)) — **not** authorised by this decision alone.
