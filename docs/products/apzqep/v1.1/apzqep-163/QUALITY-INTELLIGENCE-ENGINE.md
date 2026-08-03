# QUALITY-INTELLIGENCE-ENGINE — APZQEP-163

## Package

`@apzhub/platform-quality-intelligence`

## Principle

```text
Quality Intelligence Engine
        ↓
Provider Contract
        ↓
rules | statistical | historical | dummy_ai | placeholders…
```

The engine never imports AI vendor SDKs. External AI remains future programmes (e.g. APZQEP-163A).

## Components delivered

| Component                  | Role                                      |
| -------------------------- | ----------------------------------------- |
| Observation recording      | Immutable quality facts                   |
| Signal calculation         | Derived explainable signals               |
| Provider registry/dispatch | Active + placeholder providers            |
| Recommendation lifecycle   | proposed → accepted / rejected            |
| Confidence assessment      | level + numeric with weighting            |
| Explainability             | Mandatory on every recommendation         |
| Quality scoring            | Derived dimensions; not manually editable |
| Domain events              | `platform.quality_intelligence.*`         |

## Bootstrap

```ts
import { createPlatformQualityIntelligence } from "@apzhub/platform-quality-intelligence";

const qi = createPlatformQualityIntelligence({
  publishEvent: async (event) => {
    /* bus / hooks */
  },
});
```
