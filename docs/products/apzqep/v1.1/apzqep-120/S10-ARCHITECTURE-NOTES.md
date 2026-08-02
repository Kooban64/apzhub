# APZQEP-120-S10 — Architecture Notes

## Distinction

| Era     | Work                 |
| ------- | -------------------- |
| S01–S09 | Build the platform   |
| S10+    | Consume the platform |

## Separation

```text
Platform Processing Engine  →  executes registered processors (HOW)
Evidence Processor Bundle   →  business behaviour (WHY / WHAT)
Future bundles (S11+)       →  same registration path
```

## Sequence

```text
enqueue work (eventType = catalogue id)
worker.runOnce
  → platform resolve(eventType)
  → Evidence processor.validate + business.apply
  → ProcessingResult
  → engine ack | retry | dead letter
```
