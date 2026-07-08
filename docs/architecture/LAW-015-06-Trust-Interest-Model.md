# LAW-015-06 — Trust Interest Model

> **Story:** LAW-015-06  
> **Status:** Implemented — in-memory only  
> **Last updated:** 2026-07-07

---

## 1. Entity: TrustInterestRule

Interest calculation policy.

| Field                 | Type                               | Notes                            |
| --------------------- | ---------------------------------- | -------------------------------- |
| `trustInterestRuleId` | string                             | Primary key                      |
| `tenantId`            | string                             | Tenant scope                     |
| `trustAccountId`      | string?                            | Account-specific or firm default |
| `complianceProfileId` | string                             | Profile reference                |
| `accrualMethod`       | `simple_daily` \| `simple_monthly` | Calculation policy               |
| `annualRatePercent`   | number                             | Inline rate                      |
| `postingFrequency`    | enum                               | Metadata for future scheduling   |
| `minimumBalance`      | number?                            | Accrual threshold                |
| `strategyRef`         | string?                            | Future plugin hook               |
| `isActive`            | boolean                            | Active flag                      |
| `version`             | number                             | Policy version                   |
| `effectiveFrom`       | ISO date                           | Prospective effective date       |

---

## 2. Entity: TrustInterestAccrualLine

Single client/matter interest line.

| Field              | Type    |
| ------------------ | ------- |
| `lineId`           | string  |
| `clientId`         | string  |
| `matterId`         | string? |
| `principalBalance` | number  |
| `interestAmount`   | number  |
| `currency`         | string  |

---

## 3. Entity: TrustInterestPosting

Batch interest workflow aggregate.

| Field                    | Type                                          | Notes                      |
| ------------------------ | --------------------------------------------- | -------------------------- |
| `trustInterestPostingId` | string                                        | Primary key                |
| `tenantId`               | string                                        | Tenant scope               |
| `trustAccountId`         | string                                        | Target account             |
| `trustInterestRuleId`    | string                                        | Applied rule               |
| `status`                 | `draft` \| `approved` \| `posted` \| `voided` | Workflow state             |
| `periodStart`            | ISO date                                      | Accrual period start       |
| `periodEnd`              | ISO date                                      | Accrual period end         |
| `lineItems`              | array                                         | Accrual lines              |
| `totalInterestAmount`    | number                                        | Sum of line interest       |
| `currency`               | string                                        | Account currency           |
| `linkedTransactionIds`   | string[]                                      | Posted ledger transactions |

Lifecycle: `draft` → `approved` → `posted`.

---

## 4. Ledger integration

Interest posting creates `interest` trust transactions:

- **Debit:** `TRUST-INTEREST-EXPENSE`
- **Credit:** `TRUST-LIABILITY-CLIENT` or `TRUST-LIABILITY-MATTER`

Each posted transaction is fully allocated to the originating client/matter.

---

## 5. Accrual formulas (stub)

| Method           | Formula                                |
| ---------------- | -------------------------------------- |
| `simple_daily`   | `principal × (rate/100) × (days/365)`  |
| `simple_monthly` | `principal × (rate/100) × (months/12)` |

Amounts rounded to two decimal places.

---

## 6. Immutability

- Posted interest batches are frozen on persist
- Draft → approved → posted transitions are append-only state changes
- No deletion API on posting repository
