# APZHUB Identity Administration Domain Model

**Milestone:** APZIDENTITY-001

Canonical entities (metadata only):

| Entity                                        | Purpose                                                                    |
| --------------------------------------------- | -------------------------------------------------------------------------- |
| `IdentityUser`                                | User profile metadata; optional `authSubjectRef` to Authentication subject |
| `IdentityGroup`                               | Group catalogue                                                            |
| `IdentityRole`                                | Role catalogue                                                             |
| `IdentityPermissionAssignment`                | Permission key assignment metadata                                         |
| `IdentityOrganization`                        | Organisation metadata                                                      |
| `IdentityTenant`                              | IAM tenant metadata (distinct from auth `platform_tenant`)                 |
| `IdentityDepartment`                          | Department under organisation                                              |
| `IdentityPosition`                            | Position catalogue                                                         |
| `IdentityEmployment`                          | User employment linkage                                                    |
| `IdentityServiceAssignment`                   | Capability access metadata (no provisioning)                               |
| `IdentityMembership`                          | User membership in group/org/tenant/department                             |
| `IdentityInvitation`                          | Invitation metadata                                                        |
| `IdentityActivation` / `IdentityDeactivation` | Activation lifecycle records                                               |
| `IdentityStatus`                              | Status snapshot metadata                                                   |
| `IdentityPolicy`                              | Administrative identity policy metadata                                    |
| `IdentityAuditEntry`                          | Append-only audit                                                          |
| `IdentityHistory`                             | History summaries                                                          |
| `IdentityReference`                           | Cross-references                                                           |
| `IdentityMetadata`                            | Extensible key/value notes (no secrets)                                    |

See package `@apzhub/identity-contracts` for TypeScript definitions.
