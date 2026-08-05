# Work Definition — APZHUB

| Field     | Value                 |
| --------- | --------------------- |
| Programme | APZHUB-CAPABILITY-001 |
| Status    | **COMPLETE**          |
| Timestamp | 20260805T083000Z      |
| Kind      | Capability definition |

## What is “work” inside APZHUB?

> **Work is any actionable unit of organisational effort that a person or role must complete, decide, review, or account for inside APZHUB.**

Work is not an application.  
Work is not a menu.  
Work is not an implementation system.

A person should be able to say what they must do today **without naming which product produced the item**.

## Work item (canonical)

Every work item in APZHUB is:

| Attribute     | Meaning                                              |
| ------------- | ---------------------------------------------------- |
| Intent        | What outcome is expected                             |
| Actor         | Who must act (or who is accountable)                 |
| State         | Where it sits in a shared lifecycle                  |
| Urgency       | How soon attention is required                       |
| Context       | What organisational situation it belongs to          |
| Evidence link | What proves progress or completion (when applicable) |

## Work kinds (capability vocabulary)

These names are platform language. They are not product labels.

| Work kind          | Plain meaning                                         |
| ------------------ | ----------------------------------------------------- |
| **Action**         | Something assigned that must be done                  |
| **Request**        | Help or service needed from someone                   |
| **Approval**       | A decision that unblocks someone else                 |
| **Quality action** | A quality / release / evidence duty                   |
| **Review**         | Assessment of an artefact or decision                 |
| **Record**         | An accountability entry (effort, decision, note)      |
| **Risk**           | Something that needs monitoring or mitigation         |
| **Decision**       | A recorded choice with consequences                   |
| **Deliverable**    | An outcome artefact the organisation expects          |
| **Coordination**   | Planning or sequencing work that organises other work |

Examples of how these appear in daily language (still without product branding):

- “Finish this action”
- “Respond to this request”
- “Approve this release”
- “Complete this quality action”
- “Review this document”
- “Record today’s effort”
- “Track this risk”
- “Capture this decision”
- “Close this deliverable”

## What is not “work”

| Not work                     | Why                                     |
| ---------------------------- | --------------------------------------- |
| A product module itself      | Products are vehicles; work is the unit |
| A navigation destination     | Menus are not obligations               |
| A background sync job        | No human actor                          |
| Raw implementation telemetry | Infrastructure, not organisational work |
| Engine or adapter entities   | Invisible; never user-facing            |

## Unifying rule

If an item can appear in **My Work**, it is work.  
If it cannot be owned, acted on, or completed by a person or role, it is not work in this model.

## Success test for this definition

The organisation can explain “what is work inside APZHUB” using the vocabulary above — without naming individual products or implementation systems.
