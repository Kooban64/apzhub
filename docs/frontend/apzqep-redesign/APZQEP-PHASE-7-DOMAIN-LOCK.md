# APZQEP Phase 7 — domain lock

**Status:** **ACCEPTED / CLOSED** — Owner review approved 2026-08-20. This lock is implementation authority for the forthcoming inventory only.  
**Date:** 2026-08-20  
**Authority:** Owner decisions on the completed Phase 7 domain reconciliation.  
**Implementation:** **NOT AUTHORISED.**  
**Implementation inventory:** [APZQEP-PHASE-7-IMPLEMENTATION-INVENTORY.md](./APZQEP-PHASE-7-IMPLEMENTATION-INVENTORY.md) — **DRAFTED — AWAITING OWNER REVIEW.**

Reconciliation (accepted): [APZQEP-PHASE-7-DOMAIN-RECONCILIATION-REPORT.md](./APZQEP-PHASE-7-DOMAIN-RECONCILIATION-REPORT.md)  
Visuals: Screens [1](./APZQEP-PHASE-7-SCREEN-1-AI-QUALITY-COMPANION.md)–[4](./APZQEP-PHASE-7-SCREEN-4-AI-QUALITY-ANALYSIS-TRACEABILITY.md) LOCKED.  
Sequence: [APZQEP-PHASE-7-SEQUENCE.md](./APZQEP-PHASE-7-SEQUENCE.md).

This lock is subordinate to the Constitution and foundation documents 001–029. Phases 1–6 remain CLOSED. Phase 7 must not weaken Source independence, Evidence integrity, Defect lifecycle, execution history, Risk authority, Gate authority, Readiness authority, Certification dual authority, the Blocking Gate exception rule, or Certification snapshot immutability.

---

# OWNER DECISION — APZQEP PHASE 7 DOMAIN LOCK

The Phase 7 repository/domain reconciliation is **ACCEPTED**.

The three Owner decisions are **RESOLVED** as follows.

The Source security condition is **LOCKED** with the decisions. It is not optional.

============================================================
OPERATING MODEL
============================================================

LOCKED:

```text
AUTHORISED CONTEXT → AI ANALYSIS → AI PROPOSAL / EXPLANATION
  → HUMAN REVIEW → ACCEPT / MODIFY / REJECT
  → EXISTING APZQEP AUTHORITATIVE DOMAIN
```

Never:

```text
AI → silent production truth
```

Generate ≠ Accept ≠ Authoritative Write.

Proposal ≠ production record. AI sits **above** Phases 1–6 SoRs, not beside them.

The four locked screens are the Phase 7 product:

1. AI Quality Companion — entry, context snapshot, suggestions, Ask AI, quick actions
2. Generate & Analyse — deliberate workbench; results are proposals; Send to Review only
3. AI Review Queue — Accept / Modify / Reject; Accept is not universal
4. AI Quality Analysis / Traceability — intelligence surface; findings advisory; no AI quality score

============================================================

1. EXISTING AI CAPABILITIES
   \============================================================

APPROVED:

**ABSORB / SUPERSEDE FOR APZQEP PRODUCT EXPERIENCE**

Phase 7 becomes the **authoritative APZQEP AI product experience**.

Do not maintain AI Workspace, Quality Assist, MCP DX, and F7 as competing
APZQEP user experiences.

Do not automatically delete existing implementation.

Selective technical reuse is required where primitives satisfy this lock:

- reuse the existing OpenAI structured JSON call
  (`chat/completions` + `response_format: json_object`)
- reuse the F7 pattern of **proposal → human acceptance → existing domain write**
- reuse appropriate audit / provider / secret-loading utilities
- retire or hide overlapping APZQEP-facing surfaces once Phase 7 replaces them

Do not inherit incompatible SoRs or product semantics:

- Quality Assist sessions and MCP proposal ledgers are **not** the Phase 7 Proposal SoR
- QI scores must **not** feed an AI quality score or Current Readiness Posture
- APE-AI / APE-RAG remain deferred catalogue entries; do not wait for them
- MCP remains **DEFERRED** as product IA and as an implementation path
- F7 `acceptAll` / bulk accept remains **DEFERRED**
- silent rule-based fallback must **not** mint structured APZQEP proposals
  when the live model is unavailable

============================================================ 2. GENERATOR MAY ACCEPT OWN PROPOSAL
============================================================

APPROVED:

**YES — SUBJECT TO DESTINATION DOMAIN AUTHORITY**

No universal four-eyes requirement is introduced for ordinary AI-assisted
quality authoring.

A user who generates a proposal may Accept it **only if that same user
already has permission to perform the resulting write directly**.

At acceptance time the server **MUST** re-evaluate the user's **current**
authority against the destination APZQEP domain.

AI permission does not grant destination-domain permission.
`qep.ai_workspace.*` never substitutes for Story / AC / Test Case / Suite /
Plan / Trace / Defect / Risk / Evidence create or update grants.

Existing stronger controls remain unchanged:

- Certification dual authority (certifier + co-approver) is untouched
- Gate evaluation authority remains Phase 6 human `qep.gate.evaluate`
- AI cannot record GO / CONDITIONAL_GO / NO_GO / DEFER
- AI cannot create a Quality Risk as if the model were the author —
  the human invokes the existing authorised Risk creation path
  (“Create Risk from Proposal”)
- AI cannot open a Defect as if the model were the author —
  the human invokes the existing Defect create path

============================================================ 3. EVIDENCE MODEL CONTEXT
============================================================

APPROVED:

**METADATA BY DEFAULT**

Evidence body/content is **not** automatically supplied to the model.

Default context is metadata and references only, for example:

- Evidence identity
- type / classification / source kind
- relationships
- timestamps
- execution association
- other safe descriptive fields

Bounded relevant body extracts may be supplied **only when all** of:

- required by the explicit AI operation
- the requesting user is authorised to read that Evidence
- the Evidence type is permitted for model processing
- only the necessary bounded extract is included

Do not send secrets, credentials, or arbitrary raw artefact dumps.

This is a governance boundary. It does **not** authorise embeddings, RAG,
or a vector store.

============================================================
SOURCE SECURITY CONDITION
============================================================

LOCKED — fail closed.

The reconciliation identified an existing Source permission defect:
Shared Source HTTP currently accepts `qep.scm.read` **OR** `source.read`
for file / tree / diff / search.

Phase 7 **MUST NOT** consume Source through any path where `qep.scm.read`
can substitute for `source.read`.

For Phase 7:

```text
NO source.read
=
NO Source content in AI context
```

This applies to:

- files
- tree
- diff
- search
- cached Source content
- indexed Source content
- caller-supplied Source context
- derived Source extracts
- SCM impact path matching used as if it were Source access
- embeddings previously produced from unauthorised Source (none exist;
  none may be created from unauthorised Source)

If `source.read` is present, authorised Source **read** context may be
included. `source.write`, commit, branch, PR, merge, SSH, and Terminal
remain **NOT AUTHORISED** by Phase 7.

UI must show **Source Access: Not Authorised** when `source.read` is absent.
Do not hide this.

Existing Source API permission debt **may be corrected** if required to
make this guarantee true. Phase 7 must **not** broaden Source access.

`qep.scm.read` remains legitimate for SCM **change/repo metadata** that is
not Source file content. It must not be treated as Source file authorisation
for AI.

============================================================
ARCHITECTURAL LOCKS
============================================================

```text
PLATFORM AI FOUNDATION:              NONE
MODEL PROVIDER ABSTRACTION:          EXTEND existing OpenAI JSON call
AI CONTEXT ASSEMBLY:                 NEW — live read, permission-filtered BEFORE model invocation
PLATFORM SEARCH:                     NOT REQUIRED as context SoR
SOURCE CONTEXT:                      source.read EXCLUSIVE — fail closed
AI PROPOSAL:                         NEW — one type-discriminated aggregate
PROPOSAL REVIEW:                     NEW
PROPOSAL PROVENANCE:                 EXTEND existing origin fields + NEW on the proposal
CONVERSATION STATE:                  EPHEMERAL
AI FINDING:                          DERIVED (deterministic) / EPHEMERAL (interpretation)
DETERMINISTIC QUALITY ANALYSIS:      EXTEND existing coverage / trace / execution / risk / gate reads
AI QUALITY ANALYSIS:                 NEW interpretation only — never rediscover SQL facts
TRACEABILITY:                        REUSE
AUDIT:                               EXTEND platform-audit + destination-domain audit
AUTHZ:                               EXTEND qep.ai_workspace.* + REUSE destination AuthZ
STRUCTURED OUTPUT:                   EXTEND JSON object → proposal validation → human review → domain validation/write
STALE PROPOSAL PROTECTION:           NEW fingerprints on the proposal
EMBEDDINGS:                          NOT REQUIRED
VECTOR STORE:                        NOT REQUIRED
MCP:                                 DEFER
BULK ACCEPT:                         DEFER
AI DIRECT AUTHORITATIVE WRITE:       NO
SOURCE WRITE:                        NOT AUTHORISED
AI RISK CREATION:                    NO — PROPOSAL ONLY
AI GATE EVALUATION:                  NO
AI CERTIFICATION:                    NO
AI READINESS SCORE:                  NO
AI QUALITY SCORE:                    NO
SSH:                                 NOT AUTHORISED
TERMINAL:                            NOT AUTHORISED
```

Approved chain:

```text
Permission-filtered live QEP context
  (+ Source only if source.read)
        ↓
Deterministic quality facts (coverage, trace, execution, evidence, defect, risk, gate)
        ↓
Optional AI interpretation / structured proposal
        ↓
Human review (Accept / Modify / Reject)
        ↓
Existing APZQEP domain write (destination AuthZ + validation)
```

============================================================
CONTEXT ASSEMBLY
============================================================

LOCKED:

Context is assembled server-side from live APZQEP reads / read models.

It includes, as authorised:

user, tenant, selected Application, optional Environment,
effective permissions, selected APZQEP records, related traceability,
optional authorised Source context.

Permission filtering happens **before** model invocation.

Do not:

- trust caller-supplied Source or QEP bodies as authorised context
- use Platform Search or the Knowledge Index as the context SoR
- create an AI-indexed copy of QEP
- introduce embeddings or a vector store
- mix tenants or Applications in one model request

Quality Assist’s caller-supplied `context` field is **not** the Phase 7 composer.

============================================================
PROPOSAL AGGREGATE
============================================================

LOCKED:

One durable Application-scoped Proposal aggregate.

Not per-artefact tables.
Not Quality Assist suggestion text.
Not MCP string payloads.
Not QI recommendations.

Semantic responsibility (not an implementation schema):

- tenant, Application, optional Environment
- proposal type (discriminator)
- target / reference identities
- structured proposed content matching the destination contract
- context / provenance **references** (not copied Source/Evidence bodies)
- `sourceAuthorised` boolean
- model / provider identity and generation time
- original generated content and human-modified content
- review status, reviewer, decision, timestamps
- target fingerprints at generation
- resulting authoritative record reference after Accept

**Send to Review** is the durability boundary.
Discarded Screen 2 drafts need not persist.
Regenerate / Refine creates a new proposal, not a version table.

The model’s output is untrusted input.
Human Accept does not permit invalid domain data to bypass server validation.

============================================================
ACCEPT IS NOT UNIVERSAL
============================================================

LOCKED — no generic “accept any proposal” service.

| Proposal type                         | AI may                                               | Human Accept into existing SoR?                                                                       |
| ------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| User Story                            | propose                                              | Yes, via definition `createStory`                                                                     |
| Acceptance Criterion                  | propose                                              | Yes, via definition `createCriterion` (`ai_accepted` + `acceptedBy`)                                  |
| Test Case / steps                     | propose                                              | Yes, via existing specification / test-case create                                                    |
| Suite content                         | propose                                              | Yes, via existing suite write                                                                         |
| Test Plan content                     | propose                                              | Yes, via existing plan write                                                                          |
| Exploratory Charter                   | propose                                              | Yes, via existing exploratory write                                                                   |
| UI/UX Criteria                        | propose                                              | Yes, via existing experience write                                                                    |
| Trace Link                            | propose                                              | Yes, typed `createTraceLink`; never silent; `ai_suggestion` remains provisional until human authority |
| Quality Risk                          | draft / propose only                                 | Yes as **Create Risk from Proposal** into existing `qep-assurance.createRisk`                         |
| Issue                                 | propose                                              | Yes into existing quality_issue write where that path exists                                          |
| Defect                                | propose only                                         | Yes into existing Defect create; AI must not open defects alone                                       |
| Gate evaluation                       | analyse only                                         | **No**                                                                                                |
| Certification / GO family / exception | analyse only                                         | **No**                                                                                                |
| Current Readiness Posture             | analyse / summarise only                             | **No** — derived, not a write                                                                         |
| Evidence                              | analyse; may propose attach of **existing** evidence | **No fabricating evidence**                                                                           |
| Source / commit / PR                  | read if `source.read`                                | **No**                                                                                                |

Stale protection: store destination fingerprints at generation; refuse blind Accept when the target changed or was deleted, or when permission was revoked.

============================================================
SCREEN RESPONSIBILITIES
============================================================

**Screen 1 — Companion**

Existing composition for context snapshot and Current Readiness Posture.
Suggestions may be derived gaps plus ephemeral AI interpretation.
Ask AI is ephemeral / session-scoped. No chat SoR.
Recent activity is derived from proposal/review events once they exist.

**Screen 2 — Generate & Analyse**

Workbench only. No Save / Create Test Case / Create Risk on this screen.
Send to Review hands a structured proposal to Screen 3.

**Screen 3 — Review Queue**

Pending proposals, comparison, provenance, Accept / Modify / Reject.
Retain original AI content and human-modified content.
Bulk accept is **DEFERRED**.

**Screen 4 — Analysis / Traceability**

Deterministic QEP facts first (including AC without verification →
`test_specification` coverage gap).
AI adds patterns, summaries, possible relationships, risk candidates,
semantic alignment.
Findings are not a new SoR.
Draft Risk / Generate Tests / Propose Link enter Screens 2–3.

============================================================
AUTHZ / ISOLATION / AUDIT
============================================================

LOCKED:

- Ability to use AI: `qep.ai_workspace.read` / `qep.ai_workspace.operate` (extend, do not invent a parallel catalogue unless inventory later proves a split is required)
- Ability to read QEP objects: existing domain read keys
- Ability to read Source: `source.read` exclusively for AI Source context
- Ability to write: destination domain keys, re-checked at Accept
- Tenant isolation: session tenant only; do not reuse MCP/assist ledgers
- Application isolation: every proposal and context assembly is Application-scoped
- Audit: extend platform-audit for proposal generated / modified / accepted / rejected / model invoked / context boundary; destination-domain audit for the authoritative write
- Provenance on resulting records: extend `ai_accepted` / `ai_suggestion` where those origins already exist
- Logs and audit must not retain Source bodies, Evidence dumps, secrets, or raw prompts as a second SoR

============================================================
EXPLICITLY PROHIBITED
============================================================

Do NOT create:

- a parallel AI quality SoR
- per-type proposal tables
- AI conversation / chat SoR
- Finding SoR
- AI quality score / AI readiness score
- embeddings, vector store, RAG engine
- APE-AI / model gateway as a Phase 7 prerequisite
- MCP servers / MCP product IA
- bulk “apply everything”
- silent production writes
- AI Gate evaluation
- AI Certification / GO / CONDITIONAL_GO / NO_GO / DEFER / exception
- AI Risk insert (proposal only)
- AI Defect insert (proposal only)
- fabricated Evidence
- Source write, SSH, Terminal
- caller-trusted Source context
- use of `qep.scm.read` as Source read for AI
- inheritance of Quality Assist / MCP ledgers as Phase 7 persistence
- QI scores as Screen 4 quality score

Phase 1–6 rules remain in force.

============================================================
DOMAIN LOCK STATUS
============================================================

```text
PHASE 7 DOMAIN LOCK:
ACCEPTED / CLOSED

OWNER REVIEW:
APPROVED

OWNER DECISIONS:
RESOLVED (3)
```

============================================================
NEXT STEP
============================================================

This lock is implementation authority for the finite inventory.

Do not reopen the four locked visuals, reconciliation, the three Owner
decisions, Source permission semantics, proposal-vs-authoritative-record
semantics, Evidence context policy, or generator/reviewer policy.

Inventory (for Owner review, not an implementation authorisation):
[APZQEP-PHASE-7-IMPLEMENTATION-INVENTORY.md](./APZQEP-PHASE-7-IMPLEMENTATION-INVENTORY.md)

Do not implement until that inventory has been reviewed and explicitly
authorised by Owner.

PHASE 7 IMPLEMENTATION: NOT AUTHORISED  
PHASE 8: NOT STARTED
