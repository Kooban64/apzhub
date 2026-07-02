# Invocation Sources — Extension Notes (AF-018)

> **Status:** Documentation only for planned sources  
> **Implemented sources:** see [SPR-004-AF-invocation-sources.md](../../../docs/specs/SPR-004-AF-invocation-sources.md)

---

## Long-term model

An **Invocation Source** identifies who or what initiated an action. All sources converge on the same Action Framework pipeline — no alternate execution paths.

```text
Invocation Source → Workbench API → ActionExecutor → Bridge → Workbench
```

---

## Implemented / stubbed (Sprint 004)

| Source     | Description                                 |
| ---------- | ------------------------------------------- |
| User       | Human via palette, shortcuts, menu, toolbar |
| System     | Platform jobs with explicit allow list      |
| AI Agent   | LLM orchestration (stub)                    |
| Voice      | Speech pipeline (stub)                      |
| Automation | Workflow / n8n triggers (stub)              |

---

## Planned (not implemented)

| Source       | Typical initiator      | Expected actor / gateway        |
| ------------ | ---------------------- | ------------------------------- |
| Scheduler    | Cron, delayed jobs     | `system` via automation gateway |
| External API | REST / GraphQL ingress | Policy-defined actor            |
| Webhook      | Signed HTTP callbacks  | `system` or service account     |

Future stories will:

1. Extend `InvocationSourceId` and governance docs
2. Add permission policies per source
3. Wire production gateway implementations with executor delegates
4. Extend audit metadata with source attribution

---

## Action Visibility interaction

When Action Visibility is implemented server-side, each invocation source may apply different visibility rules (e.g. AI-proposed actions hidden until confirmed). See [ACTION-VISIBILITY.md](../../../packages/workspace/src/context-menu/ACTION-VISIBILITY.md).

---

_Documentation only — no runtime behaviour for planned sources in AF-018._
