# Product AI Standard (Definition Stage)

> **Programme:** APZHUB-PRODUCTS-003

## Purpose

Ensure AI scope is explicit before Architecture. AI is **opt-in** and Owner-gated for implementation.

## Definition requirements

Every product Definition must either:

**A)** Declare **AI out of scope** for the Definition horizon, with rationale, or  
**B)** Complete the AI section covering:

| Topic             | Content                                         |
| ----------------- | ----------------------------------------------- |
| AI capabilities   | User-visible outcomes                           |
| Prompt management | Ownership and change control intent             |
| AI assistants     | Surfaces and personas                           |
| Automation        | What AI may trigger (never bypass Authz)        |
| Recommendations   | Data sources and confidence handling            |
| Model routing     | Provider classes (self-hosted first preference) |
| Knowledge sources | Which SoRs / indexes; permission filtering      |
| Guardrails        | Disallowed actions; human-in-the-loop           |
| AI audit          | Logging and reviewability                       |
| Responsible AI    | Fairness, transparency, POPIA/GDPR alignment    |

## Binding rules

1. AI must not grant permissions or bypass Platform Authz.
2. AI must not call engines/connectors directly — Platform Services only.
3. AI features require named Implementation Approval even if Definition includes them.
4. Platform freezes (e.g. Email SoR, WebSockets) remain unless separately approved.
5. Knowledge retrieval must be permission-filtered (Search 020 alignment).

## Default

If unsure: mark AI **N/A — Phase 1 out of scope** rather than inventing capabilities.
