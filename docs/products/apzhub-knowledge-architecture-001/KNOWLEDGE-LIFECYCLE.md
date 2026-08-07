# Knowledge Lifecycle — Organisational Memory

| Field     | Value                                |
| --------- | ------------------------------------ |
| Programme | APZHUB-KNOWLEDGE-ARCHITECTURE-001    |
| Status    | **COMPLETE**                         |
| Timestamp | 20260806T063000Z                     |
| Identity  | **Enterprise Organisational Memory** |

## Purpose

Define how organisational memory is **born, curated, approved, used, and retired**.

This is business architecture — not storage design, not AI, not search implementation.

---

## Lifecycle states

```text
Signal → Capture → Curate → Approve → Publish → Consume in context → Review → Retire / Supersede
```

| State                  | Meaning                                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| **Signal**             | Something worth remembering appears (lesson, decision rationale, procedure change, quality learning) |
| **Capture**            | A draft memory object is created (or a pointer to an external SoR is proposed for curation)          |
| **Curate**             | Editors shape memory into durable understanding — not a dump of raw files                            |
| **Approve**            | Designated approvers accept the memory as organisational truth _of understanding_                    |
| **Publish**            | Memory is available for discovery and in-context consumption                                         |
| **Consume**            | Users (and future consumers) encounter it where work happens                                         |
| **Review**             | Periodic or event-driven revalidation                                                                |
| **Retire / Supersede** | Memory is withdrawn or replaced; history may remain for audit of understanding                       |

---

## How knowledge is born

Organisational memory is born from **signals**, not from uploading everything.

| Birth pattern          | Example                                                                      |
| ---------------------- | ---------------------------------------------------------------------------- |
| Operational learning   | A Support pattern that keeps recurring                                       |
| Delivery learning      | A Project retrospective insight                                              |
| Process clarification  | Why a Workflow stage exists                                                  |
| Governance explanation | How a Law obligation is interpreted in practice (not the obligation itself)  |
| Quality learning       | An APZQEP friction / practice note worth institutionalising                  |
| Decision rationale     | Why a material decision was taken (reference to Analytics / Board artefacts) |

Raw documents, tickets, and policies are **sources**. They are not automatically memory.

---

## How knowledge evolves

| Evolution                   | Rule                                                       |
| --------------------------- | ---------------------------------------------------------- |
| Edit published memory       | Creates a new approved version or controlled revision      |
| Link to newer understanding | Prefer **supersede** over silent overwrite                 |
| Correct error               | Urgent correction path still requires accountable approval |
| Expand applicability        | Metadata / context tags change under curation rules        |

Memory evolves by **deliberate curation**, not by syncing every SoR change into Knowledge.

---

## How knowledge is approved

Approval means: “This is accepted organisational understanding for its stated scope.”

It does **not** mean: “This replaces Documents / Law / Projects truth.”

| Approval concern          | Outcome                                                                                   |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| Accuracy of understanding | Approver accountable for content of memory                                                |
| Scope / audience          | Who it applies to                                                                         |
| Conflict with SoR owners  | Must reference, not contradict, authoritative records — escalate to SoR owner if conflict |
| Sensitivity               | Permission / classification before publish                                                |

Governance roles: [KNOWLEDGE-GOVERNANCE.md](./KNOWLEDGE-GOVERNANCE.md)

---

## How knowledge becomes obsolete

| Trigger                                 | Action                                           |
| --------------------------------------- | ------------------------------------------------ |
| Process or policy change                | Review linked memory; update or retire           |
| Superseding lesson                      | Mark prior memory superseded                     |
| Time-based review fails                 | Retire or revise                                 |
| SoR owner withdraws referenced artefact | Re-evaluate memory; do not orphan false guidance |
| Product Board / domain owner directive  | Forced retire                                    |

Obsolete memory must not remain discoverable as current guidance.

---

## Non-lifecycle (explicit)

| Not part of this lifecycle      | Owner              |
| ------------------------------- | ------------------ |
| File versioning                 | Documents          |
| Policy versioning as SoR        | Law                |
| Ticket / project state machines | Support / Projects |
| Quality Flow states             | APZQEP             |
| Model training / RAG pipelines  | Not authorised     |
