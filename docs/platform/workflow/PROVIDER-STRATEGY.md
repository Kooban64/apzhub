# Workflow Platform — Provider Strategy

> **Programme:** APZHUB-PLATFORM-WORKFLOW-001  
> **Classification:** DOCUMENTATION ONLY  
> **ADR:** [ADR-0069](../../adr/ADR-0069-n8n-workflow-engine-provider.md)  
> **Date:** 2026-07-19

---

## Primary provider

| Field                 | Value                                                       |
| --------------------- | ----------------------------------------------------------- |
| Provider              | **n8n** CE (self-hosted)                                    |
| Package (disk)        | `@apzhub/integration-n8n` **0.1.0**                         |
| Certification posture | Reference Adapter · read-only metadata (APZWORKFLOW freeze) |
| User-facing name      | Never — brand masked; product is **APZ Workflow**           |

---

## Future providers (not primary for foundation / Release 1.0)

| Provider         | Notes                                               |
| ---------------- | --------------------------------------------------- |
| Temporal         | Durable execution class                             |
| Camunda          | BPMN-oriented class                                 |
| Flowable         | BPMN-oriented class                                 |
| Azure Logic Apps | Cloud SaaS class — self-hosted-first policy applies |
| Power Automate   | Cloud SaaS class — Owner-gated                      |
| Others           | Via Integration SDK only                            |

Each future provider requires: `integration.yaml` · Owner Approval · adapter certification · no Module coupling.

---

## Abstraction rules

1. Platform service interfaces use APZHUB vocabulary (workflow, run, schedule, approval).
2. Engine IDs and brand strings stay connector-internal.
3. Capabilities negotiated via adapter capability discovery.
4. Error translation at adapter boundary (010).
5. Multi-provider coexistence allowed; routing is a Platform Service concern.

---

## Freeze interaction

Provider expansion that adds execute/schedule/credentials/webhooks or new engines **must** follow the Workflow Engine freeze change policy (ADR + Owner Approval). This strategy document alone does not authorise implementation.
