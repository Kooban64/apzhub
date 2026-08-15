# SPR-APZQEP-220 — Phase 2 product completion

> **Status:** **AUTHORISED · IN PROGRESS** — 2026-08-15  
> **Parent:** [SPR-FULL-001](./SPR-FULL-001-full-product-bar-option-3.md) Track A1  
> **Authority:** [OWNER-FULL-PRODUCT-BAR-OPTION-3](../decisions/OWNER-FULL-PRODUCT-BAR-OPTION-3.md)  
> **Depends on:** SPR-APZQEP-210 **COMPLETE**; Caps A–F **CLOSED**  
> **Does not:** Cap reopen · Phase 3 continuous cert · AI Workspace ON (→ 230) · Faraday/Greenbone in QEP

## Outcome

APZQEP Phase 2 capabilities from [PRODUCT-CAPABILITIES](../products/apzqep/product-definition/PRODUCT-CAPABILITIES.md) are **operational**, not MVP stubs: Quality Intelligence, Knowledge, Automation/Risk/Integration **depth**.

## Ships

| ID    | Ship                     | Approach                                                                               |
| ----- | ------------------------ | -------------------------------------------------------------------------------------- |
| 220-A | Quality Intelligence     | Entitled QI surfaces: trends, explainable signals, drift — human decision support only |
| 220-B | Knowledge (M16)          | Full knowledge base for QE reuse (articles, search, link from workflows)               |
| 220-C | Automation depth         | Richer ingest/mapping/governance beyond GitHub foundation; QEP still not the runner    |
| 220-D | Risk + Integration depth | Close Phase 2 gaps on risk workflows and Integration Centre operator depth             |
| 220-E | Honesty + gates          | Catalogue/status docs; tests; no Cap kernel changes                                    |

## Acceptance

1. M14 QI usable under entitlement without claiming auto-certify.
2. M16 Knowledge usable for primary QE personas (not empty Phase 2 placeholder).
3. Automation Management supports multi-provider ingest governance depth beyond SPR-202 foundation.
4. Risk and Integration Centre no longer “foundation-only” for Phase 2 checklist items.
5. Caps A–F untouched; AI Workspace remains OFF until SPR-230.

## Delivery record

- **220-B Knowledge (M16):** module `active`; catalogue enabled; permissions `qep.knowledge.read` / `qep.knowledge.operate`; JSON ledger `qep-knowledge/articles.json`; API `GET|POST /api/v1/qep/knowledge`; Learning workspace UI with draft/publish + link to Verification Design.
- **220-D Risk (light):** optional `owner` / `evidenceRef` on create; `accept` status action + Accept UI control (Integration Centre depth deferred).
