# APZQEP Phase 7 — Screen 1 visual authority (AI Quality Companion)

**Record:** APZQEP REDESIGN / PHASE 7 / SCREEN 1 / AI QUALITY COMPANION / VISUAL AUTHORITY  
**Status:** **LOCKED** — design authority only. **DO NOT IMPLEMENT.**  
**Date:** 2026-08-20  
**Authority image:** [visuals/phase-7/01-ai-quality-companion-authority.png](./visuals/phase-7/01-ai-quality-companion-authority.png)

The attached visual is the **APPROVED DESIGN DIRECTION** for the APZQEP AI Quality Companion. It is the Phase 7 entry point: context, suggestions, Ask AI, and quick actions. It is not a generic chatbot, not a full Generate & Analyse workspace, and not an AI System of Record.

Phases 1–6 remain **CLOSED**. Screens 2–4 are **LOCKED**. Domain reconciliation is **NEXT** (not started). Phase 7 implementation is **NOT AUTHORISED**.

The **Context Snapshot** is the most important product behaviour on this screen: AI authority is visible. If the user has QEP access but not `source.read`, the snapshot shows **Source Access — Not Authorised**. AI must not imply repository visibility.

```text
SCREEN 1 — AI QUALITY COMPANION:
LOCKED

SCREEN 2 — GENERATE & ANALYSE:
NEXT

SCREEN 3 — AI REVIEW QUEUE:
PENDING

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

**AI assists. Humans decide.** Proposal ≠ production record. Do not create AI schemas, agents, vector stores, MCP services, new permissions, Source access, or QEP business records from this visual.

---

# APZQEP REDESIGN — PHASE 7

# SCREEN 1 — AI QUALITY COMPANION

# VISUAL AUTHORITY ONLY — NO IMPLEMENTATION

Current programme status:

PHASE 1 — APZQEP WORKBENCH / COMMAND CENTRE:
CLOSED

PHASE 2 — DEFINITION / STORIES / AC:
CLOSED

PHASE 3 — TEST DESIGN / SUITES / PLANS:
CLOSED

PHASE 4 — EXECUTION / EVIDENCE / DEFECT / RETEST:
CLOSED

PHASE 5 — EXPLORATORY / UI-UX VERIFICATION:
CLOSED

PHASE 6 — RISK / READINESS / GATES / CERTIFICATION:
CLOSED

PHASE 7 — AI QUALITY COMPANION:
VISUAL DESIGN IN PROGRESS

SCREEN 1 — AI QUALITY COMPANION:
LOCK THIS VISUAL

SCREEN 2 — GENERATE & ANALYSE:
NEXT

SCREEN 3 — AI REVIEW QUEUE:
PENDING

SCREEN 4 — AI QUALITY ANALYSIS / TRACEABILITY:
PENDING

DOMAIN RECONCILIATION:
NOT STARTED

PHASE 7 IMPLEMENTATION:
NOT AUTHORISED

============================================================

1. VISUAL AUTHORITY
   \============================================================

The supplied image is visual authority for:

SCREEN 1 — AI QUALITY COMPANION

Record the visual.

Do NOT implement.

Do NOT create:

AI schemas
AI proposal tables
AI jobs
AI agents
AI orchestration
vector stores
embeddings
model-provider abstractions
MCP services
prompt stores
new permissions
new Source access
new QEP business records

from this visual.

Screens 1–4 must be visually locked before repository/domain
reconciliation determines what AI infrastructure already exists and
what is genuinely required.

============================================================ 2. PURPOSE
============================================================

The AI Quality Companion is APZQEP's contextual quality-engineering
assistant.

It helps an authorised user understand, analyse and improve the
quality state of the selected Application.

Its role is:

ASSIST
ANALYSE
EXPLAIN
PROPOSE
DRAFT
IDENTIFY GAPS

Its role is NOT:

DECIDE
CERTIFY
OVERRIDE
SILENTLY MODIFY
EXPAND USER AUTHORITY

============================================================ 3. FUNDAMENTAL OPERATING MODEL
============================================================

The Phase 7 operating model is:

AUTHORISED CONTEXT
↓
AI ANALYSIS
↓
AI PROPOSAL / EXPLANATION
↓
HUMAN REVIEW
↓
ACCEPT / MODIFY / REJECT
↓
EXISTING APZQEP AUTHORITATIVE DOMAIN

AI does not become another quality SoR.

============================================================ 4. AI ASSISTS — HUMANS DECIDE
============================================================

Freeze this rule:

AI ASSISTS.
HUMANS DECIDE.

AI may analyse quality information.

AI may suggest action.

AI may draft proposed quality artefacts.

AI may explain why something appears incomplete or risky.

AI may NOT independently turn those conclusions into authoritative
quality state.

============================================================ 5. PROPOSAL ≠ PRODUCTION RECORD
============================================================

This distinction is fundamental.

An AI-generated:

Requirement
Story
Acceptance Criterion
Test Case
Test step
Suite suggestion
Plan suggestion
Exploratory Charter
UI/UX criterion
Issue candidate
Defect candidate
Risk candidate

is a PROPOSAL until deliberately accepted by an authorised human.

Do not allow AI output to masquerade as an existing APZQEP record.

============================================================ 6. EXISTING SORS REMAIN AUTHORITATIVE
============================================================

Phase 7 must not replace any authority established in Phases 1–6.

Reuse existing authorities for:

Application
Environment
Requirement
User Story
Acceptance Criterion
Test Case
Suite
Test Plan
Execution
Evidence
Defect
Exploratory Session
Observation
Issue
Experience Plan
UI/UX Verification
Quality Risk
Quality Gate
Readiness
Certification

AI sits ABOVE these domains as assistance.

It does not sit BESIDE them as another competing quality store.

============================================================ 7. APPLICATION CONTEXT
============================================================

The visual uses the existing Application selector.

Reuse:

qep_application

AI context is bounded by the selected Application.

Do not create an AI Application context store.

============================================================ 8. SOURCE ACCESS — NON-NEGOTIABLE
============================================================

AI MUST NOT broaden Source permissions.

This rule is already frozen in the Phase 7 sequence and remains
authoritative.

Example:

User has QEP access
but does NOT have source.read.

AI may analyse QEP records the user is authorised to access.

AI may NOT:

read repository files
inspect source code
inspect commits beyond authorised SCM/QEP data
retrieve Source workspace content
use Source indirectly through another service
ask another agent to retrieve Source
use embeddings previously produced from unauthorised Source

Source access through AI must obey the SAME effective user authority.

============================================================ 9. SOURCE ACCESS DISPLAY
============================================================

The Context Snapshot intentionally shows:

Source Access
NOT AUTHORISED

This is an important product behaviour.

Do not hide the absence of Source permission.

Do not imply that AI automatically has repository visibility.

If source.read is independently authorised, the UI may later indicate
that Source context is available.

That requires repository/domain reconciliation.

============================================================ 10. SOURCE WRITE
============================================================

NOT AUTHORISED.

AI Quality Companion does not gain:

source.write
commit
branch
PR
merge
terminal
shell

from Phase 7.

No generated code is written into Source from this visual.

============================================================ 11. CURRENT READINESS POSTURE
============================================================

The visual surfaces:

Current Readiness Posture

This reuses the approved Phase 6 concept.

It is NOT:

AI Readiness
AI Score
AI Recommendation
AI Certification prediction

AI may explain the posture.

It does not calculate a competing posture.

============================================================ 12. QUALITY SUMMARY
============================================================

The top quality summary uses existing APZQEP facts.

Conceptually:

Current Readiness Posture
Open Quality Risks
Gate Results
Unresolved Defects
Recent Activity

These are contextual facts.

AI does not own them.

Values in the visual are illustrative only.

Do not seed:

AT RISK
14 risks
12 Gates
28 Defects
18 activities

from the mock-up.

============================================================ 13. AI SUGGESTIONS FOR YOU
============================================================

This is the proactive assistance area.

Examples in the visual include:

Create Test Cases for uncovered ACs

Review high-risk areas

Evidence gaps detected

Analyse recent failures

UI/UX issues need attention

These are illustrative examples of suggestion categories.

Do NOT create these exact categories as enums from the visual.

============================================================ 14. SUGGESTION SEMANTICS
============================================================

A suggestion is:

an AI-generated observation or proposed next action

based on authorised quality context.

A suggestion is NOT:

Risk
Issue
Defect
Gate
Requirement
Test Case
Certification finding

unless deliberately promoted/accepted into the appropriate existing
domain by an authorised human.

============================================================ 15. SUGGESTION PROVENANCE
============================================================

Every meaningful AI suggestion must ultimately be explainable.

The system should be able to answer:

Why was this suggested?

Which authorised records were considered?

Which facts support the suggestion?

Which Application/context was active?

Which model/provider produced it?

When was it generated?

What happened to the proposal?

Exact persistence is NOT defined yet.

Carry this into domain reconciliation.

============================================================ 16. ASK AI
============================================================

Ask AI is contextual conversation with APZQEP quality information.

Examples shown:

Why is AC-142 failing?

Show risks that block release

Suggest tests for US-031

What evidence is missing?

These are illustrative prompts only.

Do not seed them as product workflows.

============================================================ 17. ASK AI AUTHORITY
============================================================

Ask AI may answer using only context the requesting user is authorised
to access.

The AI answer must not imply access to records that were not actually
available.

No permission bypass through natural-language queries.

============================================================ 18. ASK AI ≠ GENERATE & ANALYSE
============================================================

Screen 1 Ask AI is lightweight contextual interaction.

Screen 2 will define the deliberate Generate & Analyse workspace.

Do not prematurely turn Screen 1 into the full AI authoring surface.

============================================================ 19. QUICK ACTIONS
============================================================

The visual establishes conceptual quick actions:

Generate Content
Analyse Quality
Draft Risk
Find Gaps
Summarise

These are PRODUCT INTENTS, not backend architecture.

Do not create five AI services from these buttons.

============================================================ 20. GENERATE CONTENT
============================================================

Conceptually allows deliberate generation of quality artefact
PROPOSALS.

Potential proposal targets include:

User Stories
Acceptance Criteria
Test Cases
Test Steps
Suites
Test Plan content
Exploratory Charters
UI/UX Verification Criteria

Exact authorised targets are deferred to Screen 2 and domain
reconciliation.

============================================================ 21. ANALYSE QUALITY
============================================================

Conceptually allows AI to inspect authorised quality facts and identify:

patterns
gaps
inconsistencies
failures
coverage concerns
evidence concerns
traceability concerns

AI analysis does not modify those facts.

============================================================ 22. DRAFT RISK
============================================================

This means:

AI may propose a Quality Risk candidate.

It does NOT mean:

AI creates qep_quality_risk.

The Phase 6 Quality Risk SoR remains human-controlled.

Human acceptance is required before authoritative Risk creation.

============================================================ 23. FIND GAPS
============================================================

Conceptually identifies missing or incomplete quality relationships.

Examples may include:

Requirement without AC
AC without Test Case
Test Case without execution
failed execution without Evidence
missing traceability
unresolved Issue
missing required verification

These are examples only.

Do not create fixed gap types from Screen 1.

============================================================ 24. SUMMARISE
============================================================

AI may summarise authorised quality state.

A summary is descriptive.

It must not silently become:

Readiness Posture
Gate Evaluation
Risk
Certification
formal Evidence

============================================================ 25. CONTEXT SNAPSHOT
============================================================

The Context Snapshot communicates what AI currently knows and is
authorised to use.

The visual illustrates:

Requirements
Test Cases
Executions
Evidence Items
Exploratory Issues
UI/UX Activities
Source Access

Counts are sample data.

The important product concept is:

VISIBLE AI CONTEXT.

============================================================ 26. CONTEXT TRANSPARENCY
============================================================

Users should not have to guess what the AI can see.

The product should make relevant context boundaries visible.

This is especially important for:

Application
Source
Environment
quality artefacts
historical data

Exact context inspection UX will be reconciled later.

============================================================ 27. AI MUST NOT INVENT MISSING CONTEXT
============================================================

If information is unavailable, AI must behave honestly.

Examples:

Source not authorised
No Execution exists
No Evidence linked
No Environment selected
No Test Case covers the AC

AI should state the limitation rather than infer nonexistent facts.

============================================================ 28. DEFECT CONTROL
============================================================

AI may:

identify a possible defect
draft defect content
suggest linking a defect

AI may NOT silently create or change Defects.

Existing Defect SoR and lifecycle remain authoritative.

============================================================ 29. QUALITY RISK CONTROL
============================================================

AI may:

identify a potential Risk
draft Risk wording
suggest Impact/Likelihood reasoning
summarise supporting facts

AI may NOT silently create, accept, waive or close Quality Risks.

============================================================ 30. QUALITY GATE CONTROL
============================================================

AI may:

explain Gate conditions
explain why a Gate evaluation failed
identify facts relevant to a Gate

AI may NOT:

create an authoritative Gate evaluation
change Gate results
override a Blocking Gate
create Certification Exceptions

============================================================ 31. READINESS CONTROL
============================================================

AI may explain:

Current Readiness Posture

AI may NOT create:

AI readiness score
AI quality score
AI recommended posture
alternative readiness state

Phase 6 remains authoritative.

============================================================ 32. CERTIFICATION CONTROL
============================================================

AI must have NO authority to record:

GO
CONDITIONAL_GO
NO_GO
DEFER

AI may summarise quality facts for an authorised certifier.

It may not recommend or approve the Certification decision.

Phase 6 human-control rules remain absolute.

============================================================ 33. CERTIFICATION EXCEPTION CONTROL
============================================================

AI may explain an existing Certification Exception.

AI may potentially draft proposed rationale for human review.

AI may NOT:

authorise an Exception
approve an Exception
override a Blocking Gate
convert a failed Gate into progression

============================================================ 34. EVIDENCE CONTROL
============================================================

Existing Evidence SoR remains authoritative.

AI may:

find potentially relevant Evidence
summarise Evidence metadata/content where authorised
identify possible Evidence gaps

AI output itself is not automatically quality Evidence.

============================================================ 35. TRACEABILITY
============================================================

AI may use existing traceability to reason across:

Requirement
Story
AC
Test Case
Execution
Evidence
Defect
Risk

It may identify potential missing relationships.

It must not silently manufacture trace links.

============================================================ 36. RECENT ACTIVITY
============================================================

The visual includes Recent Activity as quality context.

Reuse real platform/QEP activity where appropriate.

Do not create an AI-specific duplicate activity ledger merely to fill
this card.

============================================================ 37. HUMAN REVIEW
============================================================

Any AI action that would result in creation or mutation of an
authoritative APZQEP business object requires explicit human review.

The exact review workflow is intentionally deferred to:

SCREEN 3 — AI REVIEW QUEUE.

============================================================ 38. ACCEPT / MODIFY / REJECT
============================================================

These concepts are foundational for Phase 7.

AI proposals eventually require:

ACCEPT
MODIFY
REJECT

before authoritative write.

Do not implement these from Screen 1.

Screen 3 will establish their visual/product semantics.

============================================================ 39. AUDITABILITY
============================================================

AI-assisted changes must ultimately be auditable.

At minimum, reconciliation must determine how to preserve:

proposal
context/provenance
model/provider
human reviewer
review decision
accepted modifications
resulting authoritative record
timestamp

Do not design the persistence model yet.

============================================================ 40. MODEL / PROVIDER
============================================================

The visual does not define an AI provider.

Do NOT assume:

OpenAI
Anthropic
Gemini
local model
single provider

Do not introduce provider architecture from Screen 1.

Repository reconciliation must first inspect APZHUB's existing AI/model
capabilities.

============================================================ 41. MCP
============================================================

MCP is NOT authorised merely because Phase 0 mentioned AI/MCP routes.

Repository reconciliation must inspect what actually exists.

Do not make MCP part of the Screen 1 product IA.

============================================================ 42. PROMPTING
============================================================

Do not create user-visible prompt engineering as product IA.

The user interacts with APZQEP concepts:

Generate
Analyse
Ask
Review

not model plumbing.

============================================================ 43. MOBILE
============================================================

Mobile is first-class.

The supplied visual establishes responsive compositions for:

AI Companion
Ask AI
Quick Actions
Context Snapshot

Do not squeeze the desktop dashboard into a narrow viewport.

Same domain.
Same permissions.
Same context.
Responsive presentation.

============================================================ 44. LIGHT / DARK
============================================================

Desktop light/dark geometry:
IDENTICAL

Mobile light/dark geometry:
IDENTICAL

Theme changes appearance only.

============================================================ 45. HEADER / NAVIGATION
============================================================

Preserve the accepted APZQEP shell.

AI Companion belongs within APZQEP.

It is not a separate application.

Do not replace the existing Application selector, APZQEP navigation,
search, notifications or platform shell.

============================================================ 46. SAMPLE DATA
============================================================

ALL values shown in the visual are illustrative.

This includes:

AT RISK
14 Risks
12 Gates
28 Defects
18 Activity
156 Requirements
428 Test Cases
312 Executions
86 Evidence Items
21 Exploratory Issues
14 UI/UX Activities

Do not seed or hard-code these values.

============================================================ 47. VISUAL LANGUAGE
============================================================

The visual establishes:

professional quality-engineering workspace
dense but controlled information hierarchy
purple AI accent
existing APZQEP shell
clear separation between AI assistance and quality facts
compact cards
visible context boundaries
light/dark parity
purpose-built mobile composition

Do not turn this into:

a generic chatbot
full-screen chat application
IDE copilot
floating assistant bubble
consumer AI interface

============================================================ 48. PHASE 7 SCREEN SEQUENCE
============================================================

The four Phase 7 visual authorities are:

SCREEN 1
AI Quality Companion

Purpose:
entry point, context, suggestions, Ask AI, quick actions.

SCREEN 2
Generate & Analyse

Purpose:
deliberate AI generation and analysis workspace.

SCREEN 3
AI Review Queue

Purpose:
human review of AI proposals before authoritative writes.

SCREEN 4
AI Quality Analysis / Traceability

Purpose:
cross-domain quality intelligence and gap analysis.

Do not collapse these into one screen.

============================================================ 49. DOMAIN QUESTIONS TO CARRY FORWARD
============================================================

Do NOT answer these yet.

Carry them into repository/domain reconciliation after Screen 4:

1. What AI infrastructure already exists in APZHUB?

2. What existing model/provider abstraction exists?

3. Is there an existing AI gateway?

4. What existing AI/MCP QEP capability is real vs placeholder?

5. What is the minimum durable AI Proposal concept?

6. Does conversational Ask AI require durable conversation state?

7. What AI interactions require persistence?

8. What can remain ephemeral?

9. How is AI provenance recorded?

10. How is model/provider identity recorded?

11. How are prompts/configuration versioned if necessary?

12. How is authorised context assembled?

13. How is Application scope enforced?

14. How is Source permission enforced inside AI context retrieval?

15. How do we prevent previously indexed Source from leaking after
    permission changes?

16. Do embeddings/vector search already exist?

17. Are embeddings even required?

18. Can existing Platform Search supply enough context?

19. What proposal types are genuinely required?

20. How does Proposal → Review → authoritative write work?

21. Which writes require additional approval?

22. Can AI propose Defects?

23. Can AI propose Risks?

24. Can AI propose traceability links?

25. Can AI propose Test Plans/Suites?

26. What bulk-review controls are required?

27. How are rejected proposals retained/audited?

28. How are modified proposals represented?

29. What activity/audit mechanism can be reused?

30. What AuthZ additions, if any, are required?

31. How do AI permissions intersect with existing qep.* scopes?

32. Is Source context strictly source.read?

33. Is Source write entirely out of Phase 7?

34. How is Evidence content safely exposed to models?

35. What tenant-isolation controls are required for AI context/cache?

36. Can external model providers retain QEP data?

37. What data-governance controls already exist?

38. What provider/model configuration belongs to Administration?

39. What cost/token/usage controls already exist or are required?

40. What is the minimum new domain required for all four screens?

============================================================ 50. EXPLICITLY NOT AUTHORISED
============================================================

Do NOT implement:

Phase 7
AI backend
AI agent
autonomous agent
vector database
embeddings
RAG pipeline
model gateway
provider integration
MCP integration
AI proposal store
AI conversation store
AI audit store
new AI permissions
AI generated authoritative records
automatic Defects
automatic Risks
automatic Gate evaluations
automatic Certification
AI readiness
AI scores
Source write
SSH
Terminal
Phase 8

============================================================ 51. RECORD
============================================================

Store the supplied visual as:

docs/frontend/apzqep-redesign/visuals/phase-7/
01-ai-quality-companion-authority.png

Create:

docs/frontend/apzqep-redesign/
APZQEP-PHASE-7-SCREEN-1-AI-QUALITY-COMPANION.md

Record:

SCREEN 1 — AI QUALITY COMPANION:
LOCKED

SCREEN 2 — GENERATE & ANALYSE:
NEXT

SCREEN 3 — AI REVIEW QUEUE:
PENDING

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

STOP.

Wait for Screen 2 visual authority.
