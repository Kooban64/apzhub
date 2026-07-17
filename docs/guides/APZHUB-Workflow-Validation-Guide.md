# APZHUB Workflow Validation Guide

**Milestone:** APZWORKFLOW-001  
**Package:** `@apzhub/workflow-core`

---

## Validators

| Module | Concern |
| --- | --- |
| `structural` | Graph nodes/connections presence, unique ids, nodeKind, config scalars, connection endpoints |
| `reference` | categoryId / folderId / templateId shape + optional known-id sets |
| `parameter` | Parameter/variable keys, valueType, defaultValue type match, uniqueness |
| `version` | Positive integer versionNumber, uniqueness, status catalogue |
| `lifecycle` | State catalogue + allowed transitions |

`validateWorkflow` composes all validators into a `WorkflowValidationResult` (`valid` iff no `error` severity issues). Warnings (e.g. missing trigger) do not fail `valid`.

Validation is **metadata / structural only** — not runtime execution validation.

---

## Usage

```ts
import { validateWorkflow, createWorkflowFoundation } from "@apzhub/workflow-core";

const result = validateWorkflow({ graph, parameters, versionNumber: 1, lifecycle: "draft" });
```

`createWorkflowFoundation({ repos })` wires `validate` + lifecycle helpers with **explicit** repository ports (no silent in-memory defaults).
