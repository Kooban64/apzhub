# Platform Admin — shell & information architecture

| Field  | Value                    |
| ------ | ------------------------ |
| Status | **LOCKED**               |
| Parent | [README.md](./README.md) |

## 1. Overall shell

Dense professional administration console — **not** a marketing dashboard.

```text
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ APZ  PLATFORM ADMIN                                      🔍 Search     🔔     Kooban ▾   │
├──────────────────────┬───────────────────────────────────────────────────────────────────┤
│                      │                                                                   │
│  ◈ Overview          │                                                                   │
│                      │                                                                   │
│  CUSTOMERS           │                                                                   │
│  ▣ Tenants           │                                                                   │
│  ◫ Subscriptions     │                         PAGE                                      │
│  ◇ Marketplace       │                       CONTENT                                     │
│  ▤ Billing           │                                                                   │
│                      │                                                                   │
│  PLATFORM            │                                                                   │
│  ▦ Products          │                                                                   │
│  ⟳ Provisioning      │                                                                   │
│  ◉ Providers         │                                                                   │
│  ⚙ Configuration     │                                                                   │
│                      │                                                                   │
│  OPERATIONS          │                                                                   │
│  ◌ Operations        │                                                                   │
│  ⚠ Incidents         │                                                                   │
│  ⌁ Jobs & Queues     │                                                                   │
│                      │                                                                   │
│  GOVERNANCE          │                                                                   │
│  ♙ Identity & Access │                                                                   │
│  ◈ Security          │                                                                   │
│  ✓ Compliance        │                                                                   │
│  ≡ Audit             │                                                                   │
│                      │                                                                   │
│  ─────────────────   │                                                                   │
│  ? Help              │                                                                   │
│  ⚙ Settings          │                                                                   │
│                      │                                                                   │
├──────────────────────┴───────────────────────────────────────────────────────────────────┤
│ APZ Platform   ● Healthy       Production                         v1.x                    │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

### Chrome regions

| Region     | Contents                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------- |
| Header     | Product mark `APZ` · shell title `PLATFORM ADMIN` · global search · notifications · user menu |
| Sidebar    | Compact primary nav only (see §3)                                                             |
| Workspace  | Page title · secondary tabs (section-local) · filters · content                               |
| Status bar | Platform identity · overall health · environment · version                                    |

---

## 2. Full menu hierarchy (IA — not all visible in sidebar)

```text
PLATFORM ADMIN

Overview


CUSTOMERS

Tenants
 ├─ All Tenants
 ├─ Trials
 ├─ Active
 ├─ Suspended
 └─ Provisioning Issues

Subscriptions
 ├─ Subscriptions
 ├─ Plans
 ├─ Licence Usage
 └─ Entitlements

Marketplace
 ├─ Products
 ├─ Orders
 └─ Catalogue

Billing
 ├─ Overview
 ├─ Invoices
 ├─ Payments
 └─ Billing Issues


PLATFORM

Products
 ├─ Product Catalogue
 ├─ APZQEP
 ├─ APZPEN
 └─ APZPRD

Provisioning
 ├─ Overview
 ├─ Queue
 ├─ Failures
 └─ History

Providers
 ├─ Overview
 ├─ Integrations
 ├─ Health
 └─ Provider Mappings

Configuration
 ├─ Platform
 ├─ Features
 ├─ Email
 ├─ Notifications
 └─ Commercial


OPERATIONS

Operations
 ├─ Platform Health
 ├─ Services
 └─ Diagnostics

Incidents
 ├─ Active
 └─ History

Jobs & Queues
 ├─ Jobs
 ├─ Queues
 └─ Failures


GOVERNANCE

Identity & Access
 ├─ Platform Administrators
 ├─ Platform Roles
 ├─ Privileged Access
 └─ Sessions

Security
 ├─ Overview
 ├─ Authentication
 ├─ Security Events
 └─ Access Reviews

Compliance
 ├─ Overview
 ├─ Controls
 ├─ Evidence
 └─ Retention

Audit
 ├─ Platform Audit
 ├─ Administrative Changes
 ├─ Tenant Access
 └─ Exports


SYSTEM

Settings
Help
```

**Rule:** Do **not** permanently expand every child in the sidebar.

---

## 3. Actual sidebar (compact)

Default render:

```text
┌─────────────────────────┐
│ APZ                     │
│ PLATFORM ADMIN          │
│                         │
│ ◈ Overview              │
│                         │
│ CUSTOMERS               │
│ ▣ Tenants               │
│ ◫ Subscriptions         │
│ ◇ Marketplace           │
│ ▤ Billing               │
│                         │
│ PLATFORM                │
│ ▦ Products              │
│ ⟳ Provisioning          │
│ ◉ Providers             │
│ ⚙ Configuration         │
│                         │
│ OPERATIONS              │
│ ◌ Operations            │
│ ⚠ Incidents             │
│ ⌁ Jobs & Queues         │
│                         │
│ GOVERNANCE              │
│ ♙ Identity & Access     │
│ ◈ Security              │
│ ✓ Compliance            │
│ ≡ Audit                 │
│                         │
│                         │
│ ? Help                  │
│ ⚙ Settings              │
└─────────────────────────┘
```

### Secondary navigation (in workspace)

When entering a section, children become **workspace tabs / subnav**, not sidebar explosion.

Example — Tenants:

```text
TENANTS

All Tenants    Trials    Active    Suspended    Provisioning Issues
────────────────────────────────────────────────────────────────────
```

Same pattern for Subscriptions, Billing, Provisioning, Providers, Identity & Access, Audit, etc.

---

## 4. Navigation principles

| Principle               | Rule                                         |
| ----------------------- | -------------------------------------------- |
| Compact sidebar         | Top-level sections only                      |
| Section tabs            | Children of the active section               |
| Deep links              | URL encodes section + tab + entity id        |
| Keyboard                | Tables, drawers, and search first-class      |
| No APZOR special casing | APZOR is a normal tenant row                 |
| Permission-filtered     | Sidebar + search respect Platform Admin role |
