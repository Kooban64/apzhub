# APZHUB Enterprise Operating Model

| Field     | Value                     |
| --------- | ------------------------- |
| Programme | APZHUB-PORTFOLIO-001      |
| Status    | **IN FORCE**              |
| Timestamp | 20260805T105500Z          |
| Kind      | Portfolio governance      |
| Era       | **Operational evolution** |

## Platform identity (commercial)

> **APZHUB is an Enterprise Productivity Platform that presents work—not applications—to its users. Native products remain the authoritative owners of business data, while the platform composes a unified work experience, common identity, common quality model, and shared operational standards.**

## Frozen investment principles

> **APZHUB answers “What do I need to do?”**  
> **Products answer “How do I do it?”**

> **Every new capability must eliminate measurable operational friction, not simply add functionality.**

Together these filter every future investment. Functionality without friction reduction is not authorised as a portfolio capability.

Latest milestone: [../framework/APZHUB-PLATFORM-PHASE-2-UNIFIED-EXPERIENCE.md](../framework/APZHUB-PLATFORM-PHASE-2-UNIFIED-EXPERIENCE.md).

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

## Operational evolution loop (competitive advantage)

APZHUB is in its **operational evolution era**. The platform evolves like a controlled experiment—not by idle engineering or governance theatre.

```text
Users work
        │
        ▼
My Work Review
        │
        ▼
Operational Learning
        │
        ▼
Evidence
        │
        ▼
Portfolio Review
        │
        ▼
One approved investment
        │
        ▼
Release
        │
        ▼
Repeat
```

| Avoid                                     | Why                                |
| ----------------------------------------- | ---------------------------------- |
| Engineering because the team is idle      | Complexity without evidence        |
| Governance because it feels like progress | Documents without decision quality |

Team filter:

> **Don’t ask “What can we build?” Ask “What made someone’s work harder today?”**

Standing review: [../framework/APZHUB-MY-WORK-REVIEW.md](../framework/APZHUB-MY-WORK-REVIEW.md).

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
