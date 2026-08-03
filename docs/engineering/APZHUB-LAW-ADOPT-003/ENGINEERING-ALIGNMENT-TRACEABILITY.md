# ENGINEERING-ALIGNMENT-TRACEABILITY

| Field     | Value                |
| --------- | -------------------- |
| Programme | APZHUB-LAW-ADOPT-003 |
| Timestamp | 20260803T132559Z     |

## Matrix (backlog → artefact → tests → evidence)

| EAB    | Spec / face                | Implementation                                                       | Tests                                                                                                                            | Evidence                                          |
| ------ | -------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| EAB-01 | Discovery + Implementation | `events/legal/**/event.yaml`                                         | `testing/apzqep-law-adopt-003/legal-event-manifests.test.ts` · `apps/law-platform/lib/register-law-events.test.ts`               | `evidence/apzhub-law-adopt-003/20260803T132559Z/` |
| EAB-02 | Discovery + Implementation | `services/legal-platform/service.yaml` metadata                      | Manifest parse (service.yaml validates)                                                                                          | same                                              |
| EAB-03 | Discovery + Implementation | `docs/specs/LAW-OpenAPI-v1.yaml` honesty                             | `testing/apzqep-law-adopt-003/openapi-honesty.test.ts`                                                                           | same                                              |
| EAB-04 | Discovery + KL faces       | Verified `tenant-resolver.ts` (no logic change) · KL-LAW-05 narrowed | `testing/apzqep-law-adopt-003/tenant-resolution-eab04.test.ts` · `apps/web/lib/api/law-api-auth.test.ts` (`resolveLawApiTenant`) | same                                              |
| EAB-05 | Discovery (INVALID)        | None                                                                 | N/A                                                                                                                              | Board review note in Discovery                    |
| EAB-06 | Discovery (docs only)      | Completion / Implementation records                                  | N/A                                                                                                                              | same                                              |

## Permanent adoption rule (recorded for Board / portfolio — not applied as governance edit)

> Every enterprise adoption engineering programme must be traceability-driven. No code change may be made unless it can be traced to an approved assessment gap, Product Board decision, or authorised backlog item.

Filed in this pack: [ADOPTION-TRACEABILITY-RULE.md](./ADOPTION-TRACEABILITY-RULE.md). Enterprise governance documents were **not** modified (PROHIBITED).
