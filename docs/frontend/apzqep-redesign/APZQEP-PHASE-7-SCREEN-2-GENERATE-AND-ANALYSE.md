# APZQEP Phase 7 — Screen 2 visual authority (Generate & Analyse)

**Record:** APZQEP REDESIGN / PHASE 7 / SCREEN 2 / GENERATE & ANALYSE / VISUAL AUTHORITY  
**Status:** **LOCKED** — design authority only. **DO NOT IMPLEMENT.**  
**Date:** 2026-08-20  
**Authority image:** [visuals/phase-7/02-generate-and-analyse-authority.png](./visuals/phase-7/02-generate-and-analyse-authority.png)

The attached visual is the **APPROVED DESIGN DIRECTION** for APZQEP Generate & Analyse. It is the deliberate **AI workbench**, not another dashboard, not Screen 1 Ask AI, and not Screen 3 Review.

**Screen 2 creates proposals. Screen 3 governs acceptance of those proposals.**

Phases 1–6 remain **CLOSED**. Screen 1 remains **LOCKED**. Screens 3–4 are **LOCKED**. Domain reconciliation is **NEXT** (not started). Phase 7 implementation is **NOT AUTHORISED**.

```text
SCREEN 1 — AI QUALITY COMPANION:
LOCKED

SCREEN 2 — GENERATE & ANALYSE:
LOCKED

SCREEN 3 — AI REVIEW QUEUE:
NEXT

SCREEN 4 — AI QUALITY ANALYSIS / TRACEABILITY:
PENDING

PHASE 7 VISUAL DESIGN:
IN PROGRESS

DOMAIN RECONCILIATION:
NOT STARTED

PHASE 7 IMPLEMENTATION:
NOT AUTHORISED

PHASE 8:
NOT STARTED
```

---

# APZQEP REDESIGN — PHASE 7

# SCREEN 2 — GENERATE & ANALYSE

# VISUAL AUTHORITY ONLY — NO IMPLEMENTATION

The supplied image is visual authority for:

SCREEN 2 — GENERATE & ANALYSE

Record the visual.

Do NOT implement.

Do NOT create AI schemas, proposal tables, jobs, agents, orchestration,
vector stores, embeddings, model-provider abstractions, MCP services,
prompt stores, new permissions, new Source access, or new QEP business
records from this visual.

============================================================

1. PURPOSE
   \============================================================

Generate & Analyse is APZQEP's deliberate AI workbench.

It is where an authorised user asks AI to generate quality-artefact
PROPOSALS or to analyse authorised quality facts.

It is NOT:

a second Companion dashboard
a generic chatbot
a full-screen chat application
an IDE copilot
Screen 3 Review Queue
a path to silent production writes

============================================================ 2. CORE LAYOUT
============================================================

Desktop composition:

LEFT
what the user wants AI to do
(Generate | Analyse task selection)

CENTRE
authorised context

- instruction workspace

RIGHT
generated proposal / analysis output
with provenance
and explicit Send to Review

Do not collapse this into a single chat column.

============================================================ 3. OPERATING FLOW
============================================================

Select task
↓
Select authorised context
↓
Generate / Analyse
↓
Inspect proposal
↓
Send to Review

Screen 2 stops at Send to Review.

Accept / Modify / Reject belong to Screen 3.

============================================================ 4. TWO MODES — ONE WORKSPACE
============================================================

Generate and Analyse are two modes of the SAME workspace.

They are not two AI products.

GENERATE
produces candidate artefacts (proposals)

ANALYSE
produces findings and possible follow-up proposals

Mode switch is a segmented control on this screen.

Do not create two backends, two stores, or two permission families
from the two modes.

============================================================ 5. GENERATE TASKS
============================================================

The visual establishes conceptual Generate targets:

User Stories
Acceptance Criteria
Test Cases
Test Steps
Test Suites
Test Plan Content
Exploratory Charter
UI/UX Criteria
Risk Draft

These are PRODUCT INTENTS.

Do not create nine AI services, nine tables, or a closed enum from
the visual.

Exact authorised targets remain a domain-reconciliation question
after Screen 4.

============================================================ 6. ANALYSE TASKS
============================================================

The visual / lock establishes conceptual Analyse targets:

Coverage Gaps
Traceability Gaps
Failed Tests
Evidence Gaps
Defect Patterns
Risk Candidates
Requirement / Test Alignment

These are PRODUCT INTENTS, not gap-type enums.

Analyse does not modify the facts it inspects.

============================================================ 7. PROPOSAL ≠ PRODUCTION RECORD
============================================================

Every generated result is a PROPOSAL until Screen 3 acceptance.

The visual must remain labelled:

AI-generated proposal · Not an APZQEP record

PROPOSAL badge is product behaviour, not decoration.

Do not allow Screen 2 output to masquerade as:

Requirement
Story
AC
Test Case
Suite
Plan
Exploratory Session
UI/UX criterion
Issue
Defect
Quality Risk
Gate evaluation
Certification

============================================================ 8. NO BYPASS OF SCREEN 3
============================================================

Screen 2 actions are:

Regenerate
Refine
Discard
Send to Review

There is NO:

Save
Create Test Case
Create Risk
Create Defect
Create Requirement
Accept
Publish
Commit to SoR

Those would bypass Screen 3.

============================================================ 9. STRUCTURED OUTPUT — NOT CHAT WALL
============================================================

Generated Result is APZQEP-native structured output, not a wall of
chatbot text.

Example — Test Case proposal visually resembles Test Case structure:

Title
Preconditions
Steps (Action / Test Data / Expected Result)
Verifies AC
Rationale

and remains labelled PROPOSAL.

Example — Risk Draft visually resembles Phase 6 Quality Risk
structure and remains a proposal. It does not write
qep_quality_risk.

============================================================ 10. AUTHORISED CONTEXT
============================================================

Reuse existing Application selector / qep_application.

AI context is bounded by the selected Application.

Environment may be selected where relevant.

Scope may include selected:

Requirements
Stories
Acceptance Criteria
Test Cases

Do not create an AI Application context store.

Counts and selected IDs in the visual (REQ-142, AC-142-1, etc.) are
illustrative. Do not seed them.

============================================================ 11. SOURCE ACCESS — NON-NEGOTIABLE
============================================================

Same freeze as Screen 1.

When source.read is absent, the workspace shows:

Source Access: Not Authorised

Do not hide this.

The user may still generate Test Cases from Requirements / ACs
without Source access.

AI MUST NOT claim it inspected implementation code, repository
files, commits, or Source workspace content.

AI MUST NOT retrieve Source indirectly, via another agent, or via
embeddings previously produced from unauthorised Source.

If source.read is independently granted, later UI may indicate
Source context is available. That requires domain reconciliation.

source.write, commit, branch, PR, merge, terminal, shell remain
NOT AUTHORISED.

============================================================ 12. INSTRUCTION BOX
============================================================

The engineer states what to generate or investigate.

Example prompts in the visual are illustrative only.

Do not seed them as product workflows.

Do not expose prompt engineering as product IA.

============================================================ 13. WHY / SOURCES USED
============================================================

Every meaningful result must be able to show which authorised
records informed it.

This is provenance of context, not a new Evidence SoR.

AI output itself is not automatically quality Evidence.

Exact persistence is NOT defined yet. Carry to reconciliation.

============================================================ 14. REGENERATE / REFINE / DISCARD
============================================================

These act on the current PROPOSAL in the workbench.

They do not write authoritative APZQEP records.

Discard does not require Screen 3.

Send to Review is the only path toward possible authoritative write.

============================================================ 15. SEND TO REVIEW
============================================================

Send to Review hands the proposal to Screen 3.

Do not implement the review queue from Screen 2.

Do not invent the proposal store from this button.

Do not auto-accept after Send to Review.

============================================================ 16. SCREEN 1 vs SCREEN 2 vs SCREEN 3 vs SCREEN 4
============================================================

SCREEN 1
entry, visible context, suggestions, lightweight Ask AI, quick actions

SCREEN 2
deliberate Generate & Analyse workbench — THIS VISUAL

SCREEN 3
human review: Accept / Modify / Reject

SCREEN 4
cross-domain quality intelligence / traceability analysis

Do not collapse these into one screen.

Screen 1 Generate Content / Analyse Quality / Draft Risk / Find Gaps
/ Summarise are intents that land here. They are not five backends.

============================================================ 17. EXISTING SORS REMAIN AUTHORITATIVE
============================================================

Phase 7 must not replace Phases 1–6 authorities.

AI sits ABOVE:

Application, Environment, Requirement, User Story, AC, Test Case,
Suite, Test Plan, Execution, Evidence, Defect, Exploratory Session,
Observation, Issue, Experience Plan, UI/UX Verification, Quality
Risk, Quality Gate, Readiness, Certification

It does not sit BESIDE them as another quality store.

============================================================ 18. CONTROL RULES (CARRIED FROM SCREEN 1)
============================================================

AI ASSISTS. HUMANS DECIDE.

Defect: AI may draft / suggest. Human creates.
Quality Risk: AI may draft a candidate. Human creates / accepts /
waives / closes.
Quality Gate: AI may explain. It cannot evaluate, override, or
create Certification Exceptions.
Readiness: AI may explain Current Readiness Posture. No AI score.
Certification: AI has NO authority to record GO, CONDITIONAL_GO,
NO_GO, or DEFER.
Traceability: AI may identify missing links. It must not silently
manufacture them.
Evidence: AI may summarise authorised Evidence. AI output is not
Evidence.

============================================================ 19. SAMPLE DATA
============================================================

ALL values in the visual are illustrative, including:

Application names
Environment names
REQ / AC / US identifiers
context counts
model name (for example GPT-4o)
generation time
proposal field text
step tables

Do not seed or hard-code them.

A model name on the mock does NOT authorise a provider. Screen 1
already forbids assuming OpenAI / Anthropic / Gemini / local / a
single provider from a visual.

============================================================ 20. MOBILE
============================================================

Mobile is first-class sequential composition:

task selection
context selection
instructions
results

Do not squeeze the desktop workbench into a narrow viewport.

Bottom destinations shown in the mock (Companion, Generate, Analyse,
History, More) are composition. History / review persistence is NOT
defined here. Screen 3 owns review. Do not create an AI History
ledger from the mobile bar.

Same domain. Same permissions. Same context. Responsive presentation.

============================================================ 21. LIGHT / DARK
============================================================

Desktop light/dark geometry: IDENTICAL
Mobile light/dark geometry: IDENTICAL

Theme changes appearance only.

============================================================ 22. HEADER / NAVIGATION
============================================================

Preserve the accepted APZQEP shell.

Generate & Analyse belongs within APZQEP.

Do not replace the Application selector, APZQEP navigation, search,
notifications, or platform shell.

Tabs Companion / Generate & Analyse / Review Queue / AI Analysis
are the Phase 7 screen set. Do not implement those routes from this
lock.

============================================================ 23. VISUAL LANGUAGE
============================================================

professional quality-engineering workbench
purple AI accent
clear PROPOSAL labelling
visible Source Access boundary
structured native-looking output that is still not a record
light/dark parity
purpose-built mobile sequence

Do not turn this into a generic chatbot or consumer AI interface.

============================================================ 24. DOMAIN QUESTIONS TO CARRY FORWARD
============================================================

Do NOT answer these yet.

Carry Screen 1 questions plus:

How is a workbench proposal represented before Send to Review?
What is ephemeral vs durable before Screen 3?
How are Generate vs Analyse outputs typed without becoming SoRs?
How is Refine represented vs a new proposal?
What happens to Discarded proposals?
How is Environment used in context assembly?
How is partial scope (one REQ, two ACs) assembled and displayed?
How is “Sources Used” attached without duplicating Evidence?

============================================================ 25. EXPLICITLY NOT AUTHORISED
============================================================

Do NOT implement:

Phase 7
AI backend / agent / autonomous agent
vector database / embeddings / RAG / model gateway
provider integration / MCP integration
AI proposal store / conversation store / audit store
new AI permissions
AI generated authoritative records
Save / Create Test Case / Create Risk / Create Defect from this screen
automatic Gate evaluations or Certification
AI readiness / AI scores
Source write / SSH / Terminal
Screen 3 or Screen 4
Phase 8
repository typecheck remediation

============================================================ 26. RECORD
============================================================

Store the supplied visual as:

docs/frontend/apzqep-redesign/visuals/phase-7/
02-generate-and-analyse-authority.png

Create:

docs/frontend/apzqep-redesign/
APZQEP-PHASE-7-SCREEN-2-GENERATE-AND-ANALYSE.md

STOP.

Wait for Screen 3 visual authority.
