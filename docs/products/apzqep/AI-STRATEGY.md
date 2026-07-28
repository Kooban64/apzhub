# APZ QEP — AI Strategy

> **Programme:** APZQEP-TRANSITION-001  
> **Posture:** AI-native platform · QEP remains System of Record · AI are assistants

## Principles

1. **AI-native** — AI is a first-class product capability, not a bolted-on chatbot.
2. **Interchangeable providers** — no single-vendor lock-in in architecture intent.
3. **Human gates** — certification-impacting actions require human approval.
4. **Never SoR** — AI outputs are drafts/suggestions until accepted into QEP SoR.
5. **Never auto-certify** — inherited from APZTCMS-REQ-001 AIR-009; remains binding.
6. **Permission-filtered knowledge** — AI may only use data the user can access.
7. **Self-hosted first preference** — external cloud models require Owner Approval + DPA where personal data is involved.

## Provider architecture (intent)

Support interchangeable providers including, but not limited to:

| Provider class     | Examples                                                       |
| ------------------ | -------------------------------------------------------------- |
| Commercial APIs    | OpenAI · Anthropic Claude · Google Gemini · DeepSeek · Mistral |
| Open / self-hosted | Llama and compatible local runtimes                            |
| Future             | Additional providers via Integration Adapter pattern           |

Routing, failover, and prompt governance are Definition/Architecture concerns later — this strategy only commits to **provider interchangeability**.

## IDE integrations (intent)

Governed integration with developer environments including:

| IDE / environment | Intent                        |
| ----------------- | ----------------------------- |
| Cursor            | Primary AI IDE adjacency      |
| VS Code           | Broad editor support          |
| Windsurf          | AI IDE adjacency              |
| Replit            | Cloud IDE adjacency           |
| Kilo              | Listed Owner target           |
| Future IDEs       | Extensible via MCP / adapters |

IDE integrations must not bypass Platform Authz or write certification state silently.

## Capability themes (from evolved TCMS AI requirements)

- AI verification generation & review
- AI risk / coverage / regression suggestions
- AI release-readiness narratives (non-authoritative)
- Prompt governance & AI audit
- Responsible AI (POPIA/GDPR-aligned)

## Default posture until implementation programmes

AI features remain **disabled by default** until named Owner-authorised implementation programmes. Documentation of AI-native vision does **not** enable runtime AI.
