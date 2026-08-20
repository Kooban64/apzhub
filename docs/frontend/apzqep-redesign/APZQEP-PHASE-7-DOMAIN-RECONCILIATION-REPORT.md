# APZQEP Phase 7 — repository / domain reconciliation report

**Status:** **ACCEPTED** — Owner decisions resolved 2026-08-20. Domain lock: [APZQEP-PHASE-7-DOMAIN-LOCK.md](./APZQEP-PHASE-7-DOMAIN-LOCK.md).  
**Date:** 2026-08-20  
**Implementation:** NOT AUTHORISED  
**Implementation inventory:** NOT AUTHORISED (drafted for Owner review — [inventory](./APZQEP-PHASE-7-IMPLEMENTATION-INVENTORY.md))  
**Phase 8:** NOT STARTED

No schemas, migrations, tables, APIs, UI, provider integrations, prompts, agents, MCP servers, vector stores, embeddings, proposal records, conversation records, permissions, or seed data were created.

Locked visuals remain authoritative: [Screen 1](./APZQEP-PHASE-7-SCREEN-1-AI-QUALITY-COMPANION.md) · [Screen 2](./APZQEP-PHASE-7-SCREEN-2-GENERATE-AND-ANALYSE.md) · [Screen 3](./APZQEP-PHASE-7-SCREEN-3-AI-REVIEW-QUEUE.md) · [Screen 4](./APZQEP-PHASE-7-SCREEN-4-AI-QUALITY-ANALYSIS-TRACEABILITY.md). Sequence: [APZQEP-PHASE-7-SEQUENCE.md](./APZQEP-PHASE-7-SEQUENCE.md).

```text
AUTHORISED CONTEXT → AI ANALYSIS → AI PROPOSAL / EXPLANATION
  → HUMAN REVIEW → ACCEPT / MODIFY / REJECT
  → EXISTING APZQEP AUTHORITATIVE DOMAIN
```

This report inspects repository truth first. It does not invent a parallel AI domain. It does not authorise implementation.

---

## Owner return block

```text
PHASE 7 DOMAIN RECONCILIATION:
ACCEPTED

PLATFORM AI FOUNDATION:
NONE

MODEL PROVIDER ABSTRACTION:
EXTEND

AI CONTEXT ASSEMBLY:
NEW

PLATFORM SEARCH:
NOT REQUIRED

SOURCE CONTEXT:
GAP

SOURCE.PERMISSION ENFORCEMENT:
GAP

SOURCE INDEX/CACHE LEAK RISK:
GAP

AI PROPOSAL:
NEW

PROPOSAL REVIEW:
NEW

PROPOSAL PROVENANCE:
EXTEND

CONVERSATION STATE:
EPHEMERAL

AI FINDING:
DERIVED

DETERMINISTIC QUALITY ANALYSIS:
EXTEND

AI QUALITY ANALYSIS:
NEW

TRACEABILITY:
REUSE

AUDIT:
EXTEND

AUTHZ:
EXTEND

TENANT ISOLATION:
GAP

APPLICATION ISOLATION:
GAP

STRUCTURED OUTPUT:
EXTEND

STALE PROPOSAL PROTECTION:
NEW

EMBEDDINGS:
NOT REQUIRED

VECTOR STORE:
NOT REQUIRED

MCP:
DEFER

AI DIRECT AUTHORITATIVE WRITE:
NO

SOURCE WRITE:
NOT AUTHORISED

AI RISK CREATION:
NO — PROPOSAL ONLY

AI GATE EVALUATION:
NO

AI CERTIFICATION:
NO

AI READINESS SCORE:
NO

SSH:
NOT AUTHORISED

TERMINAL:
NOT AUTHORISED

PHASE 7 IMPLEMENTATION:
NOT STARTED

PHASE 8:
NOT STARTED
```

---

## Minimum architecture (repository-derived)

Phase 7 does **not** need a model gateway engine, RAG, embeddings, MCP product IA, a chat product, or a Finding SoR.

The minimum that the four locked screens actually require:

1. **Permission-safe context composer (NEW)** — live reads of existing APZQEP APIs/read models, filtered by the calling user's grants **before** any model call. Source included only when `source.read` is present (stricter than today's Source HTTP OR-gate). Search is optional discovery, never the context SoR.
2. **Thin model invocation (EXTEND)** — reuse the existing OpenAI `chat/completions` + `response_format: json_object` pattern already in Quality Assist. Do not wait for deferred APE-AI. Do not embed a second provider stack inside APZQEP.
3. **One durable Proposal aggregate (NEW)** — single type-discriminated record for Screen 3. Not per-artefact tables. Not Quality Assist suggestion text. Not MCP string payloads. Model output remains untrusted input.
4. **Type-specific Accept adapters (NEW orchestration, REUSE writes)** — human Accept calls the **existing** domain create/update services (Story, AC, Test Specification, Suite, Plan, Exploratory, Experience, Trace, Issue, Defect, Quality Risk). Destination AuthZ and validation still run. No generic accept service.
5. **Deterministic gap analysis (EXTEND)** — Screen 4 counts such as “ACs with no Test Case” come from QEP data (definition coverage, executions, evidence, defects, risks, gates, trace links). LLM adds interpretation only.

Existing Quality Assist, MCP proposal ledgers, QI scores, and F7 Test Design Assist are **not** the Phase 7 product. Owner Decision 1: **absorb / supersede** those APZQEP-facing experiences; reuse only compatible primitives. Quality Assist / MCP ledgers must not become the Phase 7 SoR.

---

## 1. Existing AI foundation

Inspected code, not documentation claims. APE catalogue explicitly defers AI/RAG (`apps/web/lib/platform-engines/ape-catalogue.ts`: `ape-ai` and `ape-rag`, `maturity: "deferred"`). There is **no** platform AI Gateway, no token accounting service, no streaming assistant runtime, and no vector/embedding infrastructure.

| Capability                           | Where                                                                          | Production status                                                                                                                                                                                                                                                         | Classification                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Platform AI Gateway (APE-AI)         | `ape-catalogue.ts`                                                             | Catalogue stub, deferred                                                                                                                                                                                                                                                  | **NONE**                                                                           |
| RAG / embeddings / pgvector / Qdrant | no runtime packages                                                            | Docs and Metabase “embedding” only (dashboard embed, not vectors)                                                                                                                                                                                                         | **REJECT** for Phase 7                                                             |
| Governed Quality Assist              | `apps/web/lib/qep/quality-assist-service.ts`                                   | **Real.** Flag `APZHUB_QEP_AI_ASSIST` + `OPENAI_API_KEY`; otherwise rule-based. File-ledger sessions. Accept/reject **does not** write QEP SoR. Context is **caller-supplied**, not assembled.                                                                            | **EXTEND** provider call; **REJECT** as proposal/review SoR                        |
| AI Workspace UI                      | `apps/web/components/qep/qep-ai-workspace-views.tsx`, `ai-workspace-routes.ts` | **Real presentation** over Quality Assist; not the locked Phase 7 screens                                                                                                                                                                                                 | **DEFER** product IA (Owner decision)                                              |
| Permissions                          | `qep.ai_workspace.read` / `qep.ai_workspace.operate`                           | In `qep-core-qe-permissions.ts`; Reader gets read; Operator gets operate                                                                                                                                                                                                  | **REUSE** / **EXTEND**                                                             |
| OpenAI client (QEP)                  | `requestOpenAiSuggestions` in quality-assist-service                           | Direct `fetch` to `api.openai.com/v1/chat/completions`, model env `APZHUB_QEP_OPENAI_MODEL` or `gpt-4o-mini`, JSON object, 8 000 char context cap, secret redaction                                                                                                       | **EXTEND**                                                                         |
| OpenAI client (APZPEN)               | `apps/web/lib/apzpen/openai-intelligence.ts`                                   | Separate PEN advisory path. Not QEP context.                                                                                                                                                                                                                              | **REJECT** as QEP dependency                                                       |
| Quality Intelligence engine          | `packages/platform-quality-intelligence` + `packages/qep-quality-intelligence` | **Real PostgreSQL store** (`qep_qi_*`). Providers: rules / statistical / historical / **dummy_ai** (offline canned). Placeholder IDs: openai/claude/gemini/azure_openai/local_llm. HTTP under `/api/v1/qep/quality-intelligence/*` gated by `qep.qi.*`. Emits **scores**. | **DEFER** as Phase 7 companion; **REJECT** QI scores as quality score              |
| Test Design Assist (F7)              | `apps/web/lib/qep/test-design-assist.ts`                                       | **Real.** Ephemeral rule pack from SCM change impact. Human accept writes via `gateway.qep.specifications.create` + optional trace `origin: "ai_suggestion"`. Recomputes pack at accept time. Supports `acceptAll`.                                                       | **REUSE** write-path pattern; **REJECT** as Phase 7 proposal store; bulk **DEFER** |
| MCP stdio                            | `packages/qep-mcp-server`                                                      | JSON-RPC stub. Lookup tools **echo** `subjectRef`; they do not read QEP. `assist.propose_write` returns a local id only.                                                                                                                                                  | **DEFER**                                                                          |
| MCP HTTP                             | `apps/web/lib/qep/mcp-proposal-store.ts`, `/api/v1/qep/mcp`                    | File ledger of untyped `payload` strings. Accept/reject **does not** invoke domain writes. **No `tenantId`.** Catalogue `liveGatewayEnabled: false`. Permissions `qep.mcp-dx.*`.                                                                                          | **DEFER**; isolation **GAP**                                                       |
| Enterprise context composition       | `enterprise-context-composition-service.ts`                                    | Projects / workflow / support / knowledge fragments. **Not QEP.**                                                                                                                                                                                                         | **REJECT** as QEP AI context                                                       |
| Streaming                            | none in QEP assist                                                             | Non-streaming chat completions only                                                                                                                                                                                                                                       | **NOT REQUIRED**                                                                   |
| Tool calling                         | none (MCP tools are stubs)                                                     | —                                                                                                                                                                                                                                                                         | **DEFER**                                                                          |
| Usage / token metering               | none                                                                           | Config registry has `OPENAI_API_KEY` only                                                                                                                                                                                                                                 | **DEFER**                                                                          |
| Conversation / chat tables           | none for QEP; project conversations are APZPRD                                 | —                                                                                                                                                                                                                                                                         | **EPHEMERAL**                                                                      |
| Secrets                              | `.secrets/openai` via `@apzhub/config`                                         | Real local-secret loader                                                                                                                                                                                                                                                  | **REUSE**                                                                          |

**Consumers today:** AI Workspace UI; Quality Assist APIs; QI observations/recommendations APIs; F7 SCM test-design; MCP DX catalogue. None of these implement the locked four-screen operating model.

**Documentation vs code:** `docs/products/apzqep/architecture/AI-ARCHITECTURE.md` and sprint SPR-203 describe a future/governed assist. SPR-203 **did ship**. It is advisory sessions, not structured APZQEP proposals and not permission-assembled context.

---

## 2. Platform Search / QEP context availability

Platform Search exists (Meilisearch execution plane, APZSEARCH). QEP publication adapter `@apzhub/search-qep` maps **requirement, evidence, defect, baseline, relationship, trace link, verification** drafts. Spec publication in `apps/web/lib/search/wiring/qep-publication.ts` still comments a **stub** for test specifications. Stories, AC, test cases, suites, plans, executions, risks, gates, exploratory, UI/UX, readiness, and certification are **not** in that index.

Search is a **derived index**, not a System of Record. It is not a permission-safe substitute for live QEP reads:

- Tenant/org filters exist (`search-security-filters.ts`). QEP publication still sends `permissions: []` on the integration context (`packages/search-qep/src/index.ts` `toIntegrationContext`). Record-level QEP AuthZ is **not** represented in the index.
- Semantic/vector query is **explicitly unsupported** (`meilisearch-search-provider.ts`: `semantic: false`, `vector: false`; tests assert `NOT_SUPPORTED`).
- `search.source.*` permissions are **search-engine source configuration**, not Shared Source `source.read`.
- Meilisearch does **not** index git/Source file contents.
- `@apzhub/qep-knowledge-index` is another **derived** projection (evidence, suite, execution plan, execution, defect, requirement, document). It is not a Source blob store and must not become an AI duplicate SoR.

`postgresql_fts` is catalogue-reserved only; no FTS provider implementation.

Authoritative context for the locked screens can already be assembled from existing APIs/read models:

| Domain                             | Authority                                                 | Read path (representative)                                                            | AI context                                                                   |
| ---------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Application / Environment          | Application service                                       | `/api/v1/qep/applications/*`                                                          | **REUSE** live                                                               |
| Requirements                       | `@apzhub/qep-requirements`                                | `/api/v1/qep/requirements`, definition list                                           | **REUSE** live                                                               |
| Stories / AC                       | `@apzhub/qep-definition`                                  | `/api/v1/qep/user-stories`, `/acceptance-criteria/*`, definition list                 | **REUSE** live                                                               |
| Test Cases (specifications)        | `@apzhub/qep-test-specifications` / test-management       | `/api/v1/qep/specifications`, `/api/v1/qep/test-cases`                                | **REUSE** live                                                               |
| Suites / Plans                     | suites / plans packages                                   | `/api/v1/qep/test-suites`, `/plans`, `/test-plans`                                    | **REUSE** live                                                               |
| Executions                         | `@apzhub/qep-test-execution`                              | `/api/v1/qep/executions`                                                              | **REUSE** live                                                               |
| Evidence                           | `@apzhub/qep-evidence`                                    | `/api/v1/qep/evidence`                                                                | **REUSE** metadata; body/binary see Owner decision                           |
| Defects                            | defects package                                           | `/api/v1/qep/defects`                                                                 | **REUSE** live                                                               |
| Exploratory / Observations / UI-UX | `@apzhub/qep-experience`                                  | `/exploratory-sessions`, `/experience-plans`, `/experience-activities`                | **REUSE** live                                                               |
| Quality Issues                     | experience `quality_issue`                                | `/api/v1/qep/quality-issues/[issueId]/actions` only — **no list/get SoR route found** | **GAP** for Screen 4 issue inventory; do not invent a Finding SoR to fill it |
| Quality Risks / Gates / Readiness  | `@apzhub/qep-assurance`                                   | `/api/v1/qep/quality-gates`, risks, posture                                           | **REUSE** live                                                               |
| Certification                      | F4 `qep_qo_document` `kind = f4_certification_evaluation` | certification APIs                                                                    | **REUSE** read; **REJECT** AI write                                          |
| Traceability                       | `@apzhub/qep-traceability`                                | `/api/v1/qep/traceability/trace-links`                                                | **REUSE** live                                                               |
| SCM change events                  | `@apzhub/platform-scm` / QEP SCM runtime                  | `/api/v1/qep/scm/*`                                                                   | **REUSE** only as QEP SCM metadata; **not** Source file context              |
| Source files / diffs / search      | Source workspace                                          | `/api/v1/source/repositories/*/file                                                   | tree                                                                         | diff | search` | **GAP** — see §3 |

**Conclusion:** Do not create an AI-indexed copy of QEP. Prefer live/read-model composition. Platform Search is **NOT REQUIRED** for the four screens. A later search-assisted _locator_ (then authoritative GET) would be EXTEND, not a Phase 7 dependency.

---

## 3. Source permission boundary

### How Source works today

Nav and shell treat Source as **independent** of QEP:

- Sidebar / rail require `source.read` specifically (`compose-qep-sidebars.ts`, `compose-workbench-rail.ts`).
- `hasQepPermission`: `qep.*` does **not** imply `source.read` (`qep-permission.ts` tests).
- `source.write` does not imply read.
- Resource scope keys `source.repo:{id}` restrict repositories (`apps/web/lib/source/repo-scope.ts`).

Default Reader/Operator catalogues **do** include `source.read` (`QEP_READER_PERMISSIONS`, `QEP_OPERATOR_PERMISSIONS`). Restricted personas without it are the Phase 7 case the visuals freeze.

### HTTP enforcement — GAP versus Phase 7 freeze

Shared Source handlers use **OR**:

```36:41:apps/web/lib/api/v1/handlers/source-workspace.ts
function requireSourceRead(context: PlatformApiRequestContext): void {
  requireQepPermission(context, "qep.scm.read", "source.read");
}
```

`requireQepPermission` is any-of. `qep.scm.read` **or** `qep.*` therefore opens:

- file content (`handleSourceGetFile`)
- tree, commits, branches, diffs
- **repository file search** (`handleSourceSearch` → `runtime.searchRepositoryFiles`)

Repo scope treats `qep.*` as **unrestricted** (`unrestrictedKeys: ["source.*", "source.repo.*", "qep.*", "qep.scm.administer"]`).

Phase 7 freeze:

```text
NO source.read  → NO repository/source context
source.read     → authorised read context only
source.write    → independent; NOT granted by Phase 7
```

That freeze is **not** how Source HTTP works today. A user with QEP SCM read and without `source.read` can already fetch file bytes. AI that called those handlers would inherit the same hole.

`qep.scm.read` remains legitimate for **Builds & CI / SCM change events / application-repository association**. It must not be treated as Source file authorisation for AI.

### Index / cache leak — do not assume no

| Channel                        | Source file content today?                                                                                                                       | Leak to user without `source.read`?                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Embeddings / vector index      | **None found**                                                                                                                                   | Not applicable for vectors                                                                           |
| Platform Search QEP drafts     | Titles/summaries of a **subset** of QEP entities, not git blobs. Semantic/vector `NOT_SUPPORTED`. Drafts published with empty `permissions: []`. | Not a Source-file index. Do not use as permission-filtered AI context.                               |
| QEP Knowledge Index            | Derived projections (evidence/suite/execution/defect/requirement/document)                                                                       | Not Source file content; **REJECT** as AI copy                                                       |
| SCM offline workspace          | In-memory demo blobs in `packages/platform-scm` providers — not a cross-user Redis cache                                                         | Served only through Source HTTP (which currently also accepts `qep.scm.read`)                        |
| `search.source.read`           | Search _source config_, different permission                                                                                                     | Naming collision only                                                                                |
| Source HTTP file/search        | **Yes**                                                                                                                                          | **Yes**, if caller has `qep.scm.read`                                                                |
| SCM change impact              | Paths + titles used by F7 / quality graph                                                                                                        | **Metadata paths**, not full files; still Source-adjacent                                            |
| Quality Assist `context` field | Whatever the client posted, persisted in tenant file ledger                                                                                      | **Yes**, if a privileged user pasted Source into context; listed to any `qep.ai_workspace.read` peer |
| MCP `payload`                  | Untyped string, **no tenant isolation**                                                                                                          | **Yes** — cross-tenant list/get                                                                      |

**SOURCE.PERMISSION ENFORCEMENT:** **GAP** (nav is correct; APIs and AI ledgers are not exclusive to `source.read`).  
**SOURCE INDEX/CACHE LEAK RISK:** **GAP** (HTTP OR-gate + persisted caller context; no embedding leak).  
**SOURCE CONTEXT:** **GAP** — no permission-safe AI source assembler exists. Minimum Phase 7 rule: never call Source file/diff/search unless the session has **`source.read`**, regardless of `qep.scm.read`. Do not repair the Source OR-gate in this phase unless separately authorised; AI must not use the leak even if the API still has it.

---

## 4. AI context assembly

Nothing in the repository composes:

`user + tenant + Application + optional Environment + effective permissions + selected QEP records + related trace + optional Source`

Quality Assist asks the client to send `subjectRef` + `context`. That is the opposite of a server-side permission boundary.

**Required mechanism:** NEW server composer.

| Input                     | Method                                                                                                  | Notes                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Identity / tenant         | Session (`sessionTenantId`)                                                                             | **REUSE**                                 |
| Application / Environment | Live Application service                                                                                | Fail closed if missing/unauthorised       |
| QEP records               | Live GET/list of each domain the user can already read                                                  | Permission-filter **before** prompt       |
| Related trace             | Live trace-link reads + definition coverage                                                             | **REUSE**                                 |
| Source                    | Only if `source.read`; then Source GET; store **references** (repo, path, rev), not a second Source SoR | **GAP** until exclusive check             |
| Search                    | Optional locator                                                                                        | **NOT REQUIRED**                          |
| Cache                     | Do not cache Source or Evidence bodies for other principals                                             | Existing assist ledger is unsafe to reuse |
| Embeddings                | —                                                                                                       | **NOT REQUIRED**                          |

Combination: **live read + read-model composition**. Bounded, request-scoped. No AI duplicate index.

---

## 5. Screen 1 — AI Quality Companion

| Surface                                     | Repository truth                                                                                                 | Classification                                           |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Context snapshot                            | Application/Environment/readiness already readable; Source Access flag can be derived from `source.read`         | **existing composition**                                 |
| Quality summary / Current Readiness Posture | Phase 6 posture APIs                                                                                             | **derived presentation** — not an AI score               |
| Suggestions                                 | Quality Assist suggestions are generic text, not QEP-typed; Screen 4 gaps can feed suggestions deterministically | mix **derived** + **AI-generated ephemeral**             |
| Ask AI                                      | No QEP conversation store. Visuals: lightweight, not a chat product                                              | **ephemeral** (request/session). Durable chat **REJECT** |
| Recent activity                             | No Phase 7 activity stream. Could later derive from proposal audit                                               | **derived** once proposals exist; until then ephemeral   |
| Quick actions                               | Navigation/intents into Screens 2–4                                                                              | **derived presentation**                                 |

Ask AI must use the same composer as §4. It must not become Generate & Analyse.

---

## 6–8. Generate & Analyse, proposal domain, Review Queue

### What already looks like a proposal (and why it is not enough)

| Existing artefact         | Shape                                                            | Accept writes SoR?                                        | Fit for Screens 2–3                                        |
| ------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------- |
| Quality Assist suggestion | title, rationale, actions[], confidence                          | No — ledger status only                                   | **REJECT** as SoR                                          |
| MCP write proposal        | `payload: string`                                                | No                                                        | **REJECT**                                                 |
| F7 Test Design pack       | Structured spec-like drafts, **ephemeral**, recomputed on accept | Yes → specifications.create                               | Pattern **REUSE**; store **REJECT**; `acceptAll` **DEFER** |
| QI recommendation         | general_quality + scores                                         | accept/reject inside QI store, not QEP Story/AC/Spec/Risk | **REJECT** as APZQEP proposal                              |

Screen 3 requires pending items, comparison, provenance, Accept / Modify / Reject, and a resulting authoritative id. That is a **durable Proposal aggregate**. File-ledger assist/MCP stores are the wrong semantics and the wrong isolation.

### Minimum Proposal responsibility (one aggregate, not per type)

Semantic fields (not an implementation schema):

- tenant, Application, optional Environment
- proposal type (discriminator)
- target/reference ids
- structured proposed content (JSON matching the destination create/update contract)
- context/provenance **references** (record ids, optional source repo/path/rev, sourceAuthorised boolean)
- model/provider identity, generation time
- review status, reviewer, decision, timestamps
- original generated content + human-modified content
- target **fingerprints** at generation (see §25)
- resulting authoritative record reference after Accept

Representation: **one** application-scoped store (PostgreSQL would match Phase 6 QEP durability; file ledger would repeat MCP/assist isolation mistakes). **Do not** create `qep_ai_story_proposal`, `qep_ai_risk_proposal`, ….

Immutable versions: **not** a full version table. Keep **original** and **reviewed** payloads on the same record. Further regenerates are new proposals (Screen 2 Refine/Regenerate), not a git history of AI.

Discarded Screen 2 drafts need not persist. **Send to Review** is the durability boundary the visuals establish.

### Accept invokes existing writes

Examples already proven in code:

- Test Case / specification → `gateway.qep.specifications.create` (`CreateQepTestSpecificationInput`) — F7 already does this.
- Story / AC → `definition-service.createStory` / `createCriterion`, including `originType: "ai_accepted"` requiring `acceptedBy`.
- Trace → `createTraceLink` with `origin: "ai_suggestion"` then human authority (provisional until asserted).
- Quality Risk → `assurance-service.createRisk`.
- Defect / Issue / Exploratory / Suite / Plan → existing create/update services.

AI Accept is orchestration + AuthZ + stale check. The destination service remains the SoR.

---

## 9. Accept is not universal

No generic “accept any proposal” service. Matrix from locked visuals + Phase 1–6 domain locks:

| Proposal type                                                   | AI may                                                | Human Accept into existing SoR?                                     | Destination authority                   |
| --------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------- |
| User Story                                                      | propose                                               | **Yes** — if `createStory` AuthZ                                    | qep-definition                          |
| Acceptance Criterion                                            | propose                                               | **Yes**                                                             | qep-definition (`ai_accepted`)          |
| Test Case / steps                                               | propose                                               | **Yes**                                                             | test-specifications                     |
| Suite content                                                   | propose                                               | **Yes** (add members / create suite)                                | suites                                  |
| Test Plan content                                               | propose                                               | **Yes**                                                             | plans                                   |
| Exploratory Charter                                             | propose                                               | **Yes**                                                             | experience / exploratory                |
| UI/UX Criteria                                                  | propose                                               | **Yes**                                                             | experience                              |
| Trace Link                                                      | propose                                               | **Yes** — typed createTraceLink; never silent                       | traceability                            |
| Quality Risk                                                    | **draft / propose only**                              | **Yes** as “Create Risk from Proposal”, never AI-created            | qep-assurance                           |
| Issue                                                           | propose                                               | **Yes** into existing quality_issue                                 | experience                              |
| Defect                                                          | **propose only**                                      | **Yes** into existing Defect create; AI must not open defects alone | defects                                 |
| Gate evaluation                                                 | **analyse only**                                      | **No**                                                              | Phase 6 `qep.gate.evaluate` stays human |
| Certification / GO / CONDITIONAL_GO / NO_GO / DEFER / exception | **analyse only**                                      | **No**                                                              | F4 dual authority                       |
| Current Readiness Posture                                       | **analyse / summarise only**                          | **No** — derived, not a write                                       | Phase 6                                 |
| Evidence                                                        | **analyse**; may propose “attach existing evidence”** | **No fabricating evidence**                                         | evidence integrity                      |
| Source / commit / PR                                            | **read if source.read**                               | **No** — `source.write` not granted                                 | Source                                  |

Certification remains human-only. Gate evaluation remains Phase 6. Risk/Defect creation remains human via proposal Accept, not AI insert.

---

## 10–11. Screen 4 analysis and Finding semantics

Deterministic facts the repository can already prove or cheaply EXTEND (Application-scoped queries over existing tables/read models):

| Fact (visual examples are illustrative) | Existing lever                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC without verification / Test Case     | **Deterministic via definition coverage, not a dedicated AC→test_case trace type.** `deriveCriterionCoverage`: `verificationCount === 0` → `coverage: "gap"`. Verification links allow `assetKind: "test_specification"` only. Trace taxonomy `requirement_tested_by` is requirement→test_case. `acceptance_criterion` is an endpoint kind but is **not** in `NORMATIVE_TRACE_TAXONOMY` allowed pairs. Screen 4 “ACs with no Test Case” should use AC→specification verification gaps (EXTEND query if the visual means native Test Case ids). |
| Requirement uncovered                   | enterprise-requirements `uncoveredOnly` (`!suiteLinked` in requirements-traceability coverage); reporting `uncovered_requirements`                                                                                                                                                                                                                                                                                                                                                                                                             |
| Missing trace links                     | trace-link list vs taxonomy `mandatory_for_coverage`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Executions / failures                   | execution list + result states                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Failed execution without Evidence       | join executions ↔ evidence relationships (EXTEND query; data exists)                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Defect without AC relationship          | defects + trace/relationships (EXTEND query)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Open Risks                              | `listRisks(tenant, applicationId)`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Failed Gates                            | gate evaluations (immutable)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Readiness / Certification               | posture + F4 documents                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

**Prefer SQL/read models for those counts.** Do not ask an LLM “how many ACs have no Test Case.”

AI value on Screen 4: patterns, summaries, **possible** relationships, risk **candidates**, semantic alignment. Those are **ephemeral analysis results**. Actions (Draft Risk, Generate Tests, Propose Link) enter Screens 2–3.

**Finding SoR:** **not required.** Compare:

| Concept                       | Already exists             | Phase 7 use                                                       |
| ----------------------------- | -------------------------- | ----------------------------------------------------------------- |
| Deterministic gap row         | coverage, reporting, trace | **DERIVED** presentation                                          |
| QI observation/recommendation | `qep_qi_*`                 | **REJECT** as Screen 4 Finding SoR (wrong grain, includes scores) |
| Quality Issue / Observation   | experience                 | Only if human Accept creates one                                  |
| Quality Risk                  | assurance                  | Only via proposal Accept                                          |

Cached analysis: optional TTL later; not a SoR. **AI FINDING: DERIVED.**

---

## 12. Conversation state

Locked Screen 1: Ask AI is contextual, not a chat product. No QEP convention requires durable threads (Quality Assist sessions are a prior ledger, not this UX).

**CONVERSATION STATE: EPHEMERAL.** Session-scoped multi-turn in memory/UI is allowed. Do not create a chat SoR. Recent activity should come from proposal/review events once they exist, not from transcripts.

---

## 13–14. Provenance and audit

### Resulting records — EXTEND existing origin fields

- Stories/AC: `originType: "ai_accepted"` + `acceptedBy` already enforced.
- Trace links: `origin: "ai_suggestion"` starts **provisional**; human authority required for authoritative.
- F7 already stamps `provenance.sourceSystem = "apzqep.f7.test_design_assist"`.

Prefer **references** (ids, repo, path, rev, `sourceAuthorised`) over copying Source/Evidence bodies into provenance.

### Proposal-level provenance — NEW on the proposal record

Model/provider, generation time, Application, context refs, reviewer, decision, resulting id. Do not copy sensitive Source content.

### Audit — EXTEND, do not create an AI audit store

| Facility                                                                         | Fit                                                                                                                                                            |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@apzhub/platform-audit`                                                         | Tenant-scoped envelope; **EXTEND** with QEP AI actions (`proposal.generated` / `.modified` / `.accepted` / `.rejected` / `model.invoked` / `context.boundary`) |
| Domain audits (definition `listAudit`, evidence audit, risk audit, spec history) | **REUSE** for the authoritative write                                                                                                                          |
| `qep-audit-store.ts` file ledger                                                 | MVP trail, capped 500, not tenant-safe enough as product audit                                                                                                 | **REJECT** as Phase 7 audit SoR |

Model invocation and permission-boundary events belong on platform audit (no prompt/Source bodies in logs).

---

## 15. AuthZ

Phase 7 does **not** need a new permission taxonomy to start. Separate concerns:

| Ability                     | Existing key / path                                                                 |
| --------------------------- | ----------------------------------------------------------------------------------- |
| Use AI companion / generate | **REUSE** `qep.ai_workspace.operate` (read: `qep.ai_workspace.read`)                |
| Read underlying QEP objects | **REUSE** each domain read (`qep.specification.read`, `qep.risk.read`, …)           |
| Read Source                 | **REUSE** `source.read` exclusively for AI Source context                           |
| Review proposals            | **EXTEND** same operate key **or** Owner splits review (see Owner decisions)        |
| Authoritative write         | **REUSE** destination create/update/evaluate/decide — **server-side**, after Accept |

AI permission must never substitute for `qep.certification.decide`, `qep.gate.evaluate`, `source.write`, or Defect/Risk create grants.

---

## 16. Tenant / Application isolation

| Store                   | Tenant                                                  | Application                                                  | Record-level              | Source                       | Provider request   |
| ----------------------- | ------------------------------------------------------- | ------------------------------------------------------------ | ------------------------- | ---------------------------- | ------------------ |
| QEP SoRs (Phase 1–6)    | **PASS** (session tenant)                               | **PASS** where Application-scoped (risks, gates, definition) | **PASS** via domain AuthZ | independent                  | n/a                |
| Quality Assist sessions | filtered by tenant                                      | **GAP** — no applicationId                                   | subjectRef opaque         | caller context               | one shared env key |
| MCP proposals           | **GAP** — no tenantId; `listMcpProposals()` returns all | **GAP**                                                      | none                      | payload may contain anything | n/a                |
| QI postgres             | tenantId on rows                                        | not Application-scoped                                       | observation-level         | n/a                          | dummy_ai offline   |

**TENANT ISOLATION / APPLICATION ISOLATION:** **GAP** on existing AI ledgers. Phase 7 must **not** reuse those stores. A new Proposal + composer keyed by `tenantId` + `applicationId`, using session tenant only, with no cross-tenant prompt content, is the minimum that would **PASS**. Cache/provider isolation: one process-wide OpenAI key today; no tenant credential partition exists — **DEFER** tenant provider config; still never mix tenant payloads in one prompt.

---

## 17. Provider / model architecture

There is **no** platform provider abstraction to consume. QI’s `IntelligenceProvider` interface is the closest contract, but live OpenAI is **not** wired there (`dummy_ai` + placeholders). Quality Assist and APZPEN each `fetch` OpenAI directly.

Phase 7 minimum: **EXTEND** the Quality Assist invocation (flag, secret, JSON object, timeout/error fallback to honest failure — **do not** silently swap in another tenant’s context). Do not implement APE-AI. Visual “OpenAI GPT-4o” is **not** authority; env model name already defaults to `gpt-4o-mini`.

Missing today (all **DEFER** unless a later sprint requires them): streaming, tool calling, cost tracking, usage tracking, provider failover, tenant-level credentials.

Retries: Quality Assist currently **falls back to rule-based suggestions** on OpenAI failure. Screen 2–3 must **not** silently substitute a different authority or invented structured proposal. Honest unavailable state (**EXTEND** the disabled-flag behaviour; **REJECT** silent rule-as-structured-Test-Case).

---

## 18. Data governance

Repository-proven controls:

| Control                                          | Evidence                                                          |
| ------------------------------------------------ | ----------------------------------------------------------------- |
| API key not in git                               | `.secrets/openai` loader; config registry                         |
| Prompt redaction of `sk-` / GitHub tokens        | `redact()` in Quality Assist and APZPEN                           |
| Context size cap                                 | 8 000 chars on assist                                             |
| Feature flag for live LLM                        | `APZHUB_QEP_AI_ASSIST`                                            |
| Provider data-retention / zero-retention setting | **None**                                                          |
| Tenant AI policy / DPA toggle                    | **None**                                                          |
| Evidence blob exclusion                          | **None** — composer must not send attachments unless authorised   |
| Log exclusion of prompts/Source                  | **Not proven**; assist persists full `context` in `sessions.json` |
| Usage records                                    | **None**                                                          |

Do not claim retention or sensitive-data policy exists. Minimum Phase 7: do not persist Source bodies or Evidence binaries in proposal/audit; store references; redact secrets; fail closed when flag/secret missing.

---

## 19–20. Embeddings, vector search, MCP

**Embeddings / vector store: NOT REQUIRED.** The four screens are Application-scoped authorised records plus optional Source files. Relatedness for Screen 4 is largely graph/trace/coverage. Semantic “possible link” can be a single-shot model judgement over already-fetched records. No Qdrant/pgvector exists to reuse.

**MCP: DEFER.** Stubs cannot safely expose QEP. Current tools would bypass tenant/Application AuthZ if they actually read. Phase 7 product is in-app companion/review, not IDE agents. Do not authorise MCP implementation.

---

## 21–22. Structured output and Modify

Pipeline (untrusted model → human → domain):

```text
LLM JSON (response_format json_object, already used)
  → proposal-type Zod / structural check
  → persist as Proposal (original)
  → human Modify (reviewed payload)
  → destination domain validation + AuthZ + write
```

Human Accept must not skip server validation. F7 already maps drafts onto `CreateQepTestSpecificationInput`. Definition and assurance services already validate create inputs.

**Modify:** edit proposed content on the proposal; then Accept. Retain **both** original AI payload and human-modified payload for auditability. Do not treat Modify as an in-place SoR update.

---

## 23. Bulk review

Locked Screen 3: **no** “apply everything” control. F7 `acceptAll` is an existing SCM-assist behaviour, not Phase 7 authority.

**DEFER** bulk acceptance.

---

## 24. Failure / unavailable states

Honest behaviour (no silent authority change):

| Condition                                   | Behaviour                                                                       |
| ------------------------------------------- | ------------------------------------------------------------------------------- |
| Provider unavailable / timeout / empty JSON | Surface disabled/unavailable; **do not** emit a fake typed Test Case from rules |
| Invalid structured output                   | Stay in Screen 2 as failed generation; no Review item                           |
| Context unavailable                         | Fail closed                                                                     |
| Source unauthorised                         | Context snapshot **Source Access: Not Authorised**; omit Source; do not fetch   |
| Source provider unavailable                 | Omit Source with explicit reason; continue QEP context                          |
| Stale proposal / target changed / deleted   | Block Accept; require regenerate or explicit re-base                            |
| Permission revoked before review            | Fail Accept; destination AuthZ is authoritative                                 |
| Reviewer lacks destination write            | Show allowed analyse/reject only; no Accept                                     |
| Target record changed                       | §25                                                                             |

Do not retry into a different model, tenant, Application, or Source scope.

---

## 25. Stale proposals

F7 **recomputes** drafts at accept time — that is a different product and can accept against a world the human did not see.

Phase 7 Screen 3 comparison requires detecting:

> Proposal generated against AC-142; AC-142 changed before review.

Existing fingerprints to **reuse as inputs** (not a new versioning product):

- Requirements: `contentVersionId` on relationships/baselines
- Specs: `updatedAt` + append-only `specification-history`
- Stories/AC/Risks/Gates: `updatedAt` / immutable gate evaluations
- Trace links: lifecycle/authority

**STALE PROPOSAL PROTECTION: NEW** — store those fingerprints on the proposal at generation; on Accept, re-read and compare. Mismatch → refuse blind Accept. Do not rely on F7 recompute.

Optimistic concurrency on destination writes (where it exists) is additional defence, not sufficient provenance for Screen 3.

---

## 26. Existing domain integrity

Phase 7 must not open an alternate route around Phase 1–6:

| Control                             | AI rule                                                              |
| ----------------------------------- | -------------------------------------------------------------------- |
| Source independence                 | `source.read` exclusive for Source context; `source.write` untouched |
| Evidence integrity                  | No fabricated evidence; no silent attach                             |
| Defect lifecycle                    | Proposal only; existing create/lifecycle                             |
| Execution history                   | Read-only for AI                                                     |
| Risk authority                      | Human Create Risk from Proposal                                      |
| Gate authority                      | Analyse only                                                         |
| Readiness                           | Derived posture; no AI score                                         |
| Certification dual authority        | Analyse only; never GO family                                        |
| Blocking Gate exception             | Untouched                                                            |
| Certification snapshot immutability | Untouched                                                            |
| SSH / Terminal                      | **NOT AUTHORISED**                                                   |

`ORIGIN_TYPES` / `ai_suggestion` already mark AI-influenced records without making AI the SoR.

---

## Capability classification summary

| Item                                             | Class                                         |
| ------------------------------------------------ | --------------------------------------------- |
| APE-AI / APE-RAG                                 | **NONE** / **REJECT**                         |
| Quality Assist OpenAI call                       | **EXTEND**                                    |
| Quality Assist / MCP / QI recommendation stores  | **REJECT** as Phase 7 SoR                     |
| F7 specification write on human accept           | **REUSE** pattern                             |
| Live QEP APIs as context                         | **REUSE**                                     |
| Context composer                                 | **NEW**                                       |
| Platform Search as AI context                    | **NOT REQUIRED**                              |
| Source-safe context                              | **GAP** then **NEW** check                    |
| Proposal aggregate                               | **NEW**                                       |
| Review queue                                     | **NEW**                                       |
| Destination writes                               | **REUSE**                                     |
| Deterministic gaps                               | **EXTEND** queries                            |
| AI interpretation                                | **NEW** ephemeral                             |
| Findings table                                   | **REJECT**                                    |
| Chat/conversation SoR                            | **REJECT**                                    |
| Provenance on QEP records                        | **EXTEND** `ai_accepted` / `ai_suggestion`    |
| Audit                                            | **EXTEND** platform-audit                     |
| AuthZ                                            | **EXTEND** `qep.ai_workspace.*` + destination |
| Embeddings / vector / MCP product                | **NOT REQUIRED** / **DEFER**                  |
| Bulk accept                                      | **DEFER**                                     |
| Tenant AI provider config / metering / streaming | **DEFER**                                     |

---

## Owner decisions

**RESOLVED** 2026-08-20. Authority: [APZQEP-PHASE-7-DOMAIN-LOCK.md](./APZQEP-PHASE-7-DOMAIN-LOCK.md).

1. **Existing AI capabilities:** ABSORB / SUPERSEDE for APZQEP product experience. Selective technical reuse. MCP deferred. No AI quality score.
2. **Generator may accept own proposal:** YES, subject to destination domain authority re-evaluated at Accept time.
3. **Evidence model context:** metadata by default; bounded body extracts only on explicit authorised use.

Source security condition is locked with those decisions: Phase 7 must not consume Source through any path where `qep.scm.read` substitutes for `source.read`.

---

## What is not in this report

- Implementation inventory (not yet authorised).
- Implementation.
- Phase 8.

---

```text
PHASE 7 VISUAL DESIGN:
COMPLETE

PHASE 7 DOMAIN RECONCILIATION:
ACCEPTED

OWNER DECISIONS:
RESOLVED (3)

DOMAIN LOCK:
ACCEPTED / CLOSED

IMPLEMENTATION INVENTORY:
DRAFTED — AWAITING OWNER REVIEW

PHASE 7 IMPLEMENTATION:
NOT STARTED

PHASE 8:
NOT STARTED
```
