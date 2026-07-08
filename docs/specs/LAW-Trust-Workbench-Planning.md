# LAW — Trust Workbench Planning

> **Milestone:** LAW-015 — Trust Accounting  
> **Story:** LAW-015-01 (planning authority)  
> **Status:** **UX planning only** — no React, no implementation  
> **Authority:** [APZHUB-Workbench-Development-Guide](../governance/APZHUB-Workbench-Development-Guide.md) · [LAW-Trust-Accounting-Reference-Architecture](../architecture/LAW-Trust-Accounting-Reference-Architecture.md)  
> **Last updated:** 2026-07-06

---

## 1. Purpose

Plan future Workbench modules for Trust Accounting: workspaces, navigation, views, actions, and user journeys. Implementation deferred to **LAW-015-09** after ledger and transaction foundations.

---

## 2. Workbench integration rules

| Rule                | Source                                                         |
| ------------------- | -------------------------------------------------------------- |
| Declare in manifest | `workbench.navigation`, `workbench.views`, `workbench.actions` |
| No shell fork       | Use Desktop Shell regions only                                 |
| Permission-driven   | Every view/action binds `legal.trust.*` keys                   |
| Activity timeline   | Matter and client views enable trust activity tab              |
| Knowledge           | Trust search via TrustKnowledgeProvider                        |

---

## 3. Workspace structure

```text
Activity Bar
  └── legal.trust (Trust Accounting workspace)
        Sidebar
          ├── Dashboard
          ├── Trust Accounts
          ├── Transactions
          ├── Reconciliation
          ├── Reports
          ├── Statements
          └── Audit
```

**Workspace id:** `legal.trust`  
**Label:** Trust Accounting  
**Icon:** trust / vault (design system token)  
**Required permission:** `legal.trust.view`

---

## 4. Module specifications

### 4.1 Trust Dashboard

| Attribute      | Value                               |
| -------------- | ----------------------------------- |
| **View id**    | `legal.trust.dashboard`             |
| **Purpose**    | Firm-level trust health at a glance |
| **Permission** | `legal.trust.view`                  |

**Widgets (planned):**

- Total firm trust balance (by currency)
- Unreconciled accounts count
- Open reporting periods
- Recent large withdrawals
- Deposits awaiting allocation
- Reconciliation due alerts (from notifications)

**Actions:** Navigate to account, start reconciliation, quick deposit (if `legal.trust.post`)

---

### 4.2 Trust Accounts

| Attribute       | Value                                                       |
| --------------- | ----------------------------------------------------------- |
| **View id**     | `legal.trust.accounts.list` / `legal.trust.accounts.detail` |
| **Purpose**     | Manage trust bank accounts and view account ledger summary  |
| **Permissions** | view; manage for create/edit                                |

**List columns:** Code, name, institution, currency, ledger balance, last reconciled, status

**Detail tabs:**

- Overview (balance, profile, institution)
- Journal (read-only entry list)
- Allocations by client/matter
- Reconciliations history

**Actions:** `legal.trust.account.create`, close account (manage + zero balance)

---

### 4.3 Trust Transactions

| Attribute       | Value                                                               |
| --------------- | ------------------------------------------------------------------- |
| **View id**     | `legal.trust.transactions.list` / `legal.trust.transactions.detail` |
| **Purpose**     | Create drafts, post, reverse, filter all trust movements            |
| **Permissions** | view; post; reverse                                                 |

**List filters:** Account, client, matter, type, date range, status, reference

**Create flows:**

- Deposit (receipt)
- Withdrawal (payment)
- Transfer
- Adjustment

**Detail:** Transaction metadata, journal entry link, allocation breakdown, audit trail, reverse action

---

### 4.4 Trust Reconciliation

| Attribute      | Value                                                                      |
| -------------- | -------------------------------------------------------------------------- |
| **View id**    | `legal.trust.reconciliation.list` / `legal.trust.reconciliation.workspace` |
| **Purpose**    | Three-way reconciliation workflow                                          |
| **Permission** | `legal.trust.reconcile`                                                    |

**Workspace layout:**

- Panel 1: Bank statement balance entry / import placeholder
- Panel 2: Ledger balance (computed)
- Panel 3: Allocation sum (computed)
- Variance items list with resolution actions

**States:** Visual progress open → in progress → completed

---

### 4.5 Trust Reports

| Attribute      | Value                             |
| -------------- | --------------------------------- |
| **View id**    | `legal.trust.reports`             |
| **Purpose**    | Regulatory and management reports |
| **Permission** | `legal.trust.report`              |

**Report catalogue (planned):**

- Trust account summary
- Client trust balance listing
- Matter trust balance listing
- Unallocated funds report
- Period activity report
- Examiner export (ZA-LPC profile)

---

### 4.6 Trust Statements

| Attribute      | Value                                         |
| -------------- | --------------------------------------------- |
| **View id**    | `legal.trust.statements`                      |
| **Purpose**    | Generate and retrieve client trust statements |
| **Permission** | `legal.trust.report`                          |

**Flow:** Select client → optional matter → period → preview → generate → download/email (email deferred)

---

### 4.7 Trust Audit

| Attribute      | Value                                      |
| -------------- | ------------------------------------------ |
| **View id**    | `legal.trust.audit`                        |
| **Purpose**    | Searchable trust audit trail for examiners |
| **Permission** | `legal.trust.audit`                        |

**Features:** Filter by user, entity, account, date; export CSV; link to journal entries and platform action audit

---

## 5. Cross-module integration views

| Location              | Enhancement                                               |
| --------------------- | --------------------------------------------------------- |
| **Matter workspace**  | Trust balance tab; recent trust activity timeline         |
| **Client detail**     | Client trust balance summary; link to statements          |
| **Billing / Invoice** | Apply trust balance to invoice; show trust applied amount |
| **Dashboard (firm)**  | Trust summary widget (optional)                           |

---

## 6. Command palette actions

| Action                   | Shortcut candidate | Permission              |
| ------------------------ | ------------------ | ----------------------- |
| Post trust deposit       | —                  | `legal.trust.post`      |
| Start reconciliation     | —                  | `legal.trust.reconcile` |
| Generate trust statement | —                  | `legal.trust.report`    |
| Go to trust dashboard    | —                  | `legal.trust.view`      |

Registered in `workbench.actions[]` — surfaces: command palette, toolbar (trust workspace context).

---

## 7. Knowledge provider

**TrustKnowledgeProvider** (LAW-015-11):

- Index: trust accounts, transaction references, narratives, client names
- Scope: tenant-filtered; permission `legal.trust.view`
- Result actions: navigate to transaction detail, open matter trust tab

---

## 8. Notification experiences

See [LAW-Trust-Events.md](./LAW-Trust-Events.md) § Notification routes.

Panel badges for unreconciled accounts and overdue periods on Trust workspace Activity Bar entry.

---

## 9. Accessibility and UX standards

- Follow [006 Enterprise Design System](../006-enterprise-design-system-ui-standards.md)
- Currency formatting locale-aware; always show currency code for trust amounts
- Destructive actions (reverse, fee transfer) require confirmation dialog with narrative
- Balance displays use semantic success/warning for reconciliation variance

---

## 10. Implementation phasing

| Story      | Deliverable                                          |
| ---------- | ---------------------------------------------------- |
| LAW-015-09 | Trust workspace scaffold + Dashboard + Accounts list |
| LAW-015-09 | Transactions view (read-only first, then post flows) |
| LAW-015-09 | Reconciliation workspace                             |
| LAW-015-09 | Reports, Statements, Audit views                     |
| LAW-015-11 | Matter/client trust tabs; Knowledge provider         |

---

## 11. Related documents

| Document               | Path                                                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Reference architecture | [LAW-Trust-Accounting-Reference-Architecture.md](../architecture/LAW-Trust-Accounting-Reference-Architecture.md) |
| Permissions            | [LAW-Trust-Permissions.md](./LAW-Trust-Permissions.md)                                                           |
| Workbench guide        | [APZHUB-Workbench-Development-Guide](../governance/APZHUB-Workbench-Development-Guide.md)                        |

---

_LAW Trust Workbench Planning — LAW-015-01. No UI implementation._
