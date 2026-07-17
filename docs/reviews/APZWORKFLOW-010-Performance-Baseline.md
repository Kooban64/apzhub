# APZWORKFLOW-010 — Performance Baseline

**Method:** Measurement only (mocked/controlled data). No optimisation performed.

## Approach

| Surface | Method |
| --- | --- |
| HTTP handlers | Vitest handler timing under mock gateway (`workflow-engine.test.ts`) |
| Typed client | Mock HTTP / mock client request path in Vitest |
| Workbench render | React Testing Library mount of Overview / Workflows / Definition Viewer / Capabilities / Diagnostics |
| Overview render | Status cards + React Query invalidation path |
| Definition viewer | Synchronous pure metadata render (counts) |

## Baseline notes (2026-07-15)

| Observation | Finding |
| --- | --- |
| Overview mount (mocked client) | Sub-second in Vitest jsdom (machine-dependent) |
| Workflows + definition viewer | Sub-second with mock detail query |
| Typed client mock round-trip | Negligible layout cost; network path not measured live |
| Live n8n latency | Not measured — provider optional / out of CI |

## Limitations

- Not a load test; not production RUM
- No live n8n latency in CI
- Playwright live timing **LIMITED** by Testing slug conflict (external)

No blocking performance defect identified.
