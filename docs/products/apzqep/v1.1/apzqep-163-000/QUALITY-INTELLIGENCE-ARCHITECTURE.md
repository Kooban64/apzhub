# QUALITY-INTELLIGENCE-ARCHITECTURE — APZQEP-163-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-163-000   |
| Timestamp | 20260803T175516Z |

## Target architecture

```text
                         Quality Intelligence Platform
                         (@apzhub/platform-quality-intelligence)

                         ┌────────────────────────────┐
                         │  Quality Intelligence Engine │
                         └──────────────┬─────────────┘
                                        │
                         Intelligence Provider Contract
                                        │
          ┌─────────────┬───────────────┼───────────────┬─────────────┐
          ▼             ▼               ▼               ▼             ▼
     AI Providers  Rule Providers  Statistical   Risk Engines   Historical
     (OpenAI,      (policy/rules)  Providers     (risk/impact)  Analytics
      Claude,
      Gemini,
      Local, …)
```

## Upstream feeders (consume, do not redesign)

```text
Requirements · Traceability · Suites · Execution Plans/Sessions
Evidence · Defects · Reporting · Automation · SCM
Notifications · Operational History · Release History · Metrics
        ↓
   Signal Assembly / Context Fabric
        ↓
   Quality Intelligence Engine
        ↓
   Recommendations · Scores · Predictions · Explainability
        ↓
   Workspace · Reporting projections · Product Board artefacts
```

## Layer rules (mandatory)

1. **Engine never imports an AI SDK** — only AI providers may call vendor APIs.
2. **External APIs are provider-neutral** — no OpenAI/Claude types on product contracts.
3. **Modules call Platform Services / QI facade** — UI never routes to a vendor.
4. **Evidence / Audit / Notifications remain platform-owned** — QI publishes events; does not fork those platforms.
5. **Waves 1–2 unchanged** — QI integrates via events, refs and contracts.

## Core components (conceptual)

| Component                   | Responsibility                                     |
| --------------------------- | -------------------------------------------------- |
| Quality Intelligence Engine | Orchestrate analysis, score, recommend             |
| Provider Registry           | Register AI / rules / statistical / risk providers |
| Signal Assembler            | Build tenant-safe context from platform sources    |
| Scoring Engine              | Quality / readiness / risk scores                  |
| Recommendation Engine       | Produce governed recommendations                   |
| Explainability Engine       | Attach reason, evidence, confidence, decision path |
| Confidence Model            | Normalise provider confidence into platform scale  |
| Governance Gate             | Prompt / policy / human-approval boundaries        |
| Audit & Evidence Hooks      | Immutable trail for every significant outcome      |

## Request path (future engineering)

```text
Client → Gateway → Auth → Authz → QI API → QI Facade
  → Quality Intelligence Engine → Provider Contract → Provider
  → Domain Events → Evidence / QKI / Notifications / Reporting hooks
```

## Non-goals of this architecture programme

No OpenAI/Claude/Gemini implementation, prompts, embeddings, vector DBs, chat UIs, or dashboard engineering.
