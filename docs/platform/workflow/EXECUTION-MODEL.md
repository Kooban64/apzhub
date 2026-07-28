# Workflow Platform — Execution Model

> **Programme:** APZHUB-PLATFORM-WORKFLOW-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19

---

## 1. Principles

1. **Respond fast, process async** (012) — validate + authorise + accept; execute via workers/engine asynchronously.
2. **Idempotent** starts and retries with correlation / causation IDs.
3. **Platform policies** decide retry/backoff/DLQ/compensation; engines execute steps.
4. **No long-running work in HTTP request handlers.**
5. **HITL** pauses runs in platform-visible waiting states.

---

## 2. Trigger types (target)

| Trigger         | Source                                       |
| --------------- | -------------------------------------------- |
| Manual          | Workbench / Command / API                    |
| Schedule        | Platform scheduler                           |
| Event           | Platform Event Bus (product/platform events) |
| API             | Product Platform Services                    |
| Approval resume | HITL completion                              |

---

## 3. Retries, errors, compensation (target)

| Concern               | Platform role                                       |
| --------------------- | --------------------------------------------------- |
| Transient failures    | Retry with backoff; max attempts; DLQ               |
| Permanent failures    | Terminal Failed + audit + notify                    |
| Compensation          | Optional compensating workflow/actions under policy |
| Partial engine errors | Adapter translates; no raw engine errors to UI      |

---

## 4. History & logs (target)

- Platform stores run summary + correlation metadata (SoR).
- Step logs may be fetched via adapter (permissioned, redacted).
- Engine remains SoR for engine-native artefacts; platform never becomes silent duplicate authority.

---

## 5. Current disk

Execution model **not implemented** in certified wave (read-only discovery only). This document is architectural foundation only.
