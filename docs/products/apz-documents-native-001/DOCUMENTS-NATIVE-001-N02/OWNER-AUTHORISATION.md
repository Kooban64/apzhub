# Owner Authorisation — APZ-DOCUMENTS-NATIVE-001-N02

| Field        | Value                                                                                    |
| ------------ | ---------------------------------------------------------------------------------------- |
| Slice        | **APZ-DOCUMENTS-NATIVE-001-N02**                                                         |
| Title        | APZHUB Identity Convergence                                                              |
| Status       | **AUTHORISED**                                                                           |
| Timestamp    | 20260805T142500Z                                                                         |
| Prerequisite | N-01 COMPLETE                                                                            |
| Pattern      | TIME / SUPPORT / PROJECTS N-02                                                           |
| Board        | [../PRODUCT-BOARD-WORK-CONTEXT-PRINCIPLE.md](../PRODUCT-BOARD-WORK-CONTEXT-PRINCIPLE.md) |

## Authorised outcomes

1. APZHUB Authentication consumption for Documents UI
2. APZHUB Session Propagation into Documents UI
3. APZHUB RBAC / Permission Mapping for Documents
4. Wire session into Documents product permissions (**G-19**, **G-20**)
5. Gate Diagnostics (and equivalent operator surfaces) from session grants
6. Register / grant `document.*` in platform authorization catalog
7. No engine identities, roles, or second login
8. Every identity decision reinforces work-first philosophy
9. No architecture changes; no N-03 workspace / attach / repository redesign

## Additional Product Board objective

Identity remains the primary slice. Additionally:

> Ensure every identity decision reinforces: **Documents exist to support work. Work does not exist to organise documents.**

## Explicitly out of scope

- Document relationships, attach-to-work UX, repository experience redesign
- Provider payload scrubbing (G-04 presentation — N-03)
- Shared platform permission abstraction
- Playbook redesign · Lane 1 platform changes
