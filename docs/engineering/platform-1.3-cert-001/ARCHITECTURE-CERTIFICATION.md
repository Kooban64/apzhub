# Architecture Certification

## Layering

Presentation → Platform Services → Connector → Engine — **COMPLIANT** (no new layer introduced in Platform 1.3 train).

## Platform capabilities

| Capability                      | Verdict                            | Notes                                                              |
| ------------------------------- | ---------------------------------- | ------------------------------------------------------------------ |
| Platform Runtime / Event Bus    | COMPLIANT                          | Additive consumers only                                            |
| Request Pipeline                | COMPLIANT                          | Gateway handlers use withPlatformApiAuth                           |
| ProductionAuthorizationProvider | COMPLIANT                          | Deny-by-default retained                                           |
| Gateway                         | COMPLIANT                          | Additive REST/SSE routes                                           |
| Workbench                       | COMPLIANT                          | Shell + product surfaces                                           |
| Identity                        | COMPLIANT                          | Recipient resolution authority                                     |
| Platform Services               | COMPLIANT                          | Additive Observe / Realtime / Notification Delivery                |
| Integration SDK 1.0.0           | **FROZEN** (package version 1.0.0) | Wave certify script failed on CURRENT-MILESTONE wording drift only |

## Drift

No architectural redesign of ADR-0070/0071/0072 detected. Notification Delivery is not Email SoR. Realtime remains SSE-only.
