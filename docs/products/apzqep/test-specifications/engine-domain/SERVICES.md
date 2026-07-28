# Domain Services — APZQEP-ENG-050A

Pure services — no repositories, databases, HTTP, or Platform services.

| Service                          | Responsibility                                                 |
| -------------------------------- | -------------------------------------------------------------- |
| SpecificationLifecycleService    | Terminal checks, transitions, allowed lists                    |
| SpecificationValidationService   | Create/edit structural validation                              |
| SpecificationApprovalService     | Review / approve / reject guards                               |
| SpecificationRelationshipService | Self-reference and reference presence                          |
| SpecificationVersionService      | Bump, uniqueness, authoritative helpers, latest approved label |
| SpecificationPolicyService       | Orchestrates all policies                                      |

All live in `specification-domain-service.ts`.
