# APZQEP Phase 7 — Screen 4 visual authority (AI Quality Analysis / Traceability)

**Record:** APZQEP REDESIGN / PHASE 7 / SCREEN 4 / AI QUALITY ANALYSIS / TRACEABILITY / VISUAL AUTHORITY  
**Status:** **LOCKED** — design authority only. **DO NOT IMPLEMENT.**  
**Date:** 2026-08-20  
**Authority image:** [visuals/phase-7/04-ai-quality-analysis-traceability-authority.png](./visuals/phase-7/04-ai-quality-analysis-traceability-authority.png)

The attached visual is the **APPROVED DESIGN DIRECTION** for APZQEP AI Quality Analysis / Traceability. It is the **intelligence surface** for authorised quality relationships across the selected Application. It is not another Generate & Analyse workbench, not Review Queue, and not a competing quality SoR.

**A finding remains a finding.** Actions such as Draft Risk, Generate Tests, or Propose Link enter the Screen 2–3 proposal/review workflow. They do not write authoritative records.

Phases 1–6 remain **CLOSED**. Screens 1–3 remain **LOCKED**. Domain reconciliation is **NEXT** and **not started**. Phase 7 implementation is **NOT AUTHORISED**.

```text
SCREEN 1 — AI QUALITY COMPANION:
LOCKED

SCREEN 2 — GENERATE & ANALYSE:
LOCKED

SCREEN 3 — AI REVIEW QUEUE:
LOCKED

SCREEN 4 — AI QUALITY ANALYSIS / TRACEABILITY:
LOCKED

PHASE 7 VISUAL DESIGN:
COMPLETE

DOMAIN RECONCILIATION:
NEXT

PHASE 7 IMPLEMENTATION:
NOT AUTHORISED

PHASE 8:
NOT STARTED
```

Permanent product message:

**AI findings are advisory. Quality facts and authoritative APZQEP records remain unchanged until an authorised human action occurs.**

Do not decide proposal persistence, conversation state, model/provider infrastructure, context assembly, provenance stores, or review records from this visual.

---

# APZQEP REDESIGN — PHASE 7

# SCREEN 4 — AI QUALITY ANALYSIS / TRACEABILITY

# VISUAL AUTHORITY ONLY — NO IMPLEMENTATION

The supplied image is visual authority for:

SCREEN 4 — AI QUALITY ANALYSIS / TRACEABILITY

Record the visual.

Do NOT implement.

Do NOT create AI schemas, proposal tables, jobs, agents, orchestration,
vector stores, embeddings, model-provider abstractions, MCP services,
prompt stores, new permissions, new Source access, or new QEP business
records from this visual.

Do NOT start repository/domain reconciliation until the Owner issues
that instruction. This lock only completes the four-screen visual set.

============================================================

1. PURPOSE
   \============================================================

This is APZQEP's Application-level quality intelligence surface.

It helps an authorised user see relationships and gaps across the
quality chain, understand patterns, and choose a proposed next action.

It is NOT:

another generation screen
a chatbot
an inbox
a certification workspace
an AI quality scorecard
a second traceability SoR
a second Risk / Defect / Evidence / Gate store

============================================================ 2. QUALITY CHAIN
============================================================

The central visual concept is the authorised quality chain:

Requirement
→ Story
→ Acceptance Criterion
→ Test Case
→ Execution
→ Evidence
→ Defect
→ Risk
→ Gate

The mock may show a subset of nodes or counts. That is illustrative
geometry, not permission to drop Gate or invent extra chain members
(Release, Score, AI Posture).

Relationship states such as:

Covered
Gap
Failed
Missing Evidence
Unlinked
Healthy
Partial
At Risk
Not Linked

are PRODUCT INTENTS for display.

Do NOT invent a durable gap-type enum, node-health enum, or overall
AI quality score from the visual.

============================================================ 3. NO AI QUALITY SCORE
============================================================

There is no invented overall AI quality score.

“Coverage Status: AT RISK” and similar badges in the mock are
illustrative cues, not:

Current Readiness Posture (Phase 6 remains authoritative)
an AI readiness score
an AI recommended posture
Certification

AI may explain Phase 6 Current Readiness Posture.
It must not calculate a competing posture on this screen.

============================================================ 4. FOUR ANALYSIS AREAS
============================================================

QUALITY GAPS
missing or weak relationships

TRACEABILITY ANALYSIS
navigate the end-to-end chain

PATTERNS & FINDINGS
clusters such as repeated failures or defect concentration

AI FINDINGS
what was found, why it matters, which authorised records support it,
and a proposed next action

Tabs/labels in the mock (Overview, Quality Gaps, Traceability,
Findings, Recommendations) are composition. Do not create five
analytics services from the tabs.

============================================================ 5. A FINDING REMAINS A FINDING
============================================================

Example semantics (illustrative, do not seed AC-142):

Potential quality risk
Three failed executions affecting AC-142 have no linked Evidence
and two unresolved Defects.
Sources: AC-142 · TS-201 · EX-381 · EX-384 · DEF-92 · DEF-96
Action: Draft Risk

Draft Risk takes the user into the proposal/review workflow
(Screens 2–3). It must NOT create qep_quality_risk.

Likewise:

Missing Test Coverage → Generate Test Cases → proposal → Review Queue

Possible Trace Link → Propose Link → Review Queue

Evidence Gap → investigate / attach existing Evidence
AI does not fabricate Evidence.

Investigate is inspection, not an authoritative write.

============================================================ 6. ACTIONS FROM FINDINGS
============================================================

Illustrated actions (product intents, not backends):

Draft Risk
Generate Tests
Investigate
Propose Link
Analyse Further

These hand off to Screen 2 (generate/analyse) and/or Screen 3 (review).

They do not:

Accept a proposal
record Certification
evaluate Gates
attach fabricated Evidence
silently manufacture trace links
waive Risks
create Defects

============================================================ 7. SAMPLE COUNTS AND NODES
============================================================

ALL values are illustrative, including:

156 Requirements
428 ACs
1,234 Test Cases
186 Failed Executions
28 Unresolved Defects
56 Evidence Gaps
27 ACs with no Test Case
312 never executed
34% / 57% cluster figures
AT RISK coverage badge

Do not seed or hard-code them.

============================================================ 8. AI CONTEXT / SOURCE ACCESS
============================================================

Retain a visible AI Context / Source Access indicator.

When source.read is absent:

Source Access: Not Authorised

Code-aware analysis is simply not available.

AI must never quietly substitute inference for repository inspection.

Same freeze as Screens 1–3: no indirect Source retrieval, no use of
embeddings previously produced from unauthorised Source, no
source.write / SSH / Terminal.

============================================================ 9. APPLICATION / ENVIRONMENT
============================================================

Reuse qep_application. AI analysis is bounded by the selected
Application.

Environment may appear where relevant.

Do not create an AI analysis context store.

============================================================ 10. EXISTING SORS REMAIN AUTHORITATIVE
============================================================

Reuse Phases 1–6 authorities. Do not replace them.

Traceability on this screen is analysis over existing relationships.
It is not a second trace-link SoR.

Phase 6 Gate, Risk, Readiness, and Certification rules remain frozen.

============================================================ 11. CONTROL RULES (CARRIED FORWARD)
============================================================

AI ASSISTS. HUMANS DECIDE.

Proposal ≠ production record.

Accept is never universal (Screen 3).

AI has NO authority to record GO / CONDITIONAL_GO / NO_GO / DEFER.

AI may not create authoritative Gate evaluations, override Blocking
Gates, or authorise Certification Exceptions.

============================================================ 12. MOBILE
============================================================

Staged workflow, not a large graph on a phone:

Overview → Gaps → Traceability → Findings → Finding Detail

Do not squeeze the desktop chain map into a narrow viewport.

Same domain. Same permissions. Same advisory rule.
Responsive presentation.

Desktop light/dark geometry IDENTICAL.
Mobile light/dark geometry IDENTICAL.
Theme changes appearance only.

============================================================ 13. HEADER / NAVIGATION
============================================================

Preserve the accepted APZQEP shell.

This screen belongs within APZQEP.

Do not replace Application selector, navigation, search,
notifications, or platform shell.

Do not implement Phase 7 routes from this lock.

============================================================ 14. VISUAL LANGUAGE
============================================================

intelligence surface, not a generator
purple AI accent
visible Source Access boundary
advisory findings with sources and a next action
no overall AI score
light/dark parity
purpose-built mobile sequence

Do not turn this into a generic BI dashboard, chatbot, or scorecard.

============================================================ 15. FOUR-SCREEN SET (NOW COMPLETE)
============================================================

SCREEN 1
AI understands authorised context

SCREEN 2
AI generates/analyses and creates proposals

SCREEN 3
humans review and control proposed changes

SCREEN 4
AI analyses quality relationships across the Application

============================================================ 16. WHAT MUST NOT BE DECIDED FROM VISUALS
============================================================

Do NOT decide from Screens 1–4:

proposal persistence
AI conversation state
model / provider infrastructure
context assembly implementation
provenance store
review records
embeddings / vector search / RAG
MCP
new AI permissions

Those questions belong to repository/domain reconciliation after
this lock, when the Owner authorises that step.

============================================================ 17. DOMAIN QUESTIONS TO CARRY FORWARD
============================================================

Carry Screens 1–3 questions plus:

How are findings computed from existing relationships without a
second SoR?
Can Platform Search / existing traceability supply the chain?
Are gap states derived live?
How does Draft Risk / Generate Tests / Propose Link enter Screen 2
without duplicating Generate task types?
How is “code-aware analysis unavailable” enforced when source.read
is absent?
What is the minimum new domain, if any, for all four screens?

============================================================ 18. EXPLICITLY NOT AUTHORISED
============================================================

Do NOT implement:

Phase 7
AI backend / agent / autonomous agent
vector database / embeddings / RAG / model gateway
provider / MCP integration
AI proposal / conversation / audit / finding store
new AI permissions
AI quality score / AI readiness
automatic Defects / Risks / Gate evaluations / Certification
fabricated Evidence
silent trace-link creation
Source write / SSH / Terminal
domain reconciliation (until Owner instructs)
Phase 8
repository typecheck remediation

============================================================ 19. RECORD
============================================================

Store the supplied visual as:

docs/frontend/apzqep-redesign/visuals/phase-7/
04-ai-quality-analysis-traceability-authority.png

Create:

docs/frontend/apzqep-redesign/
APZQEP-PHASE-7-SCREEN-4-AI-QUALITY-ANALYSIS-TRACEABILITY.md

STOP.

Wait for Owner instruction to start Phase 7 repository/domain
reconciliation. Do not invent the AI architecture from the four
visuals.
