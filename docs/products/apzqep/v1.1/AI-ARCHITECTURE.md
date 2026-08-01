# AI Architecture — APZQEP v1.1

Governed by [APZHUB-AI-OPERATIONAL-FRAMEWORK.md](../../../governance/APZHUB-AI-OPERATIONAL-FRAMEWORK.md) and [AI-STRATEGY.md](./AI-STRATEGY.md).

---

## 1. Architectural principles

| Principle              | Rule                                                      |
| ---------------------- | --------------------------------------------------------- |
| Assistive only         | AI proposes; humans dispose                               |
| Service boundary       | All writes via Platform Services                          |
| Permission inheritance | Invoke with caller identity; no elevation                 |
| Grounding              | RAG over permissioned QEP index + approved docs           |
| Audit                  | Prompt version, model, inputs refs, output hash, decision |
| Kill switch            | Workspace/org disable without deploy                      |
| Evaluation             | Golden sets gate prompt/model promotion                   |

---

## 2. Logical architecture

```text
┌─────────────┐   ┌──────────────┐   ┌─────────────────┐
│ AI Workspace│──►│ Guardrail    │──►│ Model Abstraction│
│ Chat/Inline │   │ Policy Engine│   │ (provider adapters)│
└──────┬──────┘   └──────┬───────┘   └─────────┬───────┘
       │                 │                     │
       │          ┌──────▼───────┐      ┌──────▼──────┐
       │          │ RAG Retriever│◄─────│ Search / Docs│
       │          └──────────────┘      └─────────────┘
       │                 │
       ▼                 ▼
┌─────────────┐   ┌──────────────┐
│ Draft Store │──►│ Approval UX  │──► Platform Services
└─────────────┘   └──────────────┘
       │
       ▼
   Audit / Events
```

Package target (when engineered): `@apzhub/qep-ai` + `modules/qep-ai-workspace` · service `QepAiService`.

---

## 3. Assistant capabilities

### AI Requirement Assistant

| Skill                    | Input               | Output                   | Approval               |
| ------------------------ | ------------------- | ------------------------ | ---------------------- |
| Analysis                 | Requirement text/id | Quality notes, ambiguity | Review                 |
| Gap detection            | Req set / baseline  | Missing criteria list    | Review                 |
| Traceability suggestions | Req id              | Proposed links           | Approve → TraceService |
| Quality scoring          | Requirement         | Score + rationale        | Informational          |

### AI Test Engineer

| Skill                    | Output                 | Approval               |
| ------------------------ | ---------------------- | ---------------------- |
| Test generation          | Draft specifications   | Approve → SpecService  |
| Suite generation         | Draft suite membership | Approve → SuiteService |
| Regression selection     | Suggested run subset   | Approve → Run create   |
| Test optimisation        | Redundancy hints       | Informational          |
| Test data generation     | Synthetic data pack    | Approve before use     |
| Coverage recommendations | Gaps vs QI             | Informational          |

### AI Defect Analyst

| Skill                  | Horizon             |
| ---------------------- | ------------------- |
| Duplicate detection    | 1.1 MVP / 1.2 depth |
| Root cause suggestions | 1.2                 |
| Risk prediction        | 1.2                 |
| Failure clustering     | 1.2                 |
| Regression prediction  | 1.2                 |

### AI Release Advisor

| Skill                          | Horizon         |
| ------------------------------ | --------------- |
| Release readiness narrative    | 1.1             |
| Quality confidence explanation | 1.1 (QI-backed) |
| Risk assessment narrative      | 1.1             |
| Certification assistance       | 1.2             |
| Evidence summaries             | 1.1             |

### AI Product Assistant

| Concern           | Design                                                             |
| ----------------- | ------------------------------------------------------------------ |
| NL interaction    | Chat with tool-calling limited to allow-listed reads + draft tools |
| Enterprise RAG    | Tenant-scoped chunks from search index + curated knowledge         |
| Context awareness | Current entity, project, permissions                               |
| Explainability    | Citations mandatory for factual claims                             |
| Human approval    | Draft inbox; bulk approve later                                    |
| Model abstraction | Provider interface; org defaults; no hardcode vendor in domain     |
| Prompt governance | Versioned Prompt Library; change control                           |
| Evaluation        | Offline harness + production acceptance metrics                    |
| Audit logging     | Immutable AI audit records in platform audit store                 |

---

## 4. APIs (target)

| Endpoint family                           | Purpose                   |
| ----------------------------------------- | ------------------------- |
| `POST /api/v1/qep/ai/invoke`              | Run skill (returns draft) |
| `GET /api/v1/qep/ai/drafts`               | List pending drafts       |
| `POST /api/v1/qep/ai/drafts/{id}/approve` | Apply via domain service  |
| `POST /api/v1/qep/ai/drafts/{id}/reject`  | Discard                   |
| `GET/POST /api/v1/qep/ai/prompts`         | Prompt library (admin)    |
| `GET /api/v1/qep/ai/models`               | Configured models         |

Permissions: `qep.ai.invoke` · `qep.ai.approve` · `qep.ai.admin`.

---

## 5. Guardrail policy (minimum)

- Block secrets/PII patterns in prompts/responses (best effort)
- Deny tools outside allow list
- Max tokens / rate limits / cost budgets
- Prompt-injection heuristics
- Compulsory citation mode for RAG answers
- No auto-approve for write skills

---

## 6. Delivery mapping

| Slice                                             | Programme                           |
| ------------------------------------------------- | ----------------------------------- |
| Platform skeleton + guardrails + RAG + 1.1 skills | **APZQEP-150**                      |
| Defect analyst / optimisation depth               | 1.2 within 150 follow-ons           |
| Certification assistant                           | with Certification Engine (160/1.2) |
