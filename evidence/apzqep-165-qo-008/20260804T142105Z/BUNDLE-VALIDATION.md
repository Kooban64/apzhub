# Bundle Validation — APZQEP-165-QO-008

Timestamp: 20260804T142105Z

| Check                                              | Result |
| -------------------------------------------------- | ------ |
| Immutable template snapshot into bundle            | PASS   |
| Opaque governanceDecisionRef / qualityFlowRef only | PASS   |
| Append-only decisions                              | PASS   |
| Final status derived from decisions + SoD          | PASS   |
| Bundle does not encode subject semantics           | PASS   |

Covered by `approval.test.ts` create/decide/explainability cases.
