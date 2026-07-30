# Behaviour Delta Assessment — APZQEP-REM-002

## Delta present?

```text
YES — Workbench shell navigation behaviour changed
```

## Description

The shell no longer rewinds the browser URL to the focused view base route on every pathname change when the focused view is stale relative to a deep link. URL rewind now occurs only when the **selected view route** changes.

## Impact

| Surface                                                        | Impact                                                                            |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Evidence nested routes (provenance / versions / relationships) | Deep links remain stable                                                          |
| Other workspace deep links under registered views              | Same protective behaviour                                                         |
| Activity Bar / Sidebar navigation                              | Unchanged intent — still pushes selected view route when URL is outside that view |
| Evidence Domain / API contracts                                | None                                                                              |

## Freeze implication

Because runtime shell behaviour changed relative to FREEZE-003 candidate `ce220a5d`, the frozen candidate is **invalidated** for release packaging.
