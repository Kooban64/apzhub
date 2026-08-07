# APZ Workflow — Product Mission

| Field     | Value                                    |
| --------- | ---------------------------------------- |
| Programme | APZ-WORKFLOW-000                         |
| Status    | **APPROVED**                             |
| Timestamp | 20260805T163000Z                         |
| Approval  | [OWNER-APPROVAL.md](./OWNER-APPROVAL.md) |

## Mission statement

> **APZ Workflow is the enterprise product that models, governs and visualises business processes** — giving the organisation one native APZHUB place to define and observe the journeys that connect work across Projects, Support, Time, Documents, and quality. It expresses **business intent**. Execution may happen elsewhere. Ownership of process definition stays here.

## Product identity

| APZ Workflow **is**                              | APZ Workflow is **not** |
| ------------------------------------------------ | ----------------------- |
| The product that models business processes       | An automation engine    |
| The product that governs process definition      | An integration platform |
| The product that visualises how work should move | An event bus            |
| Orchestration of **what should happen**          | A rules engine          |
|                                                  | A scheduler             |

**Workflow asks:** _What should happen?_  
**Automation asks:** _What runs?_

Keep those questions separate.

## Product purpose

APZ Workflow exists as the **Workflow Orchestration** enterprise capability of APZHUB — the enterprise glue across the operational backbone.

It orchestrates. It does **not** own:

- project plans (APZ Projects)
- service requests (APZ Support)
- time records (APZ Time)
- document lifecycle (APZ Documents)
- quality evidence / release decisions (APZQEP)

Those products remain Systems of Record for their domains. Workflow coordinates **business intent** across them.

**Workflow is not automation.** Automation is execution. That discipline mirrors APZQEP’s separation of orchestration from execution and must be preserved.

## The Workflow Test

See [WORKFLOW-TEST.md](./WORKFLOW-TEST.md). Every named workflow must be describable in business language without mentioning software.

## Primary users

| Audience                 | Role in the product                                                       |
| ------------------------ | ------------------------------------------------------------------------- |
| Process / ops designers  | Define and maintain business journeys that span products                  |
| Delivery & service leads | Rely on consistent handoffs without chasing people across tools           |
| Contributors             | Experience clear next steps in the context of their work                  |
| Quality / compliance     | See that governed journeys were followed                                  |
| Leaders                  | Trust that cross-product work proceeds with accountability and visibility |

## Primary business problem

Cross-product work still depends on tribal knowledge, chat, and informal handoffs: approve a project, create work, assign ownership, attach documents, record time, complete quality review. Without a governed orchestration product, the four mature Reference Implementations remain powerful but loosely coupled. APZ Workflow exists to make those journeys intentional, visible, and repeatable inside APZHUB.

## Product principles

1. **Intent, not prescription** — a workflow describes what the business intends to happen; it does not prescribe how technology makes it happen.
2. **Orchestration, not execution** — Workflow expresses business intent; it does not become the automation runtime brand.
3. **Glue, not SoR for everything** — other products keep their authoritative data; Workflow links by reference.
4. **Multiplies the backbone** — value comes from Projects, Support, Time, Documents, and APZQEP working together.
5. **Native APZHUB experience** — users never navigate a separate workflow-engine world.
6. **Engines stay invisible** — no automation-engine branding in product UX.
7. **Strong boundaries** — Workflow does not absorb Projects, Support, Time, Documents, or APZQEP.
8. **Business language** — pass the Workflow Test; reject implementation verbs in the product surface.

## Portfolio boundaries (clean stack)

| Layer        | Role                                     |
| ------------ | ---------------------------------------- |
| APZQEP       | Decides (quality / release assurance)    |
| APZ Workflow | Coordinates **business intent**          |
| Automation   | Executes (invisible implementation)      |
| Products     | Own business data (Projects, Support, …) |

## Product promise

If a cross-product journey is defined in APZ Workflow, people will know what should happen next, who owns the step, and which APZHUB products carry the work — without reconstructing the process from email and chat.

## Long-term vision

APZ Workflow becomes the trusted orchestration plane of APZHUB: the place organisations encode how work should flow across the operational backbone — and later Analytics and Law — while remaining a product, not a platform rewrite.

See also: [PRODUCT-VISION.md](./PRODUCT-VISION.md) · [VALUE-PROPOSITION.md](./VALUE-PROPOSITION.md) · [RELATIONSHIP-TO-REFERENCE-IMPLEMENTATIONS.md](./RELATIONSHIP-TO-REFERENCE-IMPLEMENTATIONS.md)
