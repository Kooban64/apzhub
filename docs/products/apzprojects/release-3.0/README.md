# APZ Projects — Release 3.0 Product Bible

| Field           | Value                                                                                                                      |
| --------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Product         | **APZ Projects**                                                                                                           |
| Release         | **3.0**                                                                                                                    |
| Kind            | Product Bible + Engineering Execution                                                                                      |
| Status          | **ENGINEERING** — W002–W011 accepted                                                                                       |
| Engineering     | **AUTHORISED** — see [OWNER-AUTHORISATION.md](./OWNER-AUTHORISATION.md) · [ENGINEERING-STATUS.md](./ENGINEERING-STATUS.md) |
| Operating model | [../../framework/APZHUB-RELEASE-OPERATING-MODEL.md](../../framework/APZHUB-RELEASE-OPERATING-MODEL.md) **IN FORCE**        |
| Benchmark       | Leapfrog — not catch-up to Plane / Jira / Monday                                                                           |

## Intent

Design the world's best enterprise project platform — as if Atlassian, Microsoft and Linear started today with Enterprise Context available.

**Active design (authority):**

| Doc                                                                                                              | Status                                      |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| [design/W001-OPERATIONAL-OVERVIEW-AND-COCKPIT.md](./design/W001-OPERATIONAL-OVERVIEW-AND-COCKPIT.md)             | Locked                                      |
| [design/W002-OPERATIONAL-WORKSPACE.md](./design/W002-OPERATIONAL-WORKSPACE.md)                                   | **APPROVED WITH AMENDMENTS**                |
| [design/W003-PROJECT-LIFECYCLE.md](./design/W003-PROJECT-LIFECYCLE.md)                                           | **APPROVED WITH AMENDMENTS**                |
| [design/W004-OPERATIONAL-DELIVERY.md](./design/W004-OPERATIONAL-DELIVERY.md)                                     | **APPROVED WITH AMENDMENTS**                |
| [design/W005-PORTFOLIO-MANAGEMENT.md](./design/W005-PORTFOLIO-MANAGEMENT.md)                                     | **APPROVED WITH AMENDMENTS**                |
| [design/W006-RESOURCE-AND-TEAM-MANAGEMENT.md](./design/W006-RESOURCE-AND-TEAM-MANAGEMENT.md)                     | **APPROVED WITH AMENDMENTS**                |
| [design/W007-COMMUNICATION-AND-COLLABORATION.md](./design/W007-COMMUNICATION-AND-COLLABORATION.md)               | **APPROVED WITH AMENDMENTS**                |
| [design/W008-REPORTING-AND-OPERATIONAL-REVIEW.md](./design/W008-REPORTING-AND-OPERATIONAL-REVIEW.md)             | **APPROVED WITH AMENDMENTS**                |
| [design/W009-SEARCH-NAVIGATION-AND-PRODUCTIVITY.md](./design/W009-SEARCH-NAVIGATION-AND-PRODUCTIVITY.md)         | **APPROVED WITH AMENDMENTS**                |
| [design/W010-SECURITY-GOVERNANCE-AND-ADMINISTRATION.md](./design/W010-SECURITY-GOVERNANCE-AND-ADMINISTRATION.md) | **APPROVED WITH AMENDMENTS**                |
| [design/W011-UI-SYSTEM-AND-SCREEN-CATALOGUE.md](./design/W011-UI-SYSTEM-AND-SCREEN-CATALOGUE.md)                 | **APPROVED WITH AMENDMENTS** — UI authority |

**Engineering objective:** **Close APZ Projects Release 3.0** — [OWNER-AUTHORISATION.md](./OWNER-AUTHORISATION.md) · [RELEASE-3.0-CLOSEOUT.md](./RELEASE-3.0-CLOSEOUT.md) · [ENGINEERING-STATUS.md](./ENGINEERING-STATUS.md).

Four phases only: Product Experience → Production Readiness → Hardening → Release. No product context switch until **Production Ready**.

## Product Bible

| #   | Document                                                           | Status                     |
| --- | ------------------------------------------------------------------ | -------------------------- |
| —   | [OWNER-AUTHORISATION.md](./OWNER-AUTHORISATION.md)                 | **Engineering AUTHORISED** |
| 00  | [00-VISION.md](./00-VISION.md)                                     | Empty — CPO                |
| 01  | [01-PERSONAS.md](./01-PERSONAS.md)                                 | Empty — CPO                |
| 02  | [02-JOBS-TO-BE-DONE.md](./02-JOBS-TO-BE-DONE.md)                   | Empty — CPO                |
| 03  | [03-USER-JOURNEYS.md](./03-USER-JOURNEYS.md)                       | Empty — CPO                |
| 04  | [04-INFORMATION-ARCHITECTURE.md](./04-INFORMATION-ARCHITECTURE.md) | Empty — CPO                |
| 05  | [05-SCREEN-CATALOGUE.md](./05-SCREEN-CATALOGUE.md)                 | Empty — CPO                |
| 06  | [06-FEATURE-CATALOGUE.md](./06-FEATURE-CATALOGUE.md)               | Empty — CPO                |
| 07  | [07-BUSINESS-RULES.md](./07-BUSINESS-RULES.md)                     | Empty — CPO                |
| 08  | [08-PERMISSIONS.md](./08-PERMISSIONS.md)                           | Empty — CPO                |
| 09  | [09-NOTIFICATIONS.md](./09-NOTIFICATIONS.md)                       | Empty — CPO                |
| 10  | [10-REPORTS.md](./10-REPORTS.md)                                   | Empty — CPO                |
| 11  | [11-DASHBOARDS.md](./11-DASHBOARDS.md)                             | Empty — CPO                |
| 12  | [12-MOBILE.md](./12-MOBILE.md)                                     | Empty — CPO                |
| 13  | [13-ENTERPRISE-CONTEXT.md](./13-ENTERPRISE-CONTEXT.md)             | Empty — CPO                |
| 14  | [14-API-BEHAVIOUR.md](./14-API-BEHAVIOUR.md)                       | Empty — CPO                |
| 15  | [15-ACCEPTANCE-CRITERIA.md](./15-ACCEPTANCE-CRITERIA.md)           | Empty — CPO                |
| —   | [RELEASE-PLAN.md](./RELEASE-PLAN.md)                               | Empty — CPO                |

Each document must be **complete**, not an outline.  
Cursor must not invent buttons, workflows, validation, permissions, reports, mobile, or notifications not specified here.

## Explicitly out of scope (Release 3.0)

- AI / RAG / copilots (reserved for a later Board-authorised release)
- Reopening platform architecture
- Other products’ Release 3.0 in parallel

## Working rule — Dual Mode

| Role   | Mode                             | Does                                                                                      |
| ------ | -------------------------------- | ----------------------------------------------------------------------------------------- |
| CPO    | Product                          | Designs the Product Bible (experience-first)                                              |
| Cursor | **Design Support** (default now) | Code analysis · gaps · reuse · effort · risks · prep proposals — **no product invention** |
| Cursor | **Engineering**                  | Builds when Release or Prep Track is AUTHORISED                                           |

Design Support pack: [design-support/](./design-support/)  
Dual Mode standard: [../../framework/APZHUB-CURSOR-DUAL-MODE.md](../../framework/APZHUB-CURSOR-DUAL-MODE.md)

## Sequence after this Bible

Projects 3.0 → Workflow 3.0 → Analytics 3.0 → Knowledge 3.0 → Support → Time → Documents → Law → Enterprise Release
