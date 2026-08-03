# PROMPT-GOVERNANCE — APZQEP-163-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-163-000   |
| Timestamp | 20260803T175516Z |

## Scope

Applies to all `ai` providers. Rules/statistical/risk providers do not use prompts but share context-minimisation principles.

## Principles

1. **Prompt templates are platform-owned assets** — versioned, reviewed, auditable.
2. **No free-form unlogged prompts** from UI into production decision paths.
3. **Context assembly is policy-gated** — tenant/project isolation enforced before prompt fill.
4. **Secrets never enter prompts** — tokens, PATs, webhook secrets, credentials excluded.
5. **PII minimisation** — redact or hash where policy requires.
6. **Prompt injection defence** — untrusted text (defects, commit messages, tickets) treated as data, not instructions.
7. **Output validation** — AI outputs mapped into provider-neutral schemas; reject malformed.

## Lifecycle (conceptual)

```text
Draft template → Review → Approve → Version publish
→ Runtime bind (context) → ProviderRun audit
→ Outcome validate → Explanation attach
```

## Conversation panel (future)

A future AI Conversation Panel may exist in the workspace architecture for exploratory assistance. Production recommendations that affect scores/readiness **must** still flow through governed templates and Explanation records — chat is not a bypass.

## Explicit non-implementation

No prompts, LLM calls, or template code in APZQEP-163-000.
