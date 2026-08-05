# APZHUB Enterprise Operating Model

| Field     | Value                |
| --------- | -------------------- |
| Programme | APZHUB-PORTFOLIO-001 |
| Status    | **IN FORCE**         |
| Timestamp | 20260805T081000Z     |
| Kind      | Portfolio governance |

## Platform identity (commercial)

> **APZHUB is an Enterprise Productivity Platform that delivers integrated business capabilities through a portfolio of native products operating under a common identity, quality, and operational model.**

| APZHUB is                                  | APZHUB is not                                |
| ------------------------------------------ | -------------------------------------------- |
| An enterprise productivity platform        | A portal, launcher, or app switcher          |
| A portfolio of native products             | A collection of engine wrappers              |
| One identity, workspace, and quality model | Separate logins, consoles, or quality tracks |
| Capability-led for executives              | Engine-led or integration-led for users      |

## Architecture posture (described, not redesigned)

```text
Enterprise Platform
        │
        ▼
Business Capabilities
        │
        ▼
Native Products
        │
        ▼
Implementation Engines (invisible)
```

This replaces the earlier mental model of Portal → Integrations → Products.

## How the platform operates

| Layer                     | Responsibility                                            |
| ------------------------- | --------------------------------------------------------- |
| Enterprise Standards      | Constitution, APZQEP, Native Adoption Standard, Playbook  |
| Portfolio Operating Model | How APZHUB behaves as one platform (this document family) |
| Enterprise Capabilities   | What the business buys into                               |
| Native Products           | How users experience capabilities day to day              |
| Implementation Engines    | Behind adapters — never user-facing                       |

## Product relationships (operational)

Products collaborate around **work**, not around engines.

| Relationship                        | Operational meaning                                            |
| ----------------------------------- | -------------------------------------------------------------- |
| Projects ↔ Time                     | Delivery work consumes and accounts for effort                 |
| Projects ↔ Support                  | Delivery issues become service requests without leaving APZHUB |
| Support ↔ Projects                  | Service context can reference delivery work                    |
| All products ↔ APZQEP               | Every change follows one quality and release discipline        |
| All products ↔ Identity / Workspace | One session, one shell, one permission model                   |

Technical integration paths remain governed by foundation docs (008–010). This model describes **how people use the portfolio together**.

## Platform promises (operating principles)

| Promise                 | Meaning                                             |
| ----------------------- | --------------------------------------------------- |
| One identity            | Single APZHUB sign-in; no product-local logins      |
| One navigation          | Activity Bar → Sidebar → Workspace → Context        |
| One search              | Unified Platform Search, permission-filtered        |
| One notification centre | Attention owned by platform, not each product       |
| One workspace           | Shared desktop shell and sessions                   |
| One quality platform    | APZQEP for every engineering change                 |
| One audit trail         | Platform-owned audit; products do not invent theirs |

Detailed experience principles: [PLATFORM-EXPERIENCE-PRINCIPLES.md](./PLATFORM-EXPERIENCE-PRINCIPLES.md)

## Cross-product experiences (platform-owned)

Surfaces such as **My Work**, **My Approvals**, **My Notifications**, **My Documents**, **My Projects**, **My Tickets**, and **My Time** belong to **APZHUB**, not to a single product catalogue entry.

They may be _fed_ by products; they are not owned as product silos. Implementation remains separately authorised.

## Evidence basis

| RI   | Product      | Proves                                |
| ---- | ------------ | ------------------------------------- |
| #001 | APZ Time     | Native + APZQEP path works            |
| #002 | APZ Support  | Path is repeatable                    |
| #003 | APZ Projects | Path is stable across a third product |

## What this model does not do

- Does not authorise new shared services
- Does not redesign Native Adoption or APZQEP
- Does not select the fourth product (use Capability Model + QPR)
- Does not expose engines or adapters to users or executives
