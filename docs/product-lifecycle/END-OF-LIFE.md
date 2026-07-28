# End-of-Life Policy

> **Programme:** APZHUB-PRODUCT-LIFECYCLE-001  
> **Complements:** [Commercial Product Lifecycle — Retirement](../product-management/PRODUCT-LIFECYCLE.md)

---

## EOL types

| Type               | Meaning                                                |
| ------------------ | ------------------------------------------------------ |
| **End of sale**    | No new commercial entitlement for that edition/version |
| **End of support** | No further patches / security fixes                    |
| **Retirement**     | Removed from portfolio register as supported           |

## Process

1. Owner Approval of EOL notice (scope, dates, successor).
2. Publish migration path and Known Limitations honesty.
3. Update PORTFOLIO-RELEASE-REGISTER / product RELEASES.md.
4. Stop new feature intake against retired SemVer.
5. Security exceptions only via Owner emergency Approval.

## Rules

- EOL never silent — customers/operators need notice.
- Historical evidence packs remain in the repository.
- Engine retirement ≠ APZHUB product retirement without Owner decision.
- STOP themes are not “EOL” — they were never delivered.
