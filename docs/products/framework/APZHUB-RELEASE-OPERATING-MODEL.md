# APZHUB Release Operating Model

| Field     | Value                                                                             |
| --------- | --------------------------------------------------------------------------------- |
| Status    | **IN FORCE**                                                                      |
| Timestamp | 20260806T194400Z                                                                  |
| Dual Mode | [APZHUB-CURSOR-DUAL-MODE.md](./APZHUB-CURSOR-DUAL-MODE.md) **IN FORCE**           |
| Kind      | Product Era operating model — supersedes capability-drip as default delivery unit |
| Authority | Owner / CPO direction — Product Era gear change                                   |

## Turning point

Architecture, governance, product definitions, native adoption, and product foundations are **complete**.

Default delivery unit is no longer:

```text
Capability-001 → Capability-002 → Capability-003
```

Default delivery unit is:

```text
Product Release N.x  →  next Product Release  →  Enterprise Release
```

Example sequence:

```text
APZ Projects Release 3.0
        ↓
APZ Workflow Release 3.0
        ↓
APZ Analytics Release 3.0
        ↓
APZ Knowledge Release 3.0
        ↓
APZ Support Release 3.0
        ↓
Enterprise Release 2026.1
```

## Role split

| Role                                        | Owns                                                                                                                        |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Chief Product Officer (Owner / advisor)** | Product Bible — vision, lived personas, journeys, UX, features, rules, security, reports, notifications, mobile, acceptance |
| **Cursor as Chief Engineer**                | **Design Support** while Bible authors; **Engineering** when Auth’d — impact, reuse, feasibility, migration, tests          |

CPO rule:

> Every instruction given to Cursor must be capable of producing **weeks** of engineering work — not hours.

Cursor rules:

> **Design Support:** analyse, gap, reuse, estimate, risk — never invent features or ship product scope.  
> **Engineering:** when Release or Prep Track is Owner-Authorised, **build**. Do not re-architect. Escalate only true conflicts with constitutional SoR / frozen architecture.

Product and Engineering evolve **together** — not Write → Wait → Engineer.

## What a Release PRS contains

Every release specification includes:

1. Executive Vision
2. User Personas
3. Complete UX (pages, panels, dialogs, menus, workflows, mobile)
4. Functional Specification (full behaviour — not summaries)
5. Data Model (business entities, relationships, ownership, lifecycle)
6. Business APIs
7. Enterprise Context (where / when / what)
8. AI (reserved — not implemented unless the PRS explicitly authorises)
9. Security (RBAC, permissions, approval, audit, visibility)
10. Reports & dashboards
11. Notifications
12. Mobile
13. Acceptance Criteria
14. Test Strategy
15. Release Checklist

Target scale for a major product release (indicative): 60–80 major features · 250–400 functional requirements · 100+ UI surfaces · complete journeys · RBAC per operation.

## What remains frozen

| Asset                                   | Status                                                       |
| --------------------------------------- | ------------------------------------------------------------ |
| Constitutional Architectural Principles | **IN FORCE**                                                 |
| Architecture as workstream              | **CLOSED**                                                   |
| Playbook                                | **UNCHANGED** unless Owner amends                            |
| Systems of Record ownership             | **UNCHANGED**                                                |
| Context is composed, never duplicated   | **IN FORCE**                                                 |
| AI as default                           | **Not authorised** unless a Release PRS explicitly scopes it |

Releases deepen products. They do not reopen foundation architecture.

## Relationship to prior modes

| Mode                             | Status                                                                                                          |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Capability-drip (Capability-00x) | **Superseded** as default                                                                                       |
| Operational Validation           | **Retired as default** — learning continues _inside_ releases (measure after ship)                              |
| CONTEXT-REVIEW-001 AI decision   | **Still in force** — AI stays out of Releases until a PRS explicitly includes it _and_ Board revisits readiness |
| Friction Register                | **Still authoritative** for reactive hotfix-class adjustments outside a release                                 |

## Authorisation

A Release begins only with Owner Authorisation naming:

- Product
- Release version
- PRS pack path
- Engineering: AUTHORISED

Then Cursor implements the authorised PRS to completion criteria in that pack.

## First release (active)

| Release                      | Pack                                                       | Status                                                                                       |
| ---------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **APZ Projects Release 3.0** | [../apzprojects/release-3.0/](../apzprojects/release-3.0/) | **Product Bible AUTHORING** — format emerges here; no meta-standard; engineering not started |

**No Product Specification Standard document.** The Projects Product Bible sets the template for every subsequent product.
