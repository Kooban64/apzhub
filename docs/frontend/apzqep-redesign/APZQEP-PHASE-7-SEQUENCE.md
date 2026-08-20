# APZQEP Phase 7 — visual sequence

**Status:** Screens 1–4 **LOCKED**. Implementation **CLOSED · ACCEPTED** — [acceptance](./APZQEP-PHASE-7-ACCEPTANCE.md).  
**Date:** 2026-08-20  
**Phase 6:** CLOSED · ACCEPTED — [APZQEP-PHASE-6-ACCEPTANCE.md](./APZQEP-PHASE-6-ACCEPTANCE.md)  
**Typecheck debt:** [APZQEP-REPOSITORY-TYPECHECK-DEBT.md](./APZQEP-REPOSITORY-TYPECHECK-DEBT.md) — **not Phase 7 scope**

Phase 7 is **APZQEP AI Quality Companion**.

AI operates only as:

```text
Context → Proposal → Human Review → Accept / Modify / Reject
      → Existing authoritative APZQEP record
```

Never:

```text
AI → silent production truth
```

Do **not** invent a parallel AI domain. Domain lock is **CLOSED**. Inventory is **APPROVED**. Implementation follows P7-01 → P7-16 only.

```text
SCREEN 1 — AI Quality Companion                  LOCKED
SCREEN 2 — Generate & Analyse                    LOCKED
SCREEN 3 — AI Review Queue                       LOCKED
SCREEN 4 — AI Quality Analysis / Traceability    LOCKED

PHASE 7 VISUAL DESIGN                            COMPLETE
DOMAIN RECONCILIATION                            ACCEPTED
DOMAIN LOCK                                      ACCEPTED / CLOSED
IMPLEMENTATION INVENTORY                         APPROVED / LOCKED
PHASE 7 IMPLEMENTATION                           CLOSED · ACCEPTED
PHASE 8                                          NOT REQUIRED · NOT STARTED
APZQEP REDESIGN PROGRAMME                        COMPLETE
```

## Method (frozen)

```text
Visual 1 → Visual 2 → Visual 3 → Visual 4
→ domain reconciliation
→ finite inventory
→ implementation
```

## Screens

| Screen                               | Status                                                                                                                                                             | Intent                                                                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| 1 AI Quality Companion               | **LOCKED** — [lock](./APZQEP-PHASE-7-SCREEN-1-AI-QUALITY-COMPANION.md) · [visual](./visuals/phase-7/01-ai-quality-companion-authority.png)                         | Entry point, visible context, suggestions, Ask AI, quick actions.                                                          |
| 2 Generate & Analyse                 | **LOCKED** — [lock](./APZQEP-PHASE-7-SCREEN-2-GENERATE-AND-ANALYSE.md) · [visual](./visuals/phase-7/02-generate-and-analyse-authority.png)                         | Deliberate workbench. Generate and Analyse are two modes of one workspace. Results are **proposals**. Send to Review only. |
| 3 AI Review Queue                    | **LOCKED** — [lock](./APZQEP-PHASE-7-SCREEN-3-AI-REVIEW-QUEUE.md) · [visual](./visuals/phase-7/03-ai-review-queue-authority.png)                                   | Controlled review workspace. Accept is not universal. Gates / Certification stay human-only.                               |
| 4 AI Quality Analysis / Traceability | **LOCKED** — [lock](./APZQEP-PHASE-7-SCREEN-4-AI-QUALITY-ANALYSIS-TRACEABILITY.md) · [visual](./visuals/phase-7/04-ai-quality-analysis-traceability-authority.png) | Intelligence surface over the quality chain. Findings are advisory. No AI score.                                           |

## Architectural freeze (before anything else)

**AI assists. Humans decide.** Proposal ≠ production record.

**AI access must not broaden Source permissions.** Screen 1 Context Snapshot makes this visible (`Source Access — Not Authorised` when `source.read` is absent).

```text
User has:
qep.* access
but no source.read

AI may analyse:
Requirements
Stories
ACs
Tests
Executions
Evidence the user may access

AI may NOT quietly read:
repository files
commits
source code
SCM context
embeddings previously produced from unauthorised Source
```

If the user also has `source.read`, authorised Source may become AI context. `source.write` remains independently controlled. SSH and Terminal are not authorised.

Likewise:

- AI may propose a Defect → human creates it.
- AI may propose a Quality Risk → human creates it.
- AI may explain a failed Gate → it cannot override it.
- AI may summarise readiness → it cannot certify.
- AI has **no** authority to record GO / CONDITIONAL_GO / NO_GO / DEFER.

Current Readiness Posture on Screen 1 reuses Phase 6. It is not an AI score.

## Explicitly out of this sequence (until authorised)

- Implementation
- Inventing Screens 2–4
- AI schemas, proposal/conversation/audit stores, agents, vector stores, embeddings, RAG, model gateway, MCP as product IA
- Parallel AI domain / AI System of Record
- Silent production writes; automatic Defects / Risks / Gate evaluations / Certification
- Broadening `source.read` / `source.write` through AI
- SSH, Terminal
- Repository-wide typecheck remediation
- Reopening Phases 1–6
- Phase 8

## Next Owner action

Review [APZQEP-PHASE-7-IMPLEMENTATION-INVENTORY.md](./APZQEP-PHASE-7-IMPLEMENTATION-INVENTORY.md). Do not implement until that list is authorised. Do not expand it during coding.
