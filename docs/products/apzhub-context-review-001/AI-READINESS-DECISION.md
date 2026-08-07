# AI Readiness Decision — APZHUB-CONTEXT-REVIEW-001

| Field         | Value                                                       |
| ------------- | ----------------------------------------------------------- |
| Programme     | APZHUB-CONTEXT-REVIEW-001                                   |
| Decision date | 2026-08-06                                                  |
| Decision      | **MORE CONTEXT MATURITY REQUIRED**                          |
| Board status  | **ACCEPTED** — [BOARD-ACCEPTANCE.md](./BOARD-ACCEPTANCE.md) |

## Recommendation

**MORE CONTEXT MATURITY REQUIRED** — **ACCEPTED**

Do **not** authorise APZHUB-AI-001 (or any AI/RAG/copilot programme) until Context operational learning produces measurable answers to the Product Board questions.  
Do **not** open CONTEXT-003 or another capability programme for momentum. Operate in **Operational Validation**.

## Supporting evidence

1. **Zero Product Learning events** in `platform_product_learning_event` at review time.
2. **Zero Operational Friction Register rows** related (or unrelated) to Context.
3. **No completed observation logs, interviews, or answered CONTEXT-001 pilot questions.**
4. CONTEXT-002 completion itself required _“evaluation of Context operational learning before any AI capability is authorised.”_ That evaluation cannot yet be completed with data.
5. Technology readiness (including any existing OpenAI integration in the monorepo) is **explicitly excluded** as a substitute for product readiness.

## What “more maturity” means (observation, not new AI)

Minimum evidence bar before revisiting AI readiness:

| Gate                | Evidence required                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------------- |
| Usage               | Multi-week Product Learning summary with non-zero section views across Projects, Workflow, Support, Knowledge |
| Value               | Helpful ratio + qualitative comments or interviews identifying most valuable sections                         |
| Switching / leaving | Friction or interview evidence on reduced switching **or** remaining external lookups                         |
| Trust               | Users can state Context is reliable enough to act on without second-guessing SoR ownership                    |
| Providers           | Document which slices are routinely empty/unavailable and whether that blocks work                            |

Only after those gates should the Board consider **READY FOR AI FOUNDATION** and design a **focused** APZHUB-AI-001 that consumes composed Context — never AI everywhere.

## What this decision is not

- Not a finding that Context failed
- Not authorisation to rebuild Context architecture
- Not a pause on Wave A/B delivered capabilities
- Not authorisation for AI “because the integration exists”
