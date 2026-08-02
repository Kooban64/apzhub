# KNOWN-LIMITATIONS — APZQEP Version 1.0 Candidate

| ID     | Limitation                                           | Impact                              | Classification                                          |
| ------ | ---------------------------------------------------- | ----------------------------------- | ------------------------------------------------------- |
| KL-001 | Caps A–F SoR/metadata are process-local IN-MEMORY    | Data lost on restart; not HA        | Release Blocker (unrestricted) / Deferred SoR programme |
| KL-002 | HTTP Cap permission elevation (LIMITED_AVAILABILITY) | Not least-privilege production RBAC | Release Blocker (unrestricted)                          |
| KL-003 | Cap F system-reporting actor for Cap E coverage      | Authz bypass on aggregation path    | High                                                    |
| KL-004 | Dual ENG vs Core QE UI/API surfaces                  | Operator confusion risk             | Medium                                                  |
| KL-005 | Cap A–F packages versioned 0.1.0                     | Promotion readiness incomplete      | High / packaging                                        |
| KL-006 | No Cap facets on `/api/health`                       | Weaker ops signal                   | Medium                                                  |
| KL-007 | External notify/storage/ALM/CI adapters absent       | Expected for LA                     | Deferred / Enhancement                                  |
| KL-008 | AI / QI absent                                       | Expected                            | Deferred / Enhancement                                  |
| KL-009 | Browser performance / concurrency not load-tested    | Unknown at scale                    | Medium (measurement gap)                                |
