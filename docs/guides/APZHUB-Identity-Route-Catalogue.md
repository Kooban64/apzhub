# APZHUB Identity Route Catalogue

**Milestone:** APZIDENTITY-003  
**OpenAPI:** Platform Identity Administration (spec **1.7.0+**)

| Method    | Path                                                  | Gateway                             |
| --------- | ----------------------------------------------------- | ----------------------------------- |
| GET/POST  | `/api/v1/identity/users`                              | `identity.users.list/create`        |
| GET/PATCH | `/api/v1/identity/users/{userId}`                     | `identity.users.get/update`         |
| GET/POST  | `/api/v1/identity/groups`                             | `identity.groups.*`                 |
| GET/PATCH | `/api/v1/identity/groups/{groupId}`                   |                                     |
| GET/POST  | `/api/v1/identity/roles`                              | `identity.roles.*`                  |
| GET/PATCH | `/api/v1/identity/roles/{roleId}`                     |                                     |
| GET/POST  | `/api/v1/identity/organisations`                      | `identity.organisations.*`          |
| GET/PATCH | `/api/v1/identity/organisations/{organisationId}`     |                                     |
| GET/POST  | `/api/v1/identity/tenants`                            | `identity.tenants.*`                |
| GET/PATCH | `/api/v1/identity/tenants/{tenantId}`                 |                                     |
| GET/POST  | `/api/v1/identity/departments`                        | `identity.departments.*`            |
| GET/PATCH | `/api/v1/identity/departments/{departmentId}`         |                                     |
| GET/POST  | `/api/v1/identity/positions`                          | `identity.positions.*`              |
| GET/PATCH | `/api/v1/identity/positions/{positionId}`             |                                     |
| GET/POST  | `/api/v1/identity/memberships`                        | `identity.memberships.*`            |
| GET/PATCH | `/api/v1/identity/memberships/{membershipId}`         |                                     |
| GET/POST  | `/api/v1/identity/service-assignments`                | `identity.serviceAssignments.*`     |
| GET/PATCH | `/api/v1/identity/service-assignments/{assignmentId}` |                                     |
| GET/POST  | `/api/v1/identity/invitations`                        | `identity.invitations.*`            |
| GET/PATCH | `/api/v1/identity/invitations/{invitationId}`         |                                     |
| GET/POST  | `/api/v1/identity/activation`                         | `identity.activation.list/create`   |
| GET       | `/api/v1/identity/activation/{activationId}`          | `identity.activation.get`           |
| GET/POST  | `/api/v1/identity/deactivation`                       | `identity.deactivation.list/create` |
| GET       | `/api/v1/identity/deactivation/{deactivationId}`      | `identity.deactivation.get`         |
| GET/POST  | `/api/v1/identity/policies`                           | `identity.policies.*`               |
| GET/PATCH | `/api/v1/identity/policies/{policyId}`                |                                     |
| GET       | `/api/v1/identity/audit`                              | `identity.audit.list`               |
| GET       | `/api/v1/identity/audit/{auditId}`                    | `identity.audit.get`                |
| GET       | `/api/v1/identity/history`                            | `identity.history.list`             |
| GET       | `/api/v1/identity/history/{historyId}`                | `identity.history.get`              |
| GET/POST  | `/api/v1/identity/references`                         | `identity.references.*`             |
| GET/PATCH | `/api/v1/identity/references/{referenceId}`           |                                     |
| GET       | `/api/v1/identity/health`                             | `identity.diagnostics.health`       |
| GET       | `/api/v1/identity/readiness`                          | `identity.diagnostics.readiness`    |
| GET       | `/api/v1/identity/capabilities`                       | `identity.diagnostics.capabilities` |
| GET       | `/api/v1/identity/management-capabilities`            | management-plane DTO                |

Never shipped: `/identity/login`, `/password`, `/oauth`, `/oidc`, `/saml`, `/scim`, `/ldap`, `/mfa`, `/sessions`, `/provisioning`, `/workbench`.
