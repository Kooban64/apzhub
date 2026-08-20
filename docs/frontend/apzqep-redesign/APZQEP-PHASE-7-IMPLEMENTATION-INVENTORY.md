# APZQEP Phase 7 — implementation inventory

**Status:** APPROVED / LOCKED  
**Date:** 2026-08-20  
**Owner review:** APPROVED WITHOUT CHANGE  
**Implementation:** AUTHORISED — [APZQEP-PHASE-7-IMPLEMENTATION-AUTHORITY.md](./APZQEP-PHASE-7-IMPLEMENTATION-AUTHORITY.md)  
**Domain lock:** [APZQEP-PHASE-7-DOMAIN-LOCK.md](./APZQEP-PHASE-7-DOMAIN-LOCK.md) — **ACCEPTED / CLOSED**  
**Reconciliation:** [APZQEP-PHASE-7-DOMAIN-RECONCILIATION-REPORT.md](./APZQEP-PHASE-7-DOMAIN-RECONCILIATION-REPORT.md)  
**Visuals:** Screens [1](./APZQEP-PHASE-7-SCREEN-1-AI-QUALITY-COMPANION.md)–[4](./APZQEP-PHASE-7-SCREEN-4-AI-QUALITY-ANALYSIS-TRACEABILITY.md) LOCKED

This is a finite definition of what “Phase 7 complete” means. Do not expand the inventory during coding.

Phases 1–6 SoRs stay untouched except additive origin/provenance on accepted writes. Phase 7 sits **above** those SoRs.

Approved chain:

```text
Authorised QEP Facts
  → Permission-Safe AI Context
  → AI Generate / Analyse
  → Typed Proposal
  → Human Review
  → Destination AuthZ Re-evaluation
  → Existing APZQEP Authoritative SoR
```

Mandated delivery order: **P7-01 through P7-08 before Screens 1–4.** Isolation, Source fail-closed, context, proposal, Accept, and deterministic analysis must be correct before Companion / Generate / Review / Analysis are considered delivered.

---

## Done when

All sixteen items below are delivered against the locked visuals and domain lock, with tests and evidence. Out of scope is not “later in the same PR.”

---

## Inventory summary (16)

| ID        | Title                                              | Screens | Acceptance (one line)                                                                                                                       |
| --------- | -------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **P7-01** | Tenant + Application isolation                     | All     | Cross-tenant or cross-Application context/proposal/Accept is 403/404; no mixed-tenant model payload.                                        |
| **P7-02** | AuthZ family                                       | All     | `qep.ai_workspace.*` never grants destination writes; Accept re-evaluates current destination AuthZ.                                        |
| **P7-03** | Source fail-closed                                 | All     | Without `source.read`, no Source file/tree/diff/search/cache/index/caller/derived content reaches AI; `qep.scm.read` cannot substitute.     |
| **P7-04** | Permission-safe context composer + Evidence policy | All     | Server composes live authorised QEP context before any model call; Evidence is metadata by default.                                         |
| **P7-05** | Model invocation                                   | 1, 2, 4 | Existing OpenAI JSON call reused; unavailable/invalid output fails honestly; no silent rule-minted structured proposals.                    |
| **P7-06** | Typed Proposal + provenance + stale protection     | 2, 3    | One Application-scoped proposal; original + modified retained; stale target refuses Accept.                                                 |
| **P7-07** | Type-specific Accept                               | 3       | Accept invokes existing domain writes only; no generic accept; Gate/Certification/Risk-insert/Defect-insert remain prohibited as AI writes. |
| **P7-08** | Deterministic quality analysis                     | 1, 4    | Screen 4 gap counts come from QEP data, not the LLM.                                                                                        |
| **P7-09** | AI generate / analyse                              | 1, 2, 4 | Structured untrusted model output validated; Screen 4 AI is interpretation only.                                                            |
| **P7-10** | Screen 1 — AI Quality Companion                    | 1       | Companion matches locked visual; Source Access visible; Ask AI ephemeral.                                                                   |
| **P7-11** | Screen 2 — Generate & Analyse                      | 2       | Workbench produces proposals only; Send to Review; no Save/Create Test Case/Create Risk.                                                    |
| **P7-12** | Screen 3 — AI Review Queue                         | 3       | Pending / compare / provenance / Accept / Modify / Reject; no bulk apply.                                                                   |
| **P7-13** | Screen 4 — AI Quality Analysis / Traceability      | 4       | Deterministic chain + advisory findings; no AI quality score; actions enter Screens 2–3.                                                    |
| **P7-14** | Legacy AI absorb / supersede                       | All     | Phase 7 is the APZQEP AI product; competing AI Workspace / Quality Assist / MCP DX / F7 UX hidden or retired.                               |
| **P7-15** | Audit                                              | All     | Proposal generated/modified/accepted/rejected, model invoked, and context-boundary events are audited without Source/Evidence dumps.        |
| **P7-16** | Presentation + focused certification               | All     | Light/dark/mobile plus end-to-end proofs of the locked flow and Source fail-closed.                                                         |

---

## P7-01 — Tenant + Application isolation

| Field                                    | Content                                                                                                                                                                                  |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                                   | P7-01                                                                                                                                                                                    |
| **TITLE**                                | Tenant + Application isolation                                                                                                                                                           |
| **PURPOSE**                              | Every Phase 7 context assembly, model request, and Proposal is session-tenant and `qep_application`-bound. Close isolation gaps in Quality Assist / MCP ledgers by **not reusing them**. |
| **EXISTING AUTHORITY REUSED**            | Session tenant, `qep_application`, Phase 6 list-reject pattern                                                                                                                           |
| **NEW/EXTENDED DOMAIN REQUIRED**         | Isolation on the Proposal aggregate and composer. No cross-Application proposal leakage. Provider request contains one tenant + one Application only                                     |
| **API/READ MODEL IMPACT**                | All Phase 7 list/get/mutate reject cross-tenant and cross-application ids server-side                                                                                                    |
| **UI SCREEN(S)**                         | All — Application selector required                                                                                                                                                      |
| **AUTHZ/ISOLATION REQUIREMENTS**         | Server-side only. Do not persist Phase 7 proposals in MCP/assist file ledgers                                                                                                            |
| **MIGRATION/COMPATIBILITY REQUIREMENTS** | Do not migrate MCP/assist sessions into the Proposal SoR                                                                                                                                 |
| **EVIDENCE REQUIRED FOR PASS**           | Cross-application GET/mutate 404/403. Tenant mismatch 404/403. Prompt/context assembly never includes another tenant’s records                                                           |

---

## P7-02 — AuthZ family

| Field                                    | Content                                                                                                                                                                                                                    |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                                   | P7-02                                                                                                                                                                                                                      |
| **TITLE**                                | AuthZ family                                                                                                                                                                                                               |
| **PURPOSE**                              | Separate ability to use AI from ability to read QEP, read Source, review, and perform the destination write. Generator may Accept only with destination authority.                                                         |
| **EXISTING AUTHORITY REUSED**            | `qep.ai_workspace.read` / `qep.ai_workspace.operate`; all destination domain keys; `source.read` exclusive for Source                                                                                                      |
| **NEW/EXTENDED DOMAIN REQUIRED**         | Accept-time re-evaluation of **current** destination permission. No new parallel permission catalogue unless a split is proven necessary during this item — default is extend existing `qep.ai_workspace.*`                |
| **API/READ MODEL IMPACT**                | Operate grants Generate / Send to Review / Modify / Reject / Ask AI. Accept still requires the destination create/update key at that moment                                                                                |
| **UI SCREEN(S)**                         | All — permission-filtered chrome; Accept hidden/disabled when destination write is absent                                                                                                                                  |
| **AUTHZ/ISOLATION REQUIREMENTS**         | `qep.ai_workspace.*` never substitutes for Story/AC/Spec/Suite/Plan/Trace/Defect/Risk/Evidence/Gate/Certification grants. Certification dual authority and Gate evaluate unchanged                                         |
| **MIGRATION/COMPATIBILITY REQUIREMENTS** | Existing `qep.ai_workspace.*` grants continue; no wholesale recatalogue                                                                                                                                                    |
| **EVIDENCE REQUIRED FOR PASS**           | Actor with AI operate but without `qep.specification.create` cannot Accept a Test Case proposal. Revoke destination write after generate → Accept fails. Read-only AI actor cannot Accept. Assist/MCP still cannot certify |

---

## P7-03 — Source fail-closed

| Field                                    | Content                                                                                                                                                                                                                                                                                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                                   | P7-03                                                                                                                                                                                                                                                                                                                                             |
| **TITLE**                                | Source fail-closed correction and proof                                                                                                                                                                                                                                                                                                           |
| **PURPOSE**                              | `source.read` is the exclusive authority for Source content supplied to Phase 7 AI. Correct existing Source API debt **only as required** to make this guarantee true. Not permission expansion.                                                                                                                                                  |
| **EXISTING AUTHORITY REUSED**            | `source.read` / `source.write`; nav already independent; `qep.scm.read` for SCM **metadata** only                                                                                                                                                                                                                                                 |
| **NEW/EXTENDED DOMAIN REQUIRED**         | Phase 7 composer and any Source HTTP used by AI require `source.read` **without** `qep.scm.read` OR. Fix `requireSourceRead` (and repo-scope unrestricted `qep.*` if it would still leak file content to AI) as needed. Fail closed on files, tree, diff, search, cache, index, caller-supplied Source, derived extracts, F7/SCM impact-as-Source |
| **API/READ MODEL IMPACT**                | Source file/tree/diff/search must not be reachable for AI context without `source.read`. SCM change list remains `qep.scm.read` for metadata                                                                                                                                                                                                      |
| **UI SCREEN(S)**                         | All — **Source Access: Not Authorised** when `source.read` is absent; never hidden                                                                                                                                                                                                                                                                |
| **AUTHZ/ISOLATION REQUIREMENTS**         | `source.write`, SSH, Terminal remain off. Application association still does not grant `source.read`                                                                                                                                                                                                                                              |
| **MIGRATION/COMPATIBILITY REQUIREMENTS** | Tightening Source HTTP to `source.read` for file content is in-scope if required. Do not grant Source to new roles                                                                                                                                                                                                                                |
| **EVIDENCE REQUIRED FOR PASS**           | Session with `qep.scm.read` and without `source.read`: Source APIs used by AI return 403; composer omits Source; no file/diff/search in prompt. Session with `source.read`: authorised read context only. Playwright + API proof. No Source write                                                                                                 |

---

## P7-04 — Permission-safe context composer + Evidence policy

| Field                                    | Content                                                                                                                                                                                                                                                               |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                                   | P7-04                                                                                                                                                                                                                                                                 |
| **TITLE**                                | Permission-safe AI context composer                                                                                                                                                                                                                                   |
| **PURPOSE**                              | Assemble authorised context **before** model invocation. Live QEP reads, not search/knowledge-index/embeddings as SoR.                                                                                                                                                |
| **EXISTING AUTHORITY REUSED**            | Existing GET/list APIs for Application, Environment, Requirements, Stories, AC, specifications/test cases, suites, plans, executions, evidence metadata, defects, exploratory, experience, risks, gates, readiness, certification **read**, trace links, SCM metadata |
| **NEW/EXTENDED DOMAIN REQUIRED**         | Server composer: user, tenant, Application, optional Environment, effective permissions, selected records, related trace, optional Source iff P7-03. Do not trust client-posted bodies as authorised context                                                          |
| **API/READ MODEL IMPACT**                | Context snapshot API for Screens 1–4. Evidence **metadata/references by default**. Bounded body extracts only when the explicit operation requires them, user can `evidence.read`, type is permitted, extract is bounded. No secrets/credentials/raw dumps            |
| **UI SCREEN(S)**                         | 1 snapshot; 2/4 consume the same composer                                                                                                                                                                                                                             |
| **AUTHZ/ISOLATION REQUIREMENTS**         | Filter each record by that domain’s read key. P7-01 + P7-03                                                                                                                                                                                                           |
| **MIGRATION/COMPATIBILITY REQUIREMENTS** | Quality Assist `context` string is not the composer                                                                                                                                                                                                                   |
| **EVIDENCE REQUIRED FOR PASS**           | Unreadable Requirement/AC/Spec omitted. Without `source.read`, Source omitted. Default Evidence path contains ids/types/relations/timestamps, not bodies. Explicit extract path is bounded and authorised. Search index not used as SoR                               |

---

## P7-05 — Model invocation

| Field                                    | Content                                                                                                                                                                                                       |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                                   | P7-05                                                                                                                                                                                                         |
| **TITLE**                                | Model invocation                                                                                                                                                                                              |
| **PURPOSE**                              | Thin reuse of the existing OpenAI structured JSON call. Honest failure. No APE-AI prerequisite.                                                                                                               |
| **EXISTING AUTHORITY REUSED**            | Quality Assist `chat/completions` + `response_format: json_object`, `APZHUB_QEP_AI_ASSIST`, `OPENAI_API_KEY` / `.secrets/openai`, secret redaction                                                            |
| **NEW/EXTENDED DOMAIN REQUIRED**         | Shared invocation behind the composer. Timeout/unavailable/empty/invalid JSON → fail closed to the user. **Do not** fall back to rule-based text that is then stored as a typed Test Case/Story/Risk proposal |
| **API/READ MODEL IMPACT**                | Feature-flag disabled state remains honest. No streaming, failover, token billing, or tenant provider config in this inventory                                                                                |
| **UI SCREEN(S)**                         | 1 Ask AI; 2 Generate/Analyse; 4 interpretation                                                                                                                                                                |
| **AUTHZ/ISOLATION REQUIREMENTS**         | P7-01/P7-04 context only. Logs must not persist prompts as a SoR or dump Source/Evidence bodies                                                                                                               |
| **MIGRATION/COMPATIBILITY REQUIREMENTS** | Do not add a second OpenAI client. Do not wire QI placeholder vendors                                                                                                                                         |
| **EVIDENCE REQUIRED FOR PASS**           | Flag/secret missing → disabled, no proposal created. Provider error → unavailable, no structured proposal minted from rules. JSON object parsed then schema-validated (P7-09)                                 |

---

## P7-06 — Typed Proposal + provenance + stale protection

| Field                                    | Content                                                                                                                                                                                                                                                                                                                                       |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                                   | P7-06                                                                                                                                                                                                                                                                                                                                         |
| **TITLE**                                | Typed Proposal aggregate                                                                                                                                                                                                                                                                                                                      |
| **PURPOSE**                              | One durable Application-scoped proposal. Send to Review is the durability boundary.                                                                                                                                                                                                                                                           |
| **EXISTING AUTHORITY REUSED**            | Origin fields `ai_accepted` / `ai_suggestion`; destination `updatedAt` / `contentVersionId` / specification history as fingerprint **inputs**                                                                                                                                                                                                 |
| **NEW/EXTENDED DOMAIN REQUIRED**         | Single type-discriminated aggregate: tenant, Application, optional Environment, type, targets, structured content, context refs, `sourceAuthorised`, model/provider, times, original payload, human-modified payload, review status/reviewer/decision, fingerprints, resulting record id. **Not** per-type tables. **Not** assist/MCP ledgers |
| **API/READ MODEL IMPACT**                | Create from Screen 2 Send to Review; list pending for Screen 3; get for compare; update for Modify; no destination write here                                                                                                                                                                                                                 |
| **UI SCREEN(S)**                         | 2, 3                                                                                                                                                                                                                                                                                                                                          |
| **AUTHZ/ISOLATION REQUIREMENTS**         | P7-01. Discarded Screen 2 drafts need not persist. Regenerate = new proposal                                                                                                                                                                                                                                                                  |
| **MIGRATION/COMPATIBILITY REQUIREMENTS** | Do not import Quality Assist suggestions or MCP payloads as proposals                                                                                                                                                                                                                                                                         |
| **EVIDENCE REQUIRED FOR PASS**           | One store for Story and Risk proposals (discriminator, not two tables). Original retained after Modify. Fingerprint mismatch or deleted target → Accept refused (P7-07). `sourceAuthorised` false when generated without `source.read`                                                                                                        |

---

## P7-07 — Type-specific Accept

| Field                                    | Content                                                                                                                                                                                                                                                     |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                                   | P7-07                                                                                                                                                                                                                                                       |
| **TITLE**                                | Type-specific Accept into existing SoRs                                                                                                                                                                                                                     |
| **PURPOSE**                              | Human Accept orchestrates **existing** domain writes. Generate ≠ Accept ≠ Write. Reuse F7’s write-path pattern, not F7’s ephemeral recompute or `acceptAll`.                                                                                                |
| **EXISTING AUTHORITY REUSED**            | `createStory` / `createCriterion` (`ai_accepted` + `acceptedBy`); `specifications.create`; suite/plan/exploratory/experience writes; `createTraceLink` (`ai_suggestion` provisional); `assurance.createRisk`; defect create; destination validation         |
| **NEW/EXTENDED DOMAIN REQUIRED**         | Per-type Accept adapters. No generic accept service. Risk = “Create Risk from Proposal” with the human as actor. Defect = existing Defect create with the human as actor. Gate evaluate / Certification decide / GO family / exception = **no Accept path** |
| **API/READ MODEL IMPACT**                | Accept sets resulting record id; Reject records decision only. Server re-runs destination AuthZ + validation + stale check                                                                                                                                  |
| **UI SCREEN(S)**                         | 3                                                                                                                                                                                                                                                           |
| **AUTHZ/ISOLATION REQUIREMENTS**         | P7-02. Generator may Accept iff destination write is currently held                                                                                                                                                                                         |
| **MIGRATION/COMPATIBILITY REQUIREMENTS** | F7 SCM design-proposal/accept is superseded as product UX (P7-14); do not add bulk accept                                                                                                                                                                   |
| **EVIDENCE REQUIRED FOR PASS**           | Test Case Accept creates a specification via existing service. Invalid payload fails domain validation. Gate/Certification proposal cannot Accept into those SoRs. Risk Accept calls `createRisk` as the human. Permission revoked → 403. Stale AC → refuse |

---

## P7-08 — Deterministic quality analysis

| Field                                    | Content                                                                                                                                                                                                                                            |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                                   | P7-08                                                                                                                                                                                                                                              |
| **TITLE**                                | Deterministic quality analysis                                                                                                                                                                                                                     |
| **PURPOSE**                              | Screen 4 (and Companion suggestions) factual gaps come from QEP data. The LLM must not rediscover SQL facts.                                                                                                                                       |
| **EXISTING AUTHORITY REUSED**            | Definition coverage (`verificationCount === 0` → gap to `test_specification`); enterprise uncovered; trace `mandatory_for_coverage`; executions/results; evidence relationships; defects; `listRisks`; gate evaluations; Current Readiness Posture |
| **NEW/EXTENDED DOMAIN REQUIRED**         | Application-scoped read model composing those facts (AC without verification, never executed, failed execution without evidence, missing traces, open risks, failed gates). EXTEND queries where joins are missing. No Finding SoR                 |
| **API/READ MODEL IMPACT**                | Deterministic analysis API consumed by Screens 1 and 4 **before** any LLM                                                                                                                                                                          |
| **UI SCREEN(S)**                         | 1 suggestions; 4 primary                                                                                                                                                                                                                           |
| **AUTHZ/ISOLATION REQUIREMENTS**         | Same domain read keys as the underlying objects. P7-01                                                                                                                                                                                             |
| **MIGRATION/COMPATIBILITY REQUIREMENTS** | Do not use QI scores. Do not use Platform Search as the gap engine                                                                                                                                                                                 |
| **EVIDENCE REQUIRED FOR PASS**           | Known fixture: N ACs with no verification reported as N without calling a model. Failed Blocking Gate count matches Phase 6 evaluations. Numbers match live SoRs, not sample 27/312 from the visual                                                |

---

## P7-09 — AI generate / analyse

| Field                                    | Content                                                                                                                                                                                 |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                                   | P7-09                                                                                                                                                                                   |
| **TITLE**                                | AI generate / analyse (untrusted structured output)                                                                                                                                     |
| **PURPOSE**                              | LLM produces interpretation or typed proposal JSON. Validate before review. Never authoritative.                                                                                        |
| **EXISTING AUTHORITY REUSED**            | P7-04 composer, P7-05 invocation, destination create contracts as JSON schemas                                                                                                          |
| **NEW/EXTENDED DOMAIN REQUIRED**         | Generate modes for allowed proposal types (lock matrix). Analyse modes that attach to deterministic facts (P7-08) as commentary/candidates only. Schema validation before P7-06 persist |
| **API/READ MODEL IMPACT**                | Generate/Analyse APIs. Ask AI (Screen 1) ephemeral — no conversation SoR                                                                                                                |
| **UI SCREEN(S)**                         | 1 Ask AI; 2 Generate \| Analyse; 4 interpretation / candidates                                                                                                                          |
| **AUTHZ/ISOLATION REQUIREMENTS**         | P7-02 operate; context already filtered                                                                                                                                                 |
| **MIGRATION/COMPATIBILITY REQUIREMENTS** | Do not reuse Quality Assist four-mode text suggestions as typed proposals                                                                                                               |
| **EVIDENCE REQUIRED FOR PASS**           | Invalid JSON never becomes a Review item. Analyse does not write Risks/Gates/Certification. Semantic “possible link” remains a proposal until P7-07                                     |

---

## P7-10 — Screen 1 — AI Quality Companion

| Field                                    | Content                                                                                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                                   | P7-10                                                                                                                                             |
| **TITLE**                                | Screen 1 — AI Quality Companion                                                                                                                   |
| **PURPOSE**                              | Phase 7 entry matching locked visual. Context snapshot is the primary behaviour.                                                                  |
| **EXISTING AUTHORITY REUSED**            | P7-04 snapshot, P7-08 suggestions, Phase 6 Current Readiness Posture, Design System                                                               |
| **NEW/EXTENDED DOMAIN REQUIRED**         | Presentation. Ask AI ephemeral/session. Recent activity derived from P7-06/P7-15. Sample counts in the visual are **not** seed                    |
| **API/READ MODEL IMPACT**                | Companion composition over P7-04/P7-08                                                                                                            |
| **UI SCREEN(S)**                         | 1 — desktop + mobile. Light/dark identical geometry. Source Access visible                                                                        |
| **AUTHZ/ISOLATION REQUIREMENTS**         | `qep.ai_workspace.read`. Application required                                                                                                     |
| **MIGRATION/COMPATIBILITY REQUIREMENTS** | Replaces AI Workspace as the customer entry (P7-14). Quick actions open 2–4, not silent writes                                                    |
| **EVIDENCE REQUIRED FOR PASS**           | Playwright vs visual intent. Without `source.read`, snapshot shows Not Authorised. Ask AI does not persist a chat SoR. Posture is not an AI score |

---

## P7-11 — Screen 2 — Generate & Analyse

| Field                                    | Content                                                                                                                            |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                                   | P7-11                                                                                                                              |
| **TITLE**                                | Screen 2 — Generate & Analyse                                                                                                      |
| **PURPOSE**                              | Deliberate workbench. Results are proposals. Send to Review only.                                                                  |
| **EXISTING AUTHORITY REUSED**            | P7-05, P7-06, P7-09, Design System                                                                                                 |
| **NEW/EXTENDED DOMAIN REQUIRED**         | Presentation. Modes Generate \| Analyse. No Save / Create Test Case / Create Risk                                                  |
| **API/READ MODEL IMPACT**                | Send to Review persists P7-06. Discard drops ephemeral draft                                                                       |
| **UI SCREEN(S)**                         | 2 — desktop + mobile. Light/dark identical geometry                                                                                |
| **AUTHZ/ISOLATION REQUIREMENTS**         | `qep.ai_workspace.operate`. Application required. Source badge from P7-03                                                          |
| **MIGRATION/COMPATIBILITY REQUIREMENTS** | Not the Review Queue                                                                                                               |
| **EVIDENCE REQUIRED FOR PASS**           | Playwright. Cannot create a Test Case or Risk from this screen. Send to Review appears on Screen 3. Provider unavailable is honest |

---

## P7-12 — Screen 3 — AI Review Queue

| Field                                    | Content                                                                                                                                                                                            |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                                   | P7-12                                                                                                                                                                                              |
| **TITLE**                                | Screen 3 — AI Review Queue                                                                                                                                                                         |
| **PURPOSE**                              | Controlled review. Accept is not universal.                                                                                                                                                        |
| **EXISTING AUTHORITY REUSED**            | P7-06, P7-07, Design System                                                                                                                                                                        |
| **NEW/EXTENDED DOMAIN REQUIRED**         | Presentation: pending list, comparison, provenance (model, time, Application, Source Access, context refs), Accept / Modify / Reject. Type-specific Accept labels (e.g. Create Risk from Proposal) |
| **API/READ MODEL IMPACT**                | P7-06/P7-07 only                                                                                                                                                                                   |
| **UI SCREEN(S)**                         | 3 — desktop + mobile. Light/dark identical geometry                                                                                                                                                |
| **AUTHZ/ISOLATION REQUIREMENTS**         | Destination write required to Accept. No bulk Apply Everything                                                                                                                                     |
| **MIGRATION/COMPATIBILITY REQUIREMENTS** | Not MCP DX proposal UI                                                                                                                                                                             |
| **EVIDENCE REQUIRED FOR PASS**           | Playwright. Gate/Certification items cannot Accept into those SoRs. Modify retains original. Provenance shows Source Access. Stale Accept blocked in UI + API                                      |

---

## P7-13 — Screen 4 — AI Quality Analysis / Traceability

| Field                                    | Content                                                                                                              |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **ID**                                   | P7-13                                                                                                                |
| **TITLE**                                | Screen 4 — AI Quality Analysis / Traceability                                                                        |
| **PURPOSE**                              | Intelligence surface over the quality chain. Findings advisory.                                                      |
| **EXISTING AUTHORITY REUSED**            | P7-08 deterministic chain, P7-09 interpretation, traceability reads, Phase 6 posture/gates/risks (read)              |
| **NEW/EXTENDED DOMAIN REQUIRED**         | Presentation. No Finding SoR. Draft Risk / Generate Tests / Propose Link → Screens 2–3                               |
| **API/READ MODEL IMPACT**                | Compose P7-08 + optional P7-09. No quality score field                                                               |
| **UI SCREEN(S)**                         | 4 — desktop + mobile. Light/dark identical geometry                                                                  |
| **AUTHZ/ISOLATION REQUIREMENTS**         | Domain reads + `qep.ai_workspace.read`. Application required                                                         |
| **MIGRATION/COMPATIBILITY REQUIREMENTS** | QI recommendation UI is not this screen (P7-14)                                                                      |
| **EVIDENCE REQUIRED FOR PASS**           | Playwright. Gap counts match P7-08 with model disabled. No AI score. Actions do not write Risks/Traces/Certification |

---

## P7-14 — Legacy AI absorb / supersede

| Field                                    | Content                                                                                                                                                                                                         |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                                   | P7-14                                                                                                                                                                                                           |
| **TITLE**                                | Absorb / supersede competing APZQEP AI experiences                                                                                                                                                              |
| **PURPOSE**                              | Phase 7 is the authoritative APZQEP AI product. Reuse primitives; hide or retire overlapping UX. Do not delete implementation blindly.                                                                          |
| **EXISTING AUTHORITY REUSED**            | OpenAI JSON helper, secret loader, F7 write-path pattern, never-certify guards, `qep.ai_workspace.*`                                                                                                            |
| **NEW/EXTENDED DOMAIN REQUIRED**         | Nav/IA: AI Workspace, Quality Assist customer UI, MCP DX, and F7 design-proposal Accept are not competing destinations once Screens 1–3 ship. Internal helpers may remain                                       |
| **API/READ MODEL IMPACT**                | Customer routes point at Phase 7 screens. MCP product IA stays deferred (no new MCP work). F7 `acceptAll` not exposed                                                                                           |
| **UI SCREEN(S)**                         | Shell / QEP sidebar                                                                                                                                                                                             |
| **AUTHZ/ISOLATION REQUIREMENTS**         | Unchanged keys                                                                                                                                                                                                  |
| **MIGRATION/COMPATIBILITY REQUIREMENTS** | Do not migrate assist/MCP ledgers. Do not remove never-certify guards                                                                                                                                           |
| **EVIDENCE REQUIRED FOR PASS**           | Entitled user reaches Companion, not a second AI Workspace as the product AI home. MCP DX not presented as Phase 7. F7 Accept is not a parallel Test Case create UX. QI scores still not shown as quality score |

---

## P7-15 — Audit

| Field                                    | Content                                                                                                                                                                                                                                      |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                                   | P7-15                                                                                                                                                                                                                                        |
| **TITLE**                                | AI event audit                                                                                                                                                                                                                               |
| **PURPOSE**                              | Reuse platform audit + destination-domain audit. No AI audit store.                                                                                                                                                                          |
| **EXISTING AUTHORITY REUSED**            | `@apzhub/platform-audit`; definition/spec/risk/evidence domain audit; `ai_accepted` / `ai_suggestion` on resulting records                                                                                                                   |
| **NEW/EXTENDED DOMAIN REQUIRED**         | Events: proposal generated, modified, accepted, rejected, authoritative write performed, model invoked, permission/context boundary (including Source denied). Correlation ids. No Source bodies / Evidence dumps / secrets / raw prompt SoR |
| **API/READ MODEL IMPACT**                | Readable under existing audit permissions                                                                                                                                                                                                    |
| **UI SCREEN(S)**                         | 3 provenance; admin audit if already present                                                                                                                                                                                                 |
| **AUTHZ/ISOLATION REQUIREMENTS**         | Tenant-scoped                                                                                                                                                                                                                                |
| **MIGRATION/COMPATIBILITY REQUIREMENTS** | Do not use capped `qep-audit-store` file ledger as product SoR                                                                                                                                                                               |
| **EVIDENCE REQUIRED FOR PASS**           | Accept of a Test Case produces proposal-accepted + destination create audit. Source-denied invocation records boundary without file content. Prompt bodies not stored as authoritative audit payload                                         |

---

## P7-16 — Presentation + focused certification

| Field                                    | Content                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                                   | P7-16                                                                                                                                                                                                                                                                                                                                                                                                      |
| **TITLE**                                | Light/dark, mobile, end-to-end certification                                                                                                                                                                                                                                                                                                                                                               |
| **PURPOSE**                              | Same domain, same APIs, responsive composition. Prove the locked flow.                                                                                                                                                                                                                                                                                                                                     |
| **EXISTING AUTHORITY REUSED**            | APZQEP Design System, Phase 6 Playwright harness patterns                                                                                                                                                                                                                                                                                                                                                  |
| **NEW/EXTENDED DOMAIN REQUIRED**         | None                                                                                                                                                                                                                                                                                                                                                                                                       |
| **API/READ MODEL IMPACT**                | None beyond P7-01–P7-15                                                                                                                                                                                                                                                                                                                                                                                    |
| **UI SCREEN(S)**                         | All four — desktop light/dark identical geometry; mobile light/dark identical geometry                                                                                                                                                                                                                                                                                                                     |
| **AUTHZ/ISOLATION REQUIREMENTS**         | Covered by P7-01–P7-03                                                                                                                                                                                                                                                                                                                                                                                     |
| **MIGRATION/COMPATIBILITY REQUIREMENTS** | Focused tests only; no repository-wide typecheck remediation                                                                                                                                                                                                                                                                                                                                               |
| **EVIDENCE REQUIRED FOR PASS**           | Finite Playwright + API tests proving: isolation; Source fail-closed; context permission filter; Evidence metadata default; honest model failure; typed proposal; stale refuse; destination AuthZ on Accept; deterministic gaps without LLM; no AI score; no Gate/Certification Accept; no Source write. Screenshots Screens 1–4 desktop+mobile light (and dark where existing evidence practice requires) |

---

## Explicitly out of inventory

- Reopening locked visuals, reconciliation, Owner decisions, Source semantics, proposal-vs-SoR semantics, Evidence policy, or generator/reviewer policy
- APE-AI / APE-RAG / model gateway product
- RAG, embeddings, vector store, semantic Meilisearch
- MCP servers, MCP DX as Phase 7 product IA, MCP SoR
- AI conversation / chat SoR
- Finding SoR; Quality Issue list/get SoR invented only for Screen 4
- AI quality score / AI readiness score / QI scores as product score
- Per-type proposal tables
- Quality Assist / MCP file ledgers as Phase 7 persistence
- Bulk accept / F7 `acceptAll`
- Silent rule-based structured proposals
- AI Gate evaluation, AI Certification, GO family, Certification Exception
- AI Risk insert or AI Defect insert (proposal + human destination write only)
- Fabricated Evidence; automatic Evidence body dumps
- Source write, SSH, Terminal
- Broadening `source.read` / `source.write`
- Tenant-level provider catalogue, usage metering, streaming, provider failover
- Platform Search / Knowledge Index as AI context SoR
- Nine-role catalogue
- Repository-wide typecheck debt
- Phase 8

---

## Authorisation gate

```text
PHASE 7 DOMAIN LOCK:
CLOSED

PHASE 7 IMPLEMENTATION INVENTORY:
APPROVED / LOCKED · P7-01 → P7-16 CLOSED

PHASE 7 IMPLEMENTATION:
CLOSED · ACCEPTED

PHASE 8:
NOT REQUIRED · NOT STARTED
```

Inventory is frozen. Implementation is **CLOSED · ACCEPTED**. The redesign programme is **COMPLETE**. Do not expand the inventory. Do not start Phase 8.
