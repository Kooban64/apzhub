# Session Propagation — APZ-LAW-NATIVE-001-N02

| Field     | Value            |
| --------- | ---------------- |
| Slice     | N-02             |
| Status    | **COMPLETE**     |
| Timestamp | 20260805T192000Z |

## Behaviour

| Plane                 | Hydration                                         | Default grant       |
| --------------------- | ------------------------------------------------- | ------------------- |
| Workbench nav / views | `loadWorkbenchRegistryDto` → session auth adapter | **None** (filtered) |
| Command palette       | `loadActionRegistryDto` → session auth adapter    | **None** (filtered) |

Health summaries may use allow-all for catalogue counting only — not user chrome.

## Closed gaps

- **L-G01 (partial)** — Activity Bar identity **APZ Law**; practice planes admin-gated
- Removed Tenant Member → Law Operator inheritance (critical identity collapse)
