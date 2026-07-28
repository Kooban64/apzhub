# Product Certification Standard

> **Programme:** APZHUB-PRODUCTS-002 · Baseline: Platform 1.4

## Purpose

Minimum certification requirements before Owner Acceptance of any product programme or product release.

## Certification lifecycle

```text
Engineering Acceptance
  → Operational Readiness
  → Remediation (if authorised)
  → Build Validation
  → Product Certification
  → Owner Acceptance
  → Release Closure
```

## Minimum certification pack

Create under `docs/products/{product}/` or `docs/releases/{product}/{semver}/` as appropriate:

| Artefact                   | Required    |
| -------------------------- | ----------- |
| README / Certificate       | Yes         |
| Programme / release review | Yes         |
| Quality evidence           | Yes         |
| Architecture compliance    | Yes         |
| Known limitations          | Yes         |
| Risk / OQs                 | Yes         |
| Owner Acceptance           | Yes         |
| Evidence JSON (where used) | Recommended |

## Minimum gates

| Gate                            | Required                               |
| ------------------------------- | -------------------------------------- |
| Unit tests                      | PASS (scope)                           |
| Integration tests               | PASS (scope)                           |
| Product audit / certify command | PASS when defined                      |
| Documentation                   | PASS                                   |
| Completion report               | Written                                |
| Owner Acceptance                | Explicit ACCEPTED / CLOSED             |
| Repository verification         | Versions, freezes, no SDK public break |
| Brand masking                   | Verified                               |
| Platform layering               | Verified                               |

## Classification (exactly one)

| Classification                                       | When                                                    |
| ---------------------------------------------------- | ------------------------------------------------------- |
| **PRODUCTION READY**                                 | All gates green; no material OQs                        |
| **PRODUCTION READY WITH LIMITATIONS**                | Production-usable with documented product limitations   |
| **PRODUCTION READY WITH OPERATIONAL QUALIFICATIONS** | Production-usable; operator/env qualifications required |
| **NOT CERTIFIED**                                    | Blocking product/platform defect or incomplete evidence |

## Architecture compliance checklist

- [ ] AI-MANIFEST / CURRENT-MILESTONE bootstrap
- [ ] Platform 1.4 freezes unmodified (or Platform ADR + Owner)
- [ ] Module → Service → Connector → Engine only
- [ ] No standalone search / notification subsystems
- [ ] Integration SDK public contracts unchanged
- [ ] Engine names not in user-facing UI
- [ ] Permissions server-authoritative

## Incomplete certification

If any minimum gate fails without an accepted OQ/limitation, the programme is **not** ready for Owner Acceptance. Do not mark CLOSED. Do not start the next product programme.
