# Regulatory Requirements Standard

> **Programme:** APZHUB-PRODUCTS-004

## Purpose

Capture regulatory and compliance requirements early — before Definition and Architecture.

## Regimes (mandatory consideration)

| Regime               | When to include                                               |
| -------------------- | ------------------------------------------------------------- |
| POPIA                | Personal information in South Africa / APZHUB default posture |
| GDPR                 | If EU data subjects in scope                                  |
| KYC                  | Customer identity verification in scope                       |
| KYB                  | Business verification in scope                                |
| AML                  | Financial crime controls in scope                             |
| Audit                | Immutable / exportable audit expectations                     |
| Retention            | Retention/disposal schedules                                  |
| Industry regulations | Vertical-specific (e.g. legal practice, finance)              |

## Writing rules

1. Use IDs `RR-###`.
2. State data categories and lawful-basis intent (high level).
3. Mark **N/A** with rationale when a regime is out of scope.
4. Do not claim Platform already implements KYC/KYB/AML unless evidenced.
5. External delivery (Email/SMS) remains subject to Platform freezes / separate Approvals.

## Quality checks

- [ ] Personal data flows identified or explicitly none
- [ ] Retention intent present for personal data
- [ ] Audit expectations for privileged actions stated
