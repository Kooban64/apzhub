# LAW — Trust Permissions

> **Milestone:** LAW-015 — Trust Accounting  
> **Story:** LAW-015-01 (planning authority)  
> **Status:** **Canonical permission catalogue** — planning only  
> **Authority:** [007 Identity & RBAC](../007-identity-authentication-authorisation-rbac-architecture.md) · [LAW-Trust-Accounting-Reference-Architecture](../architecture/LAW-Trust-Accounting-Reference-Architecture.md)  
> **Last updated:** 2026-07-06

---

## 1. Purpose

Define canonical permission keys for Trust Accounting. Permissions follow Law Platform convention: **`legal.trust.{action}`** or **`legal.trust.{resource}.{action}`**.

Registered in legal capability manifest `permissions[]` at implementation (LAW-015-11 / LAW-015-14).

---

## 2. Permission model

| Rule                  | Description                                                    |
| --------------------- | -------------------------------------------------------------- |
| Namespace             | All keys prefixed `legal.trust.`                               |
| Fail secure           | Missing permission → deny                                      |
| Segregation of duties | Post, reconcile, transfer, and period close are separable      |
| API alignment         | OpenAPI `x-required-permission` when routes added (LAW-015-10) |
| Workbench alignment   | Views and actions declare same keys                            |

---

## 3. Core permissions

| Permission key                  | Label                      | Description                                                  |
| ------------------------------- | -------------------------- | ------------------------------------------------------------ |
| `legal.trust.view`              | View Trust Accounting      | Read trust accounts, balances, transactions, reconciliations |
| `legal.trust.manage`            | Manage Trust Accounts      | Create/edit trust account metadata; open accounts            |
| `legal.trust.post`              | Post Trust Transactions    | Post deposits, withdrawals, and adjustments                  |
| `legal.trust.transfer`          | Trust Transfers            | Inter-account and matter transfers                           |
| `legal.trust.transfer.business` | Trust to Business Transfer | Fee transfers from trust to business ledger                  |
| `legal.trust.reconcile`         | Reconcile Trust Accounts   | Perform three-way reconciliation                             |
| `legal.trust.interest`          | Manage Trust Interest      | Configure rules; approve and post interest                   |
| `legal.trust.report`            | Trust Reports              | Generate statements and regulatory exports                   |
| `legal.trust.audit`             | Trust Audit Access         | View full audit trail and examiner exports                   |
| `legal.trust.period.close`      | Close Trust Period         | Close reporting periods                                      |
| `legal.trust.period.override`   | Override Closed Period     | Post to closed periods (elevated)                            |
| `legal.trust.reverse`           | Reverse Trust Transactions | Post reversals                                               |
| `legal.trust.adjust`            | Trust Adjustments          | Post adjustment transactions                                 |

---

## 4. Resource-scoped permissions (optional granularity)

For large firms, optional sub-keys may be registered:

| Permission key                   | Description                         |
| -------------------------------- | ----------------------------------- |
| `legal.trust.account.view`       | View specific account (future ABAC) |
| `legal.trust.transaction.create` | Create draft transactions only      |
| `legal.trust.transaction.post`   | Alias for `legal.trust.post`        |
| `legal.trust.statement.generate` | Generate client statements          |
| `legal.trust.export`             | Download audit/regulatory exports   |

**Default roles use core permissions** — resource-scoped keys are optional LAW-015-14 enhancement.

---

## 5. Suggested role mappings (firm RBAC)

| Firm role               | Permissions                                                                             |
| ----------------------- | --------------------------------------------------------------------------------------- |
| **Trust Administrator** | view, manage, post, transfer, reconcile, interest, report, audit, period.close, reverse |
| **Finance Clerk**       | view, post, reconcile, report                                                           |
| **Attorney**            | view, post (matter-scoped policy), transfer (matter-scoped)                             |
| **Partner**             | view, audit, report, period.close, transfer.business                                    |
| **Read-only / Auditor** | view, audit, report                                                                     |

Platform IAM (M8 IAUX) remains separate — these are **firm legal roles**.

---

## 6. Action Framework mapping

| Action id (planned)                   | Permission                      |
| ------------------------------------- | ------------------------------- |
| `legal.trust.account.create`          | `legal.trust.manage`            |
| `legal.trust.deposit.post`            | `legal.trust.post`              |
| `legal.trust.withdrawal.post`         | `legal.trust.post`              |
| `legal.trust.transfer.execute`        | `legal.trust.transfer`          |
| `legal.trust.fee-transfer.execute`    | `legal.trust.transfer.business` |
| `legal.trust.reconciliation.complete` | `legal.trust.reconcile`         |
| `legal.trust.interest.post`           | `legal.trust.interest`          |
| `legal.trust.statement.generate`      | `legal.trust.report`            |
| `legal.trust.transaction.reverse`     | `legal.trust.reverse`           |
| `legal.trust.period.close`            | `legal.trust.period.close`      |

---

## 7. API mapping (future LAW-015-10)

| Operation                                  | Permission                 |
| ------------------------------------------ | -------------------------- |
| `GET /trust/accounts`                      | `legal.trust.view`         |
| `POST /trust/accounts`                     | `legal.trust.manage`       |
| `GET /trust/transactions`                  | `legal.trust.view`         |
| `POST /trust/transactions`                 | `legal.trust.post`         |
| `POST /trust/transactions/{id}/reverse`    | `legal.trust.reverse`      |
| `POST /trust/transfers`                    | `legal.trust.transfer`     |
| `POST /trust/reconciliations`              | `legal.trust.reconcile`    |
| `POST /trust/interest/postings`            | `legal.trust.interest`     |
| `GET /trust/audit`                         | `legal.trust.audit`        |
| `POST /trust/reporting-periods/{id}/close` | `legal.trust.period.close` |

---

## 8. Development mode

When dev registration is enabled, permissions may be bypassed for local testing — same pattern as [legal-api-permissions](../developer/legal-api-permissions.md). Production enforces all keys.

---

## 9. Related documents

| Document               | Path                                                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Reference architecture | [LAW-Trust-Accounting-Reference-Architecture.md](../architecture/LAW-Trust-Accounting-Reference-Architecture.md) |
| Workbench planning     | [LAW-Trust-Workbench-Planning.md](./LAW-Trust-Workbench-Planning.md)                                             |
| API permissions guide  | [legal-api-permissions.md](../developer/legal-api-permissions.md)                                                |

---

_LAW Trust Permissions — LAW-015-01 planning authority._
