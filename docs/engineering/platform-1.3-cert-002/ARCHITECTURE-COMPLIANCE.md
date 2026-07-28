# Architecture Compliance — Platform-1.3-CERT-002

## Layering

```
Presentation → Platform Services → Connector → Engine
```

**COMPLIANT** — no new layer; no Presentation→Connector bypass; no Service→Engine skip introduced by Platform 1.3 or RR-001.

## Unchanged surfaces

| Surface                        | Verdict                                                                  |
| ------------------------------ | ------------------------------------------------------------------------ |
| Platform Runtime               | **UNCHANGED**                                                            |
| Platform Services boundaries   | **UNCHANGED** (additive Observe / Realtime / Notification Delivery only) |
| Gateway                        | **UNCHANGED** (additive routes)                                          |
| Workbench                      | **UNCHANGED** (shell + product surfaces; no redesign)                    |
| Identity                       | **UNCHANGED**                                                            |
| Event Bus                      | **UNCHANGED** (additive consumers)                                       |
| Integration SDK **1.0.0**      | **FROZEN** · `pnpm certify:integration-sdk` PASS (LIMITED coverage)      |
| ADR-0070 / ADR-0071 / ADR-0072 | **UNCHANGED**                                                            |

## Drift

**None** — Notification Delivery is not Email SoR. Realtime remains SSE-only. RR-001 was compile/format/assert remediation only.

## Verdict

**PASS**
