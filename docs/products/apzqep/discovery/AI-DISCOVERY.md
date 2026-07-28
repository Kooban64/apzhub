# APZ QEP — AI Discovery

> **Programme:** APZQEP-DISCOVERY-001  
> **Related:** [../AI-STRATEGY.md](../AI-STRATEGY.md) · REQ-001 AIR-*  
> **Non-negotiable:** QEP is SoR · AI assists · humans accountable · never auto-certify

## Market AI pattern (2025–2026)

Competitors race to ship:

- Test case generation from requirements/text
- Smart prioritisation / flaky detection
- NL search
- Vendor-tied copilots (Atlassian, Microsoft, GitLab)

**Gap:** Few treat AI as a **governed enterprise subsystem** with prompt versioning, audit, provider abstraction, human approval, and certification firewalls.

## Opportunity areas

### Prompt orchestration

| Opportunity                 | Discovery finding                                 |
| --------------------------- | ------------------------------------------------- |
| Structured prompt pipelines | Multi-step: retrieve → draft → critique → present |
| Context packing             | Permission-filtered SoR + KB only                 |
| Deterministic tool use      | Prefer tools/MCP over free-form SoR writes        |

### Multi-agent workflows

| Agent role (conceptual) | Responsibility                        |
| ----------------------- | ------------------------------------- |
| Analyst                 | Requirement ambiguity / testability   |
| Author                  | Draft verification procedures         |
| Reviewer                | Gap/duplicate critique                |
| Risk                    | Coverage vs risk ranking              |
| Narrator                | Readiness summary (non-authoritative) |

Agents propose; **humans accept**. No certifier agent with write authority to certification state.

### AI provider abstraction

| Finding                    | Strategy                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------ |
| Vendor lock-in risk high   | Interchangeable providers (OpenAI, Claude, Gemini, DeepSeek, Mistral, Llama, future) |
| Procurement / DPA variance | External models Owner-gated                                                          |
| Self-hosted preference     | Align Platform self-hosted-first                                                     |

### Prompt governance & versioning

Treat prompts as controlled artefacts: ownership, version, rollback, audit — peer to verification templates.

### AI audit & human approval

| Control                            | Required                       |
| ---------------------------------- | ------------------------------ |
| Log privileged AI actions          | Yes                            |
| Accept/reject before SoR commit    | Yes                            |
| Certification state mutation by AI | **Forbidden**                  |
| Feature flags default OFF          | Yes until authorised programme |

### Knowledge-aware AI

Ground suggestions in:

1. Permission-filtered QEP SoR
2. Quality Knowledge Base
3. Platform Search results

Not unconstrained web/model memory as authority.

### Continuous learning (careful)

| Allowed (later)                                       | Forbidden                                       |
| ----------------------------------------------------- | ----------------------------------------------- |
| Learn from accepted vs rejected suggestions (metrics) | Silent training on customer data without policy |
| Org-approved evaluation sets                          | Cross-tenant learning                           |

### Enterprise AI governance & explainability

Enterprises will demand:

- Provider inventory
- Data flow diagrams
- Explanation of material recommendations
- Kill switches
- Role-gated AI features

## AI discovery conclusions for Definition

1. Design AI as a **platform capability**, not a chatbot widget.
2. Invest early in **governance plumbing** (flags, audit, prompts, providers).
3. Ship user-visible generation only after governance.
4. Keep **certification firewall** absolute.
5. Prefer **MCP tool-mediated** agent actions over free-form writes.
