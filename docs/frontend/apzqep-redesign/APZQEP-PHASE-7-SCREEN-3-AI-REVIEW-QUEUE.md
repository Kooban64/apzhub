# APZQEP Phase 7 — Screen 3 visual authority (AI Review Queue)

**Record:** APZQEP REDESIGN / PHASE 7 / SCREEN 3 / AI REVIEW QUEUE / VISUAL AUTHORITY  
**Status:** **LOCKED** — design authority only. **DO NOT IMPLEMENT.**  
**Date:** 2026-08-20  
**Authority image:** [visuals/phase-7/03-ai-review-queue-authority.png](./visuals/phase-7/03-ai-review-queue-authority.png)

The attached visual is the **APPROVED DESIGN DIRECTION** for the APZQEP AI Review Queue. It is a **controlled quality-change review workspace**, not an inbox, not Screen 2 Generate & Analyse, and not a second quality SoR.

**Screen 2 creates proposals. Screen 3 governs acceptance of those proposals.**

Phases 1–6 remain **CLOSED**. Screens 1–2 remain **LOCKED**. Screen 4 is now **LOCKED**. Domain reconciliation is **NEXT** (not started). Phase 7 implementation is **NOT AUTHORISED**.

```text
SCREEN 1 — AI QUALITY COMPANION:
LOCKED

SCREEN 2 — GENERATE & ANALYSE:
LOCKED

SCREEN 3 — AI REVIEW QUEUE:
LOCKED

SCREEN 4 — AI QUALITY ANALYSIS / TRACEABILITY:
NEXT

PHASE 7 VISUAL DESIGN:
IN PROGRESS

DOMAIN RECONCILIATION:
NOT STARTED

PHASE 7 IMPLEMENTATION:
NOT AUTHORISED

PHASE 8:
NOT STARTED
```

Permanent product message:

**AI proposal — no authoritative APZQEP record changes until you approve an allowed action.**

---

# APZQEP REDESIGN — PHASE 7

# SCREEN 3 — AI REVIEW QUEUE

# VISUAL AUTHORITY ONLY — NO IMPLEMENTATION

The supplied image is visual authority for:

SCREEN 3 — AI REVIEW QUEUE

Record the visual.

Do NOT implement.

Do NOT create AI schemas, proposal tables, jobs, agents, orchestration,
vector stores, embeddings, model-provider abstractions, MCP services,
prompt stores, new permissions, new Source access, or new QEP business
records from this visual.

============================================================

1. PURPOSE
   \============================================================

The AI Review Queue is where an authorised human reviews AI proposals
before any write into an existing APZQEP authority.

Flow:

Proposal → Compare → Understand provenance → Accept / Modify / Reject

It is NOT:

an email inbox
a generic approval dashboard
a chatbot transcript
Screen 2 workbench
a path for silent production writes
blanket AI write authority

============================================================ 2. CORE LAYOUT — DESKTOP THREE-PANE
============================================================

LEFT — Review Queue
pending proposals, searchable / filterable

CENTRE — Proposed Change
structured comparison, not raw AI text

RIGHT — Review & Provenance
why proposed, sources used, Application, Source Access,
model/provider metadata, timestamp, reviewer controls

Do not collapse this into a single chat column or a mail-style inbox.

============================================================ 3. LEFT — REVIEW QUEUE
============================================================

Show proposal identity, target record/context, creator/model
provenance, age and status.

Types illustrated (product intents, not durable enums):

Test Case
Acceptance Criteria
User Story
Risk Draft
Trace Link
Exploratory Charter
UI/UX Criteria

Do NOT invent a closed proposal-type enum, status enum, or ID scheme
from the visual (TC-201, “Pending”, “Ready to Accept”, etc. are
illustrative).

No giant “apply everything” / bulk Accept control on this screen.
Bulk acceptance remains controlled and is a later reconciliation
question.

============================================================ 4. CENTRE — PROPOSED CHANGE
============================================================

Structured comparison rather than a wall of chatbot text.

For a Test Case example, show:

existing authoritative context
alongside
proposed Test Case structure
Title
Preconditions
Steps (Action / Test Data / Expected Result)
Verifies AC
Rationale

Changed / new content should be visually obvious.

The proposal remains labelled:

AI-generated proposal · Not an APZQEP record

A Risk Draft must resemble Phase 6 Quality Risk structure and remain
a proposal — not qep_quality_risk.

============================================================ 5. RIGHT — REVIEW & PROVENANCE
============================================================

Must make visible:

Why AI proposed it
Records / sources used
Application
Source Access
Model / provider metadata
Generated timestamp
Reviewer controls

Provenance is explainability, not a new Evidence SoR.

AI output itself is not automatically quality Evidence.

Exact persistence is NOT defined yet. Carry to reconciliation.

============================================================ 6. SOURCE ACCESS — NON-NEGOTIABLE
============================================================

Same freeze as Screens 1–2.

When source.read is absent, provenance shows:

Source Access: Not Authorised

Do not hide this.

This is visual proof across Screens 1–3 that AI cannot silently
escape the user's Source permissions.

AI MUST NOT retrieve Source indirectly, via another agent, or via
embeddings previously produced from unauthorised Source.

source.write, commit, branch, PR, merge, terminal, shell remain
NOT AUTHORISED.

============================================================ 7. PRIMARY ACTIONS
============================================================

Accept
Modify
Reject

These are the Screen 3 human-control verbs.

Do not add Save / Create Test Case / Create Risk as generic bypasses
of this screen. Screen 2 already forbids those.

Accept / Modify / Reject semantics for UI layout are established
here. Persistence, workflow states, and dual-approval (if any) are
NOT designed yet.

============================================================ 8. ACCEPT IS NEVER UNIVERSAL
============================================================

Accept does not mean “promote an AI record into a second SoR”.

Accept means a deliberate, type-specific write into the appropriate
EXISTING APZQEP authority — only where that write is allowed.

Examples of product behaviour (not implementation):

A Test Case proposal MAY be accepted into the existing Test Case SoR
by an authorised human.

A Risk proposal should present a tightly worded action such as
Create Risk from Proposal — not a generic Accept that implies any
proposal can become any record.

Gate evaluation, Certification, Certification Exception, and
readiness state MUST remain more tightly controlled.

AI still has NO authority to record:

GO
CONDITIONAL_GO
NO_GO
DEFER

AI still may NOT:

create an authoritative Gate evaluation
override a Blocking Gate
authorise a Certification Exception
create, accept, waive or close Quality Risks without a human
create or change Defects without a human
manufacture trace links silently

The mock caption “Accept will create/update the appropriate APZQEP
record” is illustrative. It does not authorise universal write.

============================================================ 9. MODIFY
============================================================

Modify means the human edits the proposal before any allowed
authoritative write.

It does not silently mutate the current SoR.

How modified proposals are represented is a domain-reconciliation
question. Do not invent a versioning store from this visual.

============================================================ 10. REJECT
============================================================

Reject means the proposal is not written to an authoritative SoR.

Whether rejected proposals are retained for audit is a
reconciliation question. Do not invent an AI reject ledger from
this visual.

============================================================ 11. SCREEN 1 vs 2 vs 3 vs 4
============================================================

SCREEN 1
entry, visible context, suggestions, lightweight Ask AI

SCREEN 2
creates proposals — Send to Review only

SCREEN 3
human review — THIS VISUAL

SCREEN 4
cross-domain quality intelligence / traceability
recommendations only

Do not collapse these into one screen.

============================================================ 12. EXISTING SORS REMAIN AUTHORITATIVE
============================================================

Phase 7 must not replace Phases 1–6 authorities.

A successful allowed Accept writes into the existing domain
(Test Case, Story, AC, Risk, etc.).

It does not create:

qep_ai_test_case
qep_ai_risk
parallel Defect store
parallel Certification store

============================================================ 13. CONTROL RULES (CARRIED FORWARD)
============================================================

AI ASSISTS. HUMANS DECIDE.

Proposal ≠ production record.

Current Readiness Posture remains Phase 6. No AI score.

Defect, Risk, Gate, Certification, Exception, Evidence and
traceability rules from Screens 1–2 remain frozen.

============================================================ 14. MOBILE
============================================================

Mobile is a staged workflow, not a squeezed three-pane:

Queue → Proposal → Comparison → Provenance → Decision

Do not compress the desktop workspace into one narrow column.

Same domain. Same permissions. Same Accept-is-not-universal rule.
Responsive presentation.

Light/dark geometry IDENTICAL within desktop and within mobile.
Theme changes appearance only.

============================================================ 15. SAMPLE DATA
============================================================

ALL values are illustrative, including:

proposal IDs (TC-201)
queue statuses
timestamps
REQ / AC identifiers
model name (OpenAI GPT-4o (Mock))
step tables
source lists

A model name on the mock does NOT authorise a provider.

============================================================ 16. HEADER / NAVIGATION
============================================================

Preserve the accepted APZQEP shell.

AI Review Queue belongs within APZQEP.

Do not replace the Application selector, navigation, search,
notifications, or platform shell.

Do not implement Phase 7 routes from this lock.

============================================================ 17. VISUAL LANGUAGE
============================================================

controlled quality-change review
purple AI accent
permanent “not a record until allowed action” message
visible Source Access boundary
structured native-looking proposal that is still not a record
light/dark parity
purpose-built mobile sequence

Do not turn this into an inbox, chatbot, or consumer AI interface.

============================================================ 18. DOMAIN QUESTIONS TO CARRY FORWARD
============================================================

Do NOT answer these yet.

Carry Screens 1–2 questions plus:

What is the minimum durable Proposal object after Send to Review?
Which proposal types may Accept into which existing SoR?
Which types require a specialised verb (Create Risk from Proposal)?
Which types cannot Accept at all (Gate / Certification)?
What AuthZ is required per Accept path?
How is Modify represented before write?
Are rejected proposals retained?
Is there any dual-review requirement?
How is bulk review constrained if ever allowed?
How does provenance attach without duplicating Evidence?

============================================================ 19. EXPLICITLY NOT AUTHORISED
============================================================

Do NOT implement:

Phase 7
AI backend / agent / autonomous agent
vector database / embeddings / RAG / model gateway
provider / MCP integration
AI proposal / conversation / audit store
new AI permissions
universal Accept
automatic Defects / Risks / Gate evaluations / Certification
AI readiness / AI scores
Source write / SSH / Terminal
Screen 4
Phase 8
repository typecheck remediation

============================================================ 20. RECORD
============================================================

Store the supplied visual as:

docs/frontend/apzqep-redesign/visuals/phase-7/
03-ai-review-queue-authority.png

Create:

docs/frontend/apzqep-redesign/
APZQEP-PHASE-7-SCREEN-3-AI-REVIEW-QUEUE.md

STOP.

Wait for Screen 4 visual authority.
