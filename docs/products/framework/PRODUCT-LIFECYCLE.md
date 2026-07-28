# Product Lifecycle Standard

> **Programme:** APZHUB-PRODUCTS-002 · Baseline: Platform 1.4

## Canonical lifecycle

Do not skip stages. Do not implement before Owner Approval of a named programme.

```text
Idea
  → Vision
  → Architecture (+ Product ADR if required)
  → Owner Programme Approval
  → Engineering Design
  → Implementation
  → Testing (unit · component · integration · API · E2E as applicable)
  → Operational Readiness
  → Remediation (if required · Owner-authorised only)
  → Build Validation
  → Product Certification
  → Owner Acceptance
  → Release Approval
  → Maintenance
  → End-of-Life (Owner-authorised)
```

## Stage outcomes

| Stage                    | Minimum outcome                                                          |
| ------------------------ | ------------------------------------------------------------------------ |
| Idea                     | Opportunity noted — not authorised work                                  |
| Vision                   | `VISION.md` — users, value, scope, non-goals                             |
| Architecture             | `ARCHITECTURE.md` + Product ADR when contracts/engines/boundaries change |
| Owner Programme Approval | Explicit named programme ID                                              |
| Engineering Design       | Design/spec pack before code                                             |
| Implementation           | Code within approved scope only                                          |
| Testing                  | Pyramid green for programme scope                                        |
| Operational Readiness    | OR pack — defects classified; no silent fixes                            |
| Remediation              | REM programme only for Owner-approved findings                           |
| Build Validation         | Packaging/build proven; OQs recorded where environmental                 |
| Product Certification    | CERT pack + recommendation                                               |
| Owner Acceptance         | ACCEPTED / CLOSED in register                                            |
| Release Approval         | SemVer evidence under `docs/releases/{product}/`                         |
| Maintenance              | Patches/minors/majors only under new Approvals                           |
| End-of-Life              | Explicit Owner EOL programme — deprecate, migrate, archive               |

## Alignment with Platform Delivery Standard

Product lifecycle mirrors Platform 1.4 delivery (ARCH → ADR → ENG → OR → REM → BLD → CERT) at **product** scope. Platform remains frozen; products do not reopen Platform engineering.

## Rules

1. Bootstrap from [AI-MANIFEST](../../foundation/AI-MANIFEST.md) and [CURRENT-MILESTONE](../../foundation/CURRENT-MILESTONE.md).
2. Prefer product capability work; Platform changes require separate Platform programme + ADR + Owner.
3. After Acceptance, update product `RELEASES.md`, `KNOWN-LIMITATIONS.md`, KF status docs, and Owner Acceptance Register.
4. Next SemVer (Patch/Minor/Major) requires a **new** named Owner Approval.
