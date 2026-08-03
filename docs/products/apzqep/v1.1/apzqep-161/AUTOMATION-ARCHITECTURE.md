# Automation Architecture — APZQEP-161

## Principle

APZQEP-161 delivers an **Enterprise Automation Platform**, not a Playwright integration.

```text
Automation Engine
      │
      ├── Automation Provider Interface
      │         │
      │         ├── Playwright Provider   (active — Wave 1)
      │         ├── Selenium Provider     (placeholder)
      │         ├── Cypress Provider      (placeholder)
      │         ├── Appium Provider       (placeholder)
      │         ├── REST Provider         (placeholder)
      │         ├── k6 Provider           (placeholder)
      │         ├── Visual Provider       (placeholder)
      │         └── Accessibility Provider (placeholder)
      │
      ├── Execution Coordinator / Scheduler
      ├── Provider Registry
      ├── Execution Context & Lifecycle
      ├── Execution Events
      └── Evidence Pipeline → Quality Intelligence / Reporting hooks
```

## Package placement

| Package                       | Role                                                      |
| ----------------------------- | --------------------------------------------------------- |
| `@apzhub/platform-automation` | **Platform** capability — reusable across APZHUB products |
| `@apzhub/qep-automation`      | APZQEP consumer facade + workspace presentation contracts |
| `apps/web`                    | HTTP API + Enterprise Automation Workspace UI             |

The engine lives in a **platform** package so future APZHUB products can consume the same foundation.

## Layer rules

1. **Engine never imports Playwright** — only the Playwright provider module may.
2. **External APIs are provider-neutral** — no Playwright types on HTTP or workspace contracts.
3. **Modules call Platform Services / facades** — not providers directly from UI.
4. **Evidence / QKI / Notifications / Reporting** are integrated via events and refs — not duplicated.
5. Placeholders refuse execution until a future wave implements them.

## Core components

| Component             | Responsibility                                              |
| --------------------- | ----------------------------------------------------------- |
| AutomationEngine      | Enqueue, schedule, run, cancel; lifecycle transitions       |
| ProviderRegistry      | Register / discover providers by id                         |
| ExecutionStore        | In-memory Wave 1 store (persistence wave later if needed)   |
| Lifecycle transitions | Enforce legal state machine                                 |
| Domain events         | Lifecycle + evidence publication                            |
| Evidence sink hooks   | Publish evidence refs for Evidence Platform / QKI consumers |

## Request path

```text
Client → Gateway → Authz → QEP Automation API → QepAutomationFacade
  → Platform AutomationEngine → Provider Interface → Provider
  → Artifacts + Evidence refs → Events → Evidence / QKI / Reporting hooks
```
