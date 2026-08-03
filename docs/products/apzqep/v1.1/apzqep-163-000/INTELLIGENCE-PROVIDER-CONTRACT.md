# INTELLIGENCE-PROVIDER-CONTRACT — APZQEP-163-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-163-000   |
| Timestamp | 20260803T175516Z |

## Principle

Exactly analogous to Automation and SCM:

```text
Quality Intelligence Engine
        ↓
Intelligence Provider Interface
        ↓
AI | Rules | Statistical | Risk | Historical providers
```

The engine must never depend on OpenAI, Claude, Gemini, or any vendor SDK.

## Provider kinds

| Kind          | Examples                                        |
| ------------- | ----------------------------------------------- |
| `ai`          | OpenAI, Claude, Gemini, Azure OpenAI, Local LLM |
| `rules`       | Deterministic policy / rule engine              |
| `statistical` | Trend, prediction, clustering math              |
| `risk`        | Risk / impact engines                           |
| `historical`  | Historical analytics over platform metrics      |

## Contract capabilities (conceptual)

| Capability              | Description                                     |
| ----------------------- | ----------------------------------------------- |
| Provider identity       | Stable id, name, version, kind                  |
| Capability declaration  | What the provider can do                        |
| Authentication config   | Secret refs only — never plaintext in events    |
| Health / diagnostics    | Connection and readiness                        |
| Inference / evaluation  | Produce provider-neutral outcomes               |
| Confidence scoring      | Provider-local confidence → platform normaliser |
| Explainability payload  | Reasons, features, citations                    |
| Versioning              | Model/rule/version stamps                       |
| Rate / cost metadata    | Optional operational metadata                   |
| Policy compliance flags | Data residency, PII handling claims             |

## Outcome shape (provider-neutral)

Providers return platform outcomes, not vendor chat completions as the enterprise contract:

| Outcome kind     | Use                                |
| ---------------- | ---------------------------------- |
| `score`          | Numeric quality / risk / readiness |
| `recommendation` | Actionable advice                  |
| `prediction`     | Forward-looking estimate           |
| `cluster`        | Grouping of defects / failures     |
| `explanation`    | Structured explainability          |
| `narrative`      | Optional human-readable summary    |

Raw vendor payloads may be stored only in provider-internal audit sinks — **never** as the enterprise event contract.

## Initial providers (architecture only)

| Provider id (proposed) | Kind        | Wave 3 engineering status |
| ---------------------- | ----------- | ------------------------- |
| `openai`               | ai          | First AI candidate        |
| `claude`               | ai          | Planned                   |
| `gemini`               | ai          | Planned                   |
| `azure_openai`         | ai          | Planned                   |
| `local_llm`            | ai          | Planned (self-hosted)     |
| `rules_engine`         | rules       | Foundation candidate      |
| `statistical_engine`   | statistical | Foundation candidate      |
| `historical_analytics` | historical  | Foundation candidate      |
| `risk_engine`          | risk        | Foundation candidate      |

No implementation in APZQEP-163-000.

## Placeholder policy

Unimplemented providers must register as **placeholder** and refuse evaluation — same honesty rule as Automation / SCM.
