# Project Templates — Internal Wave 1 defaults

| Field     | Value                                                               |
| --------- | ------------------------------------------------------------------- |
| Programme | APZQEP-161-OE                                                       |
| Nature    | **Documentation / configuration guidance** (no new product modules) |

## Default automation project (conceptual)

Use one APZQEP project (or workspace context) named for internal APZHUB quality, e.g. **APZHUB Internal Quality**.

| Field        | Suggested default                                  |
| ------------ | -------------------------------------------------- |
| Provider     | `playwright`                                       |
| Mode         | dry-run first                                      |
| Correlation  | always set UUID                                    |
| Target kinds | `url` for smoke; `suite` / `spec` for named suites |

## Example Playwright suite targets (Wave 1)

These are **target descriptors** for the Automation API / workspace — not a new suite runner product.

### OE-SMOKE-001 — Blank URL dry-run

```json
{
  "providerId": "playwright",
  "runImmediately": true,
  "target": {
    "kind": "url",
    "name": "oe-internal-smoke",
    "baseUrl": "about:blank"
  },
  "options": {
    "dryRun": true,
    "collectScreenshots": true,
    "collectTraces": true,
    "collectVideos": true,
    "collectConsole": true
  }
}
```

**Observed (20260803T164801Z):** completed; 7 artifacts; evidence refs published.

### OE-SUITE-001 — Named suite dry-run

```json
{
  "providerId": "playwright",
  "runImmediately": true,
  "target": {
    "kind": "suite",
    "name": "oe-rerun-suite",
    "refs": ["smoke"]
  },
  "options": { "dryRun": true, "retries": 1 }
}
```

### OE-NEG-001 — Placeholder rejection

```json
{
  "providerId": "selenium",
  "runImmediately": true,
  "target": { "kind": "url", "name": "oe-placeholder", "baseUrl": "about:blank" },
  "options": { "dryRun": true }
}
```

**Observed:** HTTP 400 `AUTOMATION_ERROR` — placeholder cannot execute.

## Demo dataset

| Asset          | Location                                                                   |
| -------------- | -------------------------------------------------------------------------- |
| Usage evidence | `evidence/apzqep-161-oe/20260803T164801Z/usage/`                           |
| Quick Start    | [../apzqep-161r/QUICK-START-GUIDE.md](../apzqep-161r/QUICK-START-GUIDE.md) |
| Demo Script    | [../apzqep-161r/DEMO-SCRIPT.md](../apzqep-161r/DEMO-SCRIPT.md)             |

## Workspace defaults (operator)

1. Land on `/workspace/qep/automation`.
2. Keep Providers link visible for stakeholder demos.
3. Prefer dry-run CTA until live mode is intentionally enabled.
