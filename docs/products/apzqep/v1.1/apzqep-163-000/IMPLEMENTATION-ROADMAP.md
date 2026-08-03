# IMPLEMENTATION-ROADMAP — APZQEP-163-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-163-000   |
| Timestamp | 20260803T175516Z |

## Gate

```text
APZQEP-163-000 architecture
        ↓
Product Board approval (future PBR-APZQEP-163-000 or equivalent)
        ↓
Owner Auth → APZQEP-163 engineering
        ↓
(optional) APZQEP-163R readiness
        ↓
Product Board Wave 3 certification
        ↓
Wave 4 dashboards consume QI
```

## Proposed engineering slices (future APZQEP-163 — not authorised here)

| Slice | Focus                                             | First providers                         |
| ----- | ------------------------------------------------- | --------------------------------------- |
| A     | Platform package + provider registry + data model | rules_engine, statistical_engine stubs  |
| B     | Signal assembly from Evidence / Automation / SCM  | historical_analytics                    |
| C     | Quality Scoring + Explainability                  | rules + statistical                     |
| D     | Recommendation lifecycle + workspace MVP          | rules                                   |
| E     | Release Readiness + Board summary                 | rules + statistical                     |
| F     | First AI provider (OpenAI) behind contract        | openai (offline/demo + live flag)       |
| G     | Additional AI providers + local LLM path          | claude/gemini/local placeholders→active |
| H     | Risk / defect clustering / regression recommend   | risk_engine + AI assist                 |

Exact slice IDs to be set in APZQEP-163 Owner Auth.

## Hard constraints for future engineering

1. Package name: `@apzhub/platform-quality-intelligence` (+ `@apzhub/qep-quality-intelligence` facade).
2. Engine never imports AI SDKs.
3. Durable persistence for recommendations/explanations (not process-local for certified claims).
4. No autonomous release.
5. No Wave 4 dashboard programme under 163.

## Dependencies already satisfied

- Automation Platform (Wave 1)
- SCM Platform (Wave 2)
- Evidence, QKI, Notifications, Commands, Reporting (V1.0 / platform)

## Explicitly not in Wave 3

Executive dashboard product (Wave 4), CI orchestration, ecosystem marketplace.
