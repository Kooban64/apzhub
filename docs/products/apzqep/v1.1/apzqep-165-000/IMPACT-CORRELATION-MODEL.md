# IMPACT-CORRELATION-MODEL — APZQEP-165-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-165-000   |
| Timestamp | 20260804T054651Z |

## Purpose

Architect **impact analysis** as an orchestration-coordinated correlation model.  
**No algorithms are specified here** — only ownership, inputs, outputs, and persistence rules.

## Correlation graph (conceptual)

```text
SCM change set
  → changed files
  → changed services / modules / packages
  → requirements (links)
  → candidate suites / automation definitions
  → risk signals
  → repository / dependency context
  → QI impact observations (optional input)
```

## Ownership

| Element                          | Owner                                     |
| -------------------------------- | ----------------------------------------- |
| Change set / commits / PRs       | SCM                                       |
| File → module/service maps       | Platform metadata / project config (refs) |
| Suite definitions                | Automation / Suite Management             |
| Requirements links               | Requirements / project systems (refs)     |
| Risk / QI observations           | Quality Intelligence                      |
| Correlation session + selections | Orchestration (refs + derived selection)  |

Orchestration **must not** become the authoritative store of file trees, suites, or requirements.

## Orchestration responsibilities

1. Request correlation inputs from registered capabilities
2. Assemble a **Correlation Context** (non-authoritative snapshot for the run)
3. Pass context into selection policy evaluation
4. Persist correlation context refs on the flow run for audit/explainability
5. Propagate `correlationId` / `causationId` end-to-end

## Outputs used by selection

- Candidate suite set
- Suggested selection profile (smoke / targeted / risk-based / …)
- Risk flags
- Missing-mapping warnings (fail-closed or degrade per policy)

## Failure modes

| Mode                    | Handling (policy)                                |
| ----------------------- | ------------------------------------------------ |
| SCM context unavailable | Retry / fail flow                                |
| Mapping incomplete      | Warn + targeted fail-closed for production flows |
| Conflicting maps        | Prefer explicit project config; audit conflict   |

## Non-goals

- Specifying ML/heuristic algorithms
- Duplicating SCM blame/history SoR
- UI-owned impact calculation
