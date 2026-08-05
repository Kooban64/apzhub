# Session Propagation — APZ-DOCUMENTS-NATIVE-001-N02

| Field     | Value                        |
| --------- | ---------------------------- |
| Slice     | APZ-DOCUMENTS-NATIVE-001-N02 |
| Status    | **COMPLETE**                 |
| Timestamp | 20260805T142500Z             |

## Propagation

| Layer  | Behaviour                                                                        |
| ------ | -------------------------------------------------------------------------------- |
| Layout | Platform layout hydrates `SessionAuthorizationProvider`                          |
| Hook   | `useDocumentsPermissions()` reads session grants; never defaults to `document.*` |
| Router | Gates product browse (`document.read`) and Diagnostics (`document.admin`)        |
| API    | `/api/v1/documents/*` already required APZHUB session via `withPlatformApiAuth`  |

## Closed gaps

| ID   | Outcome                                                      |
| ---- | ------------------------------------------------------------ |
| G-19 | Session / PermissionService consumed in Documents UI         |
| G-20 | One APZHUB identity end-to-end for Documents product surface |

## Explicitly unchanged

Attach-to-work · relationships UX · repository browse redesign · provider payload scrubbing (N-03).
