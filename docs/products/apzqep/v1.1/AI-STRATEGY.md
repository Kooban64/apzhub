# AI Strategy — APZQEP v1.1+

## Purpose

Define how APZQEP uses AI as a **product capability** under the APZHUB AI Operational Framework — assistive, auditable, human-approved.

## Principles

| Principle        | Rule                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------- |
| Human authority  | AI never seals evidence, approves certification, or releases without human confirmation |
| Grounding        | Prefer RAG over QEP SoR + docs; cite sources                                            |
| Least privilege  | AI actions use caller permissions; no elevation                                         |
| Auditability     | Every AI suggestion/action logged with prompt version, model, inputs refs, outcome      |
| Evaluation       | Offline eval sets before widening scope                                                 |
| No silent writes | Drafts only until user accepts                                                          |
| Platform first   | Reuse APZHUB AI ops patterns; no product-local governance fork                          |

## Capability map

| Capability                         | v1.1              | 1.2                    | 1.3 | 2.0   |
| ---------------------------------- | ----------------- | ---------------------- | --- | ----- |
| AI Requirement Analysis            | MVP               | Depth                  | —   | —     |
| AI Requirement Traceability assist | Suggest links     | Auto-propose w/ review | —   | —     |
| AI Test Generation                 | Draft cases       | Suites-aware           | —   | —     |
| AI Test Optimisation               | —                 | MVP                    | —   | —     |
| AI Regression Selection            | —                 | MVP                    | —   | —     |
| AI Risk Analysis                   | Narrative MVP     | Quantitative           | —   | —     |
| AI Defect Classification           | —                 | MVP                    | —   | —     |
| AI Root Cause Suggestions          | —                 | MVP                    | —   | —     |
| AI Release Readiness               | Narrative MVP     | Gate scoring assist    | —   | —     |
| AI Evidence Summaries              | MVP               | Multi-set              | —   | —     |
| AI Certification Assistant         | —                 | Checklist assist       | —   | —     |
| AI Test Data Generation            | —                 | MVP                    | —   | —     |
| AI Executive Insights              | —                 | —                      | MVP | Depth |
| AI Chat Assistant                  | Scoped MVP        | Multi-module           | —   | —     |
| AI Knowledge Search (RAG)          | MVP               | Expanded corpus        | —   | —     |
| Natural Language Query             | MVP (chat)        | Structured NL→filter   | —   | —     |
| Prompt Library                     | MVP               | Versioned org library  | —   | —     |
| Model Management                   | Config MVP        | Multi-model policy     | —   | —     |
| Guardrails                         | MVP               | Policy engine          | —   | —     |
| Evaluation                         | Pilot harness     | Continuous             | —   | —     |
| Human approval workflow            | **Mandatory MVP** | Bulk approve UX        | —   | —     |

## Architecture sketch (non-implementing)

```text
User (permissioned)
  → AI Workspace / Chat / Inline Assist
  → Guardrail + Policy
  → RAG (QEP search index + approved docs)
  → Model provider (configurable)
  → Draft artefact / narrative
  → Human Approve / Edit / Reject
  → Platform Service write (existing APIs)
  → Audit + optional event
```

No AI writes bypass Platform Services. No AI in connectors without Integration SDK patterns.

## Guardrails (mandatory)

- PII / secrets redaction in prompts and logs
- Tenant isolation on retrieval
- Allow-listed tools/actions per role
- Rate limits and cost controls
- Jailbreak / prompt-injection resistance baseline
- Disablement switch per workspace

## Evaluation

| Gate       | Requirement                                                  |
| ---------- | ------------------------------------------------------------ |
| Pilot      | Golden set for req analysis + test gen + evidence summary    |
| Expand     | Regression eval on prompt/model change                       |
| Production | Human acceptance rate and defect introduction rate monitored |

## Out of scope

- Autonomous agents closing defects or releasing builds
- Training on customer data without Owner policy
- Replacing CERT/FREEZE/RELEASE governance with AI judgment

## Success criteria (v1.1 AI)

- ≥3 AI capabilities in pilot with human approval UX
- 100% AI writes audited
- Zero privilege escalations in threat review
- Owner-accepted prompt library v1
