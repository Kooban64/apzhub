# WORKSPACE-ARCHITECTURE — APZQEP-163-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-163-000   |
| Timestamp | 20260803T175516Z |

## Route (proposed)

```text
/workspace/qep/quality-intelligence
```

Module catalogue (future): enable a dedicated QI module — do not hardcode in shell until engineering.

## Surfaces

| Surface                      | Purpose                                  |
| ---------------------------- | ---------------------------------------- |
| Executive Overview           | Board/executive quality posture          |
| Engineering Dashboard        | Engineer-facing health and actions       |
| Quality Health               | Score + components + trends              |
| Risk Dashboard               | Risks, factors, trends                   |
| Recommendation Centre        | Inbox of recommendations + accept/reject |
| Release Readiness            | Advice, conditions, blockers             |
| Quality Timeline             | Chronological intelligence events        |
| Provider Status              | AI/rules/stats/risk provider health      |
| Confidence Analysis          | Confidence distributions and caps        |
| Evidence Explorer            | Jump to evidence supporting outcomes     |
| Explainability View          | Full decision path for any outcome       |
| Future AI Conversation Panel | Exploratory assistance (non-bypass)      |

## UX principles

- One job per surface.
- Explainability one click away from every score/recommendation.
- Provider attribution always visible.
- Empty / loading / error states first-class.
- Permission-driven: only show domains the user may see.
- Must not structurally prevent multi-provider — UI labels “AI” as a provider class, not the product name.

## Non-goals of this architecture programme

No dashboard implementation, no chat UI code, no charts engineering.
