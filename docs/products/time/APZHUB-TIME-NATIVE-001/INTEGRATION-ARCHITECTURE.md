# Integration Architecture — APZ Time — Stub

| Field     | Value                  |
| --------- | ---------------------- |
| Programme | APZHUB-TIME-NATIVE-001 |
| Status    | **PENDING**            |
| Timestamp | 20260804T191500Z       |

Mandatory shape:

```text
Module (APZ Time) → Platform Service (TimeService) → Service Connector (Kimai) → Engine
```

Never Module → Kimai. Never user → Kimai.
Existing adapter: `@apzhub/integration-kimai` **0.2.0**.
See [../ARCHITECTURE.md](../ARCHITECTURE.md) · [../INTEGRATIONS.md](../INTEGRATIONS.md).
