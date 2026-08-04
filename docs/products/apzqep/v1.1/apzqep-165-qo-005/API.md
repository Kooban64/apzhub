# API — QO-005

SDK surface: `createPlatformOrchestration().impact`

| API                                  | Purpose                           |
| ------------------------------------ | --------------------------------- |
| registerAsset / registerRelationship | Knowledge base                    |
| createCorrelation                    | Correlate a normalized change     |
| getCorrelation / listCorrelations    | Retrieve results                  |
| getImpactGraph                       | Graph query                       |
| getConfidence / getRisk              | Assessments                       |
| getExplainability                    | Explanation records               |
| getRecommendedScope                  | Advisory scope                    |
| getHistory                           | Append-only history               |
| discoverCorrelationCapabilities      | QO-002 catalogue read (no invoke) |
| diagnostics / health                 | Diagnostics                       |

No execution endpoints. Does not start Quality Flows or evaluate policies.
