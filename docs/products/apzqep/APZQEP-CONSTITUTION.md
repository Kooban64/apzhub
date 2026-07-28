# APZQEP Constitution

| Field             | Value                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| Document          | **APZQEP-CONSTITUTION**                                                                                |
| Product           | APZ QEP — APZ Quality Engineering Platform                                                             |
| Version           | **1.0.0**                                                                                              |
| Status            | **RATIFIED / APPROVED / BASELINED**                                                                    |
| Date ratified     | 2026-07-28                                                                                             |
| Ratification      | [APZQEP-CONSTITUTION-OWNER-RATIFICATION.md](./APZQEP-CONSTITUTION-OWNER-RATIFICATION.md)               |
| Stability         | Permanent — amend only by dedicated Owner-authorised constitutional programme                          |
| Nature            | Highest product-level constitution for APZ QEP; **references**, does not duplicate, detailed standards |
| Milestone context | Foundation Complete · Engineering Platform v1 recognised                                               |

---

## 0. How to use this document

**Read this first** before any Architecture, Engineering Specification, Engineering, Certification, Freeze, or AI-assisted work on APZ QEP.

Then consult the referenced standards for detail. If a lower document conflicts with this Constitution, **this Constitution prevails** (subject only to Document 000 for platform-wide engineering rules).

---

## 1. Authority hierarchy

```text
1. Document 000 — APZHUB Engineering Constitution          (platform-wide; supreme on conflict)
2. APZQEP-CONSTITUTION (this document)                     (product-wide for APZ QEP)
3. Product Vision · Constitution companion articles         (docs/products/apzqep/constitution/)
4. OES-000 / OES-001 / OES-002                             (engineering methodology — FROZEN)
5. Accepted Architecture / ADRs
6. Accepted Owner Engineering Specifications (OES-ENG / OES-ARCH packs)
7. Engineering implementation & tests
8. Independent Certification packs
9. Owner Freeze decisions
```

Lower levels SHALL NOT contradict higher levels without Owner amendment of the higher level.

---

## 2. Vision and purpose

**APZ QEP** is an Enterprise Quality Engineering Platform.

Its purpose is to govern software quality across the software delivery lifecycle. Testing is **one capability**, not the product identity.

Users interact with APZHUB / APZ QEP product surfaces — never with backend engine brands as the product identity.

Detail: [PRODUCT-VISION.md](./PRODUCT-VISION.md)

---

## 3. Two lifecycles (non-negotiable distinction)

| Lifecycle                | Meaning at Foundation Complete                                                                                          |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| **Engineering platform** | Mature — operating model, governance, certification, freeze, and release methodology are **validated through practice** |
| **Product capabilities** | Continue to grow under Expansion — each new capability follows the mandatory lifecycle below                            |

APZQEP having reached **Engineering Platform Version 1** does **not** mean all planned business capabilities are complete.

---

## 4. Core architectural principles

1. **Platform-first** — Module → Platform Service → Connector → Engine; no layer bypass.
2. **Layered capability architecture** — Domain · Infrastructure · Workbench are separate concerns.
3. **Domain owns behaviour** — lifecycle, policy, invariants live in Domain only.
4. **Infrastructure owns execution** — persistence, REST, permissions wiring, events, search hooks; no business-rule invention.
5. **Workbench is presentation only** — the Workbench SHALL never determine business behaviour.
6. **`availableActions` is sole UI action authority** — the Workbench renders only actions the certified Infrastructure supplies; it SHALL NOT invent transitions or grants.
7. **One System of Record per datum** — no unauthorized duplication of engine business data.
8. **Self-hosted / OSS-first** — no mandatory commercial dependencies for core capability.
9. **Backend-agnostic UX** — user-facing names never expose engine brands.

Detail: Document 000 · [constitution/PRODUCT-CONSTITUTION.md](./constitution/PRODUCT-CONSTITUTION.md) · [constitution/ENGINEERING-GUARDRAILS.md](./constitution/ENGINEERING-GUARDRAILS.md)

---

## 5. Engineering principles

1. Manifest-first (module / service / integration / event / component).
2. Interface-first Platform Services; no business logic in Gateway or UI.
3. TypeScript strict; no `any` as a contract escape hatch.
4. Secrets never in code, logs, or repositories.
5. Full test pyramid + accessibility (WCAG AA target) before merge.
6. Honest representation of known limitations — never simulate unavailable functionality.

Detail: Document 000 · OES-000 · OES-001 · [ENGINEERING-LIFECYCLE-HANDBOOK.md](./ENGINEERING-LIFECYCLE-HANDBOOK.md)

---

## 6. Governance principles

1. **No bypass** of lifecycle stages.
2. **Architecture before Engineering Specification before Engineering.**
3. **Engineering Completion Review before Owner Acceptance.**
4. **Owner Acceptance closes engineering** under that programme identifier.
5. **Certification is independent of engineering** — CERT evaluates as delivered; CERT does not remediate.
6. **Freeze is a separate Owner Decision** from Certification.
7. Amendments to frozen baselines require new Owner-authorised programmes and semantic versioning.

Detail: OES-000 · OES-002 · [OES-CERTIFICATION-INDEPENDENCE.md](../../engineering/oes/OES-CERTIFICATION-INDEPENDENCE.md) · [OES-CERTIFICATION-LEVELS.md](../../engineering/oes/OES-CERTIFICATION-LEVELS.md)

---

## 7. Certification principles

| Level                        | Purpose                                                    |
| ---------------------------- | ---------------------------------------------------------- |
| **Component Certification**  | Domain / Infrastructure / Workbench assessed independently |
| **Capability Certification** | Integrated end-to-end capability                           |
| **Platform Certification**   | Multi-capability APZQEP / platform release (future)        |

Component Certification SHALL NOT imply Capability Freeze or silent **1.0.0** promotion. Capability Certification is the normal gate for capability **1.0.0**. Owner Freeze establishes the immutable production baseline.

---

## 8. Mandatory capability lifecycle

Every new APZQEP capability SHALL follow:

```text
Architecture
  → Engineering Specification
  → Engineering
  → Engineering Completion Review
  → Owner Acceptance
  → Component Certification (as applicable per layer)
  → Capability Certification
  → Owner Freeze
```

No capability may bypass or combine these stages. No Wave 2 (or later) capability may commence without an Owner-approved Architecture programme for that specific capability.

---

## 9. Versioning policy

1. Semantic Versioning is mandatory for capability packages.
2. **1.0.0** denotes first stable capability baseline after Capability Certification (Owner-authorised).
3. Frozen baselines change only via new programmes: patches (**1.0.x**), minors (**1.x.0**), majors (**x.0.0**) according to impact.
4. Limitations accepted at Freeze remain part of the baseline until superseded by a later certified version.

---

## 10. Freeze policy

1. Freeze eligibility follows successful Capability Certification (and version promotion where authorised).
2. Freeze is **never automatic** — it requires an Owner Freeze Decision.
3. Frozen packages are the authoritative production baseline.
4. Uncontrolled changes to a frozen baseline are prohibited.

---

## 11. Change control policy

1. Foundation baseline (five frozen capabilities + validated operating model) is **locked**.
2. Expansion extends the platform; it does not silently rewrite Foundation.
3. Defects, security fixes, errata, and enhancements require new programme identifiers.
4. Documentation that alters technical intent of a frozen baseline requires governed change.

---

## 12. AI engineering principles

1. AI assists humans; humans remain accountable.
2. AI never becomes System of Record.
3. AI never certifies, approves, or bypasses `availableActions` / permissions.
4. AI agents SHALL read this Constitution, Document 000, OES trilogy, and AI-MANIFEST before generating code.
5. AI SHALL stop at programme boundaries and SHALL NOT invent Wave programmes.

Detail: [constitution/AI-CONSTITUTION.md](./constitution/AI-CONSTITUTION.md) · [../../foundation/AI-MANIFEST.md](../../foundation/AI-MANIFEST.md)

---

## 13. Platform invariants (APZQEP)

These have been validated through Foundation delivery and are permanent:

| ID  | Invariant                                                                        |
| --- | -------------------------------------------------------------------------------- |
| I-1 | Domain / Infrastructure / Workbench separation                                   |
| I-2 | Workbench never owns business behaviour                                          |
| I-3 | `availableActions` is the sole presentation-layer action authority               |
| I-4 | Known limitations are presented honestly; unavailable features are not simulated |
| I-5 | Certification independence (CERT does not engineer)                              |
| I-6 | Layered certification before capability claims                                   |
| I-7 | Freeze is Owner-governed and separate from CERT                                  |
| I-8 | Correlation IDs and typed error envelopes on platform APIs                       |

---

## 14. Foundation baseline (reference)

As of Owner Acceptance of [APZQEP-PORTFOLIO-001](./portfolio/PORTFOLIO-001/OWNER-ACCEPTANCE.md):

| Capability          | Package                           | Version | Status             |
| ------------------- | --------------------------------- | ------- | ------------------ |
| Requirements        | `@apzhub/qep-requirements`        | 1.0.0   | CERTIFIED / FROZEN |
| Traceability        | `@apzhub/qep-traceability`        | 1.0.0   | CERTIFIED / FROZEN |
| Verification        | `@apzhub/qep-verification`        | 1.0.0   | CERTIFIED / FROZEN |
| Test Specifications | `@apzhub/qep-test-specifications` | 1.0.0   | CERTIFIED / FROZEN |
| Test Plans          | `@apzhub/qep-test-plans`          | 1.0.0   | CERTIFIED / FROZEN |

Engineering Operating Model: **FULLY VALIDATED** — [APZOR-ENGINEERING-OPERATING-MODEL-VALIDATION.md](../../engineering/oes/APZOR-ENGINEERING-OPERATING-MODEL-VALIDATION.md)

---

## 15. Companion detailed standards (by reference)

| Topic                            | Primary reference                                                                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Product articles                 | [constitution/](./constitution/README.md)                                                                                                 |
| Lifecycle handbook               | [ENGINEERING-LIFECYCLE-HANDBOOK.md](./ENGINEERING-LIFECYCLE-HANDBOOK.md)                                                                  |
| Portfolio baseline               | [portfolio/PORTFOLIO-001/](./portfolio/PORTFOLIO-001/README.md)                                                                           |
| Templates                        | [portfolio/PORTFOLIO-001/STANDARD-TEMPLATES-INDEX.md](./portfolio/PORTFOLIO-001/STANDARD-TEMPLATES-INDEX.md)                              |
| Wave 2 planning (not authorised) | [portfolio/PORTFOLIO-001/WAVE-2-ROADMAP.md](./portfolio/PORTFOLIO-001/WAVE-2-ROADMAP.md)                                                  |
| Onboarding / AI bootstrap        | [../../foundation/AI-MANIFEST.md](../../foundation/AI-MANIFEST.md) · [../../foundation/AI-BOOTSTRAP.md](../../foundation/AI-BOOTSTRAP.md) |

---

## 16. Amendment

Amendments require a **dedicated Owner-authorised constitutional programme**. They SHALL NOT be introduced indirectly through engineering specifications, architecture documents, or capability documentation.

Minimum amendment process:

1. Explicit Owner Decision under a constitutional programme identifier
2. Version increment of this document (SemVer)
3. Record in product CHANGELOG
4. No silent dilution of invariants I-1…I-8 without Owner recognition of the change

Subordinate documents SHALL remain consistent with this Constitution.

---

## 17. STOP

```text
APZQEP-CONSTITUTION
Version 1.0.0
Status: RATIFIED
APPROVED
BASELINED

CONSTITUTIONAL ENTRY POINT FOR APZQEP
ENGINEERING PLATFORM V1
FOUNDATION COMPLETE
CAPABILITY EXPANSION READY
NO WAVE-2 PROGRAMMES AUTHORISED
```
