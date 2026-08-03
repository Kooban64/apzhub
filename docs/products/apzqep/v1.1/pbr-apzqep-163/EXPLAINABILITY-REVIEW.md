# EXPLAINABILITY-REVIEW — PBR-APZQEP-163

| Field      | Value            |
| ---------- | ---------------- |
| Resolution | PBR-APZQEP-163   |
| Timestamp  | 20260803T185717Z |
| Result     | **PASS**         |

## Mandatory explanation fields

| Field                   | Present on `Explanation`                | Linked from recommendation                     |
| ----------------------- | --------------------------------------- | ---------------------------------------------- |
| Reason                  | Yes (`reason`)                          | Via recommendation.reason + explanation.reason |
| Supporting observations | Yes (`contributingObservationIds`)      | Also `recommendation.observationIds`           |
| Supporting evidence     | Yes (`evidenceRefs`)                    | Also `recommendation.evidenceRefs`             |
| Confidence              | Yes (`confidence`)                      | Also `recommendation.confidence`               |
| Provider identity       | Yes (`providerId`)                      | Also `recommendation.providerId`               |
| Decision path           | Yes (`decisionPath` non-empty in tests) | Yes                                            |
| Timestamp               | Yes (`timestamp`)                       | Lifecycle timestamps on recommendation         |

## Opaque recommendations

**None permitted / none observed.** Engine always creates explanation before saving recommendation. Unit tests assert explanation presence for all produced recommendations.
