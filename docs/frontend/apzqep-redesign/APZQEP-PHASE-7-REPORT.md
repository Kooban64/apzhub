# APZQEP Phase 7 — implementation report

**Status:** COMPLETE — CLOSED · ACCEPTED  
**Date:** 2026-08-20  
**Acceptance:** [APZQEP-PHASE-7-ACCEPTANCE.md](./APZQEP-PHASE-7-ACCEPTANCE.md)  
**Inventory:** [APZQEP-PHASE-7-IMPLEMENTATION-INVENTORY.md](./APZQEP-PHASE-7-IMPLEMENTATION-INVENTORY.md) — APPROVED / LOCKED  
**Authority:** [APZQEP-PHASE-7-IMPLEMENTATION-AUTHORITY.md](./APZQEP-PHASE-7-IMPLEMENTATION-AUTHORITY.md)  
**Evidence:** [evidence/phase-7/](./evidence/phase-7/)  
**Phase 8:** NOT STARTED — see [APZQEP-PROGRAMME-CHECKPOINT.md](./APZQEP-PROGRAMME-CHECKPOINT.md)

Phase 7 is the authoritative APZQEP AI experience. Security and domain machinery (P7-01–P7-09) were implemented before Screens 1–4 were made operational.

```text
Authorised QEP Facts
  → Permission-Safe AI Context
  → AI Generate / Analyse
  → Typed Proposal
  → Human Review
  → Destination AuthZ Re-evaluation
  → Existing APZQEP Authoritative SoR
```

---

## Inventory status

| ID    | Title                                          | Status                                                            |
| ----- | ---------------------------------------------- | ----------------------------------------------------------------- |
| P7-01 | Tenant + Application isolation                 | **PASS**                                                          |
| P7-02 | AuthZ family                                   | **PASS**                                                          |
| P7-03 | Source fail-closed                             | **PASS**                                                          |
| P7-04 | Context composer + Evidence policy             | **PASS** (metadata default; bounded body extract not implemented) |
| P7-05 | Model invocation                               | **PASS**                                                          |
| P7-06 | Typed Proposal + provenance + stale protection | **PASS**                                                          |
| P7-07 | Type-specific Accept                           | **PASS**                                                          |
| P7-08 | Deterministic quality analysis                 | **PASS**                                                          |
| P7-09 | AI generate / analyse                          | **PASS**                                                          |
| P7-10 | Screen 1 — AI Quality Companion                | **PASS**                                                          |
| P7-11 | Screen 2 — Generate & Analyse                  | **PASS**                                                          |
| P7-12 | Screen 3 — AI Review Queue                     | **PASS**                                                          |
| P7-13 | Screen 4 — AI Quality Analysis / Traceability  | **PASS**                                                          |
| P7-14 | Legacy AI absorb / supersede                   | **PASS**                                                          |
| P7-15 | Audit                                          | **PASS**                                                          |
| P7-16 | Light / dark / mobile + certification          | **PASS**                                                          |

---

## What was delivered

- Package `@apzhub/qep-ai`: one Proposal aggregate, isolation, Source policy, destination AuthZ, stale fingerprints, deterministic gap composition.
- PostgreSQL `qep_ai_proposal` + tenant RLS (`0161`, `0162`).
- Source file/tree/diff/search APIs require **exclusive** `source.read`. `qep.scm.read` and `qep.*` do **not** substitute.
- Server-composed context. Client context is never authoritative. Model payload is redacted; Source cannot be attached unless `source.read` is granted.
- OpenAI `chat/completions` + `json_object` reused. Unavailable model fails honestly (503). No silent rule-minted structured proposals. Quality Assist live LLM is superseded and never sends caller-supplied context to a model.
- Type-specific Accept into existing Test Case / Suite / Plan / Story / AC / Exploratory writes. Risk, Defect, Gate evaluation, and Certification have **no** AI Accept write path.
- Screen 3 “Create Risk from Proposal” calls the existing Risk API (human workflow).
- Four routes: `/workspace/qep/ai-companion`, `/ai-generate`, `/ai-review`, `/ai-analysis`. Legacy `/ai-workspace` lands on Companion. MCP DX UX is superseded.
- Ask AI is ephemeral (no chat table). Screen 4 findings are derived from QEP facts (no Finding SoR).

### Documented visual adaptations

Live Application facts replace the sample numbers in the locked visuals (for example 14 risks / 312 executions). Geometry, regions, and Source Access visibility follow the locked authorities. `org_member` typically holds `source.read`, so Screen 1 may show Source Access **Authorised** with zero Source payload when no repository is associated.

---

## Twenty live certification proofs

| #   | Proof                                                              | Result   | Evidence                                                                                                                                                   |
| --- | ------------------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | No `source.read` → zero Source to model                            | **PASS** | Handler + domain tests; Source HTTP 403 without `source.read`                                                                                              |
| 2   | `qep.scm.read` / `qep.*` without `source.read` → still zero Source | **PASS** | `source-workspace.p7.test.ts`; AI source-probe with `qep.*`                                                                                                |
| 3   | Authorised `source.read` → Source only via composer                | **PASS** | Probe: `sourceAccess=authorised`, `sourcePresent=false` until a repository is associated ([01-source-probe.json](./evidence/phase-7/01-source-probe.json)) |
| 4   | Cross-tenant AI context                                            | **PASS** | Handler isolation test                                                                                                                                     |
| 5   | Cross-Application context                                          | **PASS** | Domain isolation test                                                                                                                                      |
| 6   | Generate structured proposal; SoR unchanged                        | **PASS** | Playwright create proposal before Accept                                                                                                                   |
| 7   | Proposal provenance retained                                       | **PASS** | [10-accept-test-case.json](./evidence/phase-7/10-accept-test-case.json)                                                                                    |
| 8   | Modify: original vs reviewed distinguishable                       | **PASS** | Same file: original title vs reviewed title                                                                                                                |
| 9   | Reject: SoR unchanged                                              | **PASS** | Playwright reject path                                                                                                                                     |
| 10  | Accept with destination permission                                 | **PASS** | Resulting `test_case` `tsp_…`                                                                                                                              |
| 11  | Accept without destination permission                              | **PASS** | Handler 403 with only `qep.ai_workspace.operate`                                                                                                           |
| 12  | Stale proposal Accept rejected                                     | **PASS** | Domain test (`ai.proposal.stale`)                                                                                                                          |
| 13  | Deterministic gap from QEP                                         | **PASS** | [13-deterministic-analysis.json](./evidence/phase-7/13-deterministic-analysis.json) `source: qep_facts`; never_executed=1 after Accept                     |
| 14  | AI interpretation consumes facts                                   | **PASS** | Screen 4 lists those gaps; generate/ask receive composer facts, not invented counts                                                                        |
| 15  | Risk: proposal/draft only                                          | **PASS** | Playwright Accept `quality_risk` refused; risk list unchanged                                                                                              |
| 16  | Gate / Certification: no AI write                                  | **PASS** | Playwright Accept 403                                                                                                                                      |
| 17  | Evidence metadata default                                          | **PASS** | Composer `evidenceMode=metadata`; bounded body extract **not implemented**                                                                                 |
| 18  | Light / dark geometry                                              | **PASS** | `01`–`04-*-light.png` / `*-dark.png`                                                                                                                       |
| 19  | Mobile                                                             | **PASS** | `01-companion-mobile.png`                                                                                                                                  |
| 20  | Screens 1–4 vs locked visuals                                      | **PASS** | Documented live-data adaptations only                                                                                                                      |

Playwright: `testing/playwright/e2e/apzqep-phase-7-ai.spec.ts` — **1 passed**.

---

## Owner return block

```text
SOURCE FAIL-CLOSED:
PASS

qep.scm.read SOURCE SUBSTITUTION:
REJECTED

TENANT ISOLATION:
PASS

APPLICATION ISOLATION:
PASS

AI PROPOSAL:
PASS

STALE PROPOSAL PROTECTION:
PASS

DESTINATION AUTHZ ON ACCEPT:
PASS

DETERMINISTIC ANALYSIS:
PASS

AI DIRECT AUTHORITATIVE WRITE:
NO

AI RISK CREATION:
NO

AI GATE EVALUATION:
NO

AI CERTIFICATION:
NO

CHAT SOR CREATED:
NO

FINDING SOR CREATED:
NO

EMBEDDINGS:
NOT CREATED

VECTOR STORE:
NOT CREATED

MCP:
NOT IMPLEMENTED

SOURCE WRITE:
NOT ENABLED

SSH:
NOT ENABLED

TERMINAL:
NOT ENABLED

SCREEN 1 VISUAL:
CONFORMS

SCREEN 2 VISUAL:
CONFORMS

SCREEN 3 VISUAL:
CONFORMS

SCREEN 4 VISUAL:
CONFORMS

LIGHT / DARK GEOMETRY:
MATCH

MOBILE:
PASS

PLAYWRIGHT:
PASS

PHASE 7 STATUS:
CLOSED · ACCEPTED

PHASE 8:
NOT REQUIRED · NOT STARTED
```

---

## Stop

Phase 7 is **CLOSED · ACCEPTED**. The redesign programme is **COMPLETE**. Owner decision: [APZQEP-PROGRAMME-CLOSURE.md](./APZQEP-PROGRAMME-CLOSURE.md).

Do not start Phase 8.
