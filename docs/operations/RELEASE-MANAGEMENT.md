# APZHUB Release Management (Operations)

> **Programme:** APZHUB-OPERATIONS-001  
> **Date:** 2026-07-20  
> **Complements:** [RELEASE-MANAGEMENT-STANDARD.md](./RELEASE-MANAGEMENT-STANDARD.md) · [RELEASE-GOVERNANCE-CHECKLIST](../releases/RELEASE-GOVERNANCE-CHECKLIST.md)

---

## Current baseline

| Field                        | Value                                                                 |
| ---------------------------- | --------------------------------------------------------------------- |
| Platform Production Baseline | **APZHUB 1.1.0**                                                      |
| Certification class          | **PRODUCTION_READY_WITH_LIMITATIONS**                                 |
| Evidence                     | [docs/releases/platform/1.1.0/](../releases/platform/1.1.0/README.md) |

## Release classes (ops view)

| Class                      | Authority             | Ops duty                                   |
| -------------------------- | --------------------- | ------------------------------------------ |
| Platform Patch/Minor/Major | Owner + evidence pack | Deploy, verify, communicate, rollback plan |
| Product Patch/Minor/Major  | Owner + product pack  | Product-specific verify + KL update        |
| Hotfix                     | Hotfix Policy         | Expedited Change + post-acceptance         |
| Documentation / ops        | This framework        | No Production code                         |

## Gates before Production deploy

1. Named programme Acceptance (or Hotfix path)
2. CI quality green (Document **015**)
3. Compatibility / KL honesty
4. Rollback plan documented
5. Change record approved
6. Staging verification (where Staging exists)

## Asset / configuration linkage

Release notes must list config/env deltas. See [CONFIGURATION-MANAGEMENT.md](./CONFIGURATION-MANAGEMENT.md).
