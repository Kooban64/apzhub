# Engine Leakage Report — APZ-KNOWLEDGE-NATIVE-001-N01

| Field     | Value            |
| --------- | ---------------- |
| Slice     | N-01             |
| Status    | **COMPLETE**     |
| Timestamp | 20260806T071500Z |

## Third-party / OSS engine brands (Knowledge product)

| Brand / system                    | As APZ Knowledge product identity? |
| --------------------------------- | ---------------------------------- |
| Metabase                          | **No**                             |
| OpenProject / Plane               | **No**                             |
| Zammad                            | **No**                             |
| Authentik                         | **No**                             |
| Kimai                             | **No**                             |
| n8n                               | **No**                             |
| Dedicated Knowledge/RAG vendor UI | **No**                             |

**Result (brands):** **NONE** (compliant).

## Implementation / capability identity (not OSS brands)

| Leak / collision                            | Location                                                         | Severity                                                     |
| ------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------ |
| “Knowledge” = Knowledge Discovery Framework | `packages/knowledge-discovery-framework`, hydration, diagnostics | **High** — capability naming collision with product identity |
| Knowledge Overlay                           | `packages/workspace/src/knowledge-overlay`                       | **High** — discovery UI could be mistaken for APZ Knowledge  |
| QEP “Knowledge and Learning”                | `modules/qep-knowledge` stub                                     | **High** — vocabulary collision                              |
| KnowledgeDiscoveryDiagnostics               | apps/web · law-platform                                          | Low–Medium — ops/diagnostics; not product home if gated      |

These are **not** third-party engine brands. They are **identity leakage risks** where platform/QEP “knowledge” language can eclipse Organisational Memory.

## Result

**NONE** for third-party engine brand leakage.  
**GAPS IDENTIFIED** for capability-naming collision (carried as K-G02, K-G06, K-G07, K-G20 — identity convergence, not engine scrub alone).

| Gap                           | Feeds                            |
| ----------------------------- | -------------------------------- |
| K-G02 / K-G06 / K-G07 / K-G20 | N-02 vocabulary / product naming |
