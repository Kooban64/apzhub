# Workflow Platform — Operational Model

> **Programme:** APZHUB-PLATFORM-WORKFLOW-001  
> **Classification:** DOCUMENTATION ONLY  
> **Authority:** [014 Observability](../../014-observability-monitoring-operations-standards.md)  
> **Date:** 2026-07-19

---

## 1. Health hierarchy

```text
Platform → Workspace → Module → Workflow Platform Service → Connector → Engine → Infrastructure
```

Each layer self-reports. Engine health via adapter diagnostics (brand masked in standard UI).

---

## 2. Enablement (baseline today)

| Flag                             | Role                       |
| -------------------------------- | -------------------------- |
| `APZHUB_WORKFLOW_ENABLED`        | SoR / management plane     |
| `APZHUB_WORKFLOW_ENGINE_ENABLED` | Env-gated live n8n adapter |

---

## 3. Observability pillars

| Pillar  | Workflow Platform                                                     |
| ------- | --------------------------------------------------------------------- |
| Metrics | Run counts, failures, queue depth (target); service health (baseline) |
| Logs    | Structured, secret-redacted, correlation IDs                          |
| Traces  | Gateway → service → adapter spans (target hardening)                  |
| Health  | `/health` · `/diagnostics` surfaces                                   |

---

## 4. Operations console

Administration Workspace (permission-gated) surfaces queues, workers, alerts, audit — not raw n8n admin for standard users.

---

## 5. Incident posture (target)

- Failed runs → DLQ + notify
- Provider outage → circuit breaker on connector
- Credential rotation via refs without downtime where possible

---

## Related

- [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md)
- Freeze ops constraints: [Workflow Engine Freeze Notice](../../architecture/APZHUB-Workflow-Engine-Architecture-Freeze-Notice.md)
