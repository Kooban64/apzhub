# Owner Authorisation — APZ-SUPPORT-NATIVE-001-N02

| Field        | Value                          |
| ------------ | ------------------------------ |
| Slice        | **APZ-SUPPORT-NATIVE-001-N02** |
| Title        | Identity Convergence           |
| Status       | **AUTHORISED**                 |
| Timestamp    | 20260805T043000Z               |
| Prerequisite | N-01 COMPLETE                  |
| Pattern      | Same as TIME-NATIVE-001-A02    |

## Authorised outcomes

1. APZHUB Authentication consumption (existing session)
2. APZHUB Session Propagation into Support UI
3. APZHUB RBAC / Permission Mapping for Support
4. Remove hardcoded `support.*` UI default (**G-20**)
5. Wire session into Support product permissions (**G-21**)
6. Close G-25 / G-26 permission soft-open / coverage gaps
7. No engine identities, roles, or second login
8. No architecture changes; no N-03 workspace redesign

## Explicitly out of scope

- Shared platform permission abstraction (record pattern only)
- Playbook redesign
- N-03 / N-04
- APZ Projects / APZ Documents
- Engine SSO / engine role exposure
