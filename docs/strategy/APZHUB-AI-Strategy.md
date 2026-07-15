# APZHUB AI Strategy

> **Milestone:** PCS-001  
> **Status:** Strategic definition — planning only  
> **Authority:** [Document 024 — Platform SDK](../024-apzhub-platform-sdk-development-framework.md) · [Action Framework gateways](../architecture/command-framework.md)

---

## AI vision

AI in APZHUB is a **governed platform capability** — not a feature bolted onto individual modules. Users experience AI through the Workbench (command palette, knowledge overlay, context panel); operators control it through governance and audit; developers extend it through registered AI providers — never direct LLM calls from modules.

**Principle:** AI proposes and assists; Platform Services authorize and execute.

---

## AI domains

### 1. Developer AI

| Aspect | Strategy |
|--------|----------|
| **Purpose** | Accelerate manifest-first development, codegen, test generation |
| **Users** | Engineers, Cursor/IDE workflows |
| **Models** | Cloud (Cursor); local optional for air-gap |
| **Governance** | No production secrets in prompts; constitution + foundation docs as context |
| **Build vs buy** | IDE tools (buy); compliance checker (build) |
| **Timeline** | Continuous (Cursor rules, skills — already active) |

### 2. Knowledge AI

| Aspect | Strategy |
|--------|----------|
| **Purpose** | Semantic search, document summarisation, cross-module discovery |
| **Users** | All platform users |
| **Integration** | Knowledge & Discovery Framework providers |
| **Models** | Local embeddings (Ollama/pgvector) default; cloud optional |
| **RAG** | Permission-filtered index (Document 020); derived not SoR |
| **Governance** | Query-time permission filter; no index without authz |
| **Timeline** | Post PCv2-01; after persistent search index |

### 3. Legal AI

| Aspect | Strategy |
|--------|----------|
| **Purpose** | Matter summarisation, deadline extraction, document review assist |
| **Users** | Law Platform users |
| **Integration** | Law Platform Services — not Workbench directly |
| **Models** | Enterprise: local preferred; cloud with DPA |
| **Governance** | Matter-scoped context; audit every AI invocation |
| **Compliance** | No training on client data; jurisdiction profiles |
| **Timeline** | Post Law production hardening |

### 4. Operational AI

| Aspect | Strategy |
|--------|----------|
| **Purpose** | Anomaly detection, incident summarisation, runbook suggestions |
| **Users** | Platform operators |
| **Integration** | Operations Console + observability connectors |
| **Models** | Local or cloud; ops-tier permission only |
| **Governance** | No PII in ops prompts; masked diagnostics |
| **Timeline** | Post PCv2-07 observability |

### 5. Workflow AI

| Aspect | Strategy |
|--------|----------|
| **Purpose** | Natural language → action execution; automation suggestions |
| **Users** | Power users |
| **Integration** | Action Framework AI gateway (stub exists M4) |
| **Models** | Cloud for NLU; local for classification |
| **Governance** | Permission-filtered action catalogue; confirm destructive actions |
| **Timeline** | Post n8n integration (E-24) |

---

## Model strategy

| Tier | Technology | Use case |
|------|------------|----------|
| **Local** | Ollama, llama.cpp, pgvector | Enterprise air-gap; embeddings; classification |
| **Cloud** | OpenAI, Anthropic APIs | Complex reasoning; optional |
| **Hybrid** | Local embed + cloud reason | Cost/latency balance |

**Default:** Self-hosted local models for enterprise; cloud opt-in per tenant via governance flag.

---

## RAG architecture (strategic)

```text
Documents/Events → Ingestion worker → Chunk + embed → Vector store (derived)
                                                              ↓
User query → Knowledge Service → Authz filter → RAG retrieve → LLM → Response
                     ↓
              Audit + correlation ID
```

- **Index is derived** — rebuild from SoR; never authoritative.
- **Permission filter at query time** — not post-hoc.
- **Tenant isolation** — separate namespaces per tenant.

---

## Agent architecture (strategic)

```text
User intent → Agent Orchestrator (Platform AI Service)
                  ↓
         Tool registry (actions, search, service calls)
                  ↓
         Permission check per tool invocation
                  ↓
         Platform Service execution (never direct connector)
                  ↓
         Audit + event publish
```

**Agents are not autonomous** — each tool call is authorized. No agent bypasses Platform Service layer.

---

## Prompt management

| Concern | Approach |
|---------|----------|
| Storage | Versioned prompt templates in platform metadata (not code) |
| Variables | Context injection via typed slots (tenant, matter, user) |
| Versioning | Semantic version per prompt; rollback support |
| Testing | Evaluation harness with golden datasets |
| Exposure | Never in client bundles; server-side only |

---

## Evaluation

| Type | Method |
|------|--------|
| Retrieval quality | Precision/recall on permission-filtered test sets |
| Response quality | Human review + LLM-as-judge (offline) |
| Safety | Red team prompts; jailbreak resistance |
| Latency | P95 targets per model tier |
| Cost | Token metering hooks (PCv2-10) |

---

## AI governance

| Control | Owner |
|---------|-------|
| Feature flags per AI capability | Platform Governance |
| Model allowlist per tenant | Governance + license |
| Audit log of AI invocations | Platform audit |
| Data residency policy | Tenant config |
| PII redaction before LLM | Platform AI Service |
| User consent for cloud models | Preference + org policy |
| Rate limits on AI endpoints | Platform Security |

**Modules never call LLM APIs directly** — violation of Document 003.

---

## AI sequencing

```text
Phase 0: AI gateway stubs (delivered M4) — no expansion until PCv2-01
Phase 1: Knowledge embeddings + semantic search (local model)
Phase 2: Action Framework AI gateway (NL → action)
Phase 3: Law document AI (matter-scoped)
Phase 4: Operational AI (observability correlation)
Phase 5: Agent orchestrator platform service
```

---

## Risks

| Risk | Mitigation |
|------|------------|
| Data leakage to cloud LLM | Local default; governance gate; redaction |
| Ungoverned module LLM calls | Architecture compliance checker (E-43) |
| Hallucination in legal context | Human-in-loop; cite sources; audit |
| Cost explosion | Rate limits; metering; model tiering |

---

## References

- [Build vs Buy Strategy](./APZHUB-Build-vs-Buy-Strategy.md)
- [OSS Integration Strategy](./APZHUB-OSS-Integration-Strategy.md)
- [Document 020 — Unified Search](../020-unified-search-knowledge-discovery-framework.md)
- [Document 019 — Command Palette](../019-universal-command-palette-action-framework.md)
