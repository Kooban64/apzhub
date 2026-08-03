# Operator Experience Report — APZQEP-161R

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-161R      |
| Verdict   | **PASS**         |
| Timestamp | 20260803T152830Z |

## Operator journey

1. Open **Enterprise Automation** workspace.
2. Confirm providers (Playwright **active**; others **placeholder**).
3. Run Playwright dry-run from CTA.
4. Observe execution appear in queue/history with lifecycle state.
5. Open execution detail — status, summary, timing, artifacts, evidence refs.
6. Optionally call provider-neutral APIs for automation/scripting.

## Strengths

- Clear module entry and provider-neutral vocabulary.
- Lifecycle states are visible and aligned to platform contracts.
- Placeholders refuse execution — operators cannot accidentally “run” unimplemented engines.
- Correlation id generated for workspace runs.

## Friction

| Issue                                                         | Impact                                              | Severity   |
| ------------------------------------------------------------- | --------------------------------------------------- | ---------- |
| In-memory store lost on process restart                       | History not durable across deploys                  | Medium     |
| Dry-run default may confuse “is Playwright really running?”   | Training / ops clarity needed                       | Medium     |
| Artifact URIs not downloadable binaries                       | Support for deep failure analysis limited           | Medium     |
| No dedicated operator runbook in V1.0 ops pack for automation | This programme’s Quick Start / Demo Script mitigate | Low–Medium |

## Supportability notes

Operators should treat Wave 1 as **foundation + dry-run certification path**. Enable live only with `APZHUB_AUTOMATION_LIVE=true` and Playwright installed, and document that live mode is optional.
