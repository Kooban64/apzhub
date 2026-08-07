# Owner Authorisation — APZ-WORKFLOW-NATIVE-001-N02

| Field        | Value                                                                                          |
| ------------ | ---------------------------------------------------------------------------------------------- |
| Slice        | **APZ-WORKFLOW-NATIVE-001-N02**                                                                |
| Title        | APZHUB Identity Convergence                                                                    |
| Status       | **AUTHORISED / COMPLETE**                                                                      |
| Timestamp    | 20260805T164500Z                                                                               |
| Prerequisite | N-01 COMPLETE · Intent Principle IN FORCE · Business Process Language IN FORCE                 |
| Pattern      | TIME / SUPPORT / PROJECTS / DOCUMENTS N-02                                                     |
| Board        | [../PRODUCT-BOARD-BUSINESS-PROCESS-LANGUAGE.md](../PRODUCT-BOARD-BUSINESS-PROCESS-LANGUAGE.md) |

## Authorised outcomes

1. APZHUB Authentication consumption for Workflow UI
2. APZHUB Session Propagation into Workflow UI (all product planes)
3. APZHUB RBAC / Permission Mapping for Workflow
4. Wire session into Workflow product permissions (**G-12**, **G-13**)
5. Gate engine / diagnostics / health / capabilities / runs / schedules from default identity (**execution vocabulary below boundary**)
6. Register / grant business-process `workflow.*` keys in platform authorization catalog (Tenant Member without engine/admin)
7. No engine identities, roles, or second login
8. Every identity decision reinforces business-process language
9. No architecture changes; no N-03 chrome redesign / journey catalogue

## Product-specific design objective (not a Playbook change)

> Identity must remove **execution vocabulary** from the default product experience.  
> Users compose business outcomes. The platform determines execution.

## Explicitly out of scope

- Full Activity Bar consolidation / chrome rename (N-03)
- Business journey catalogue UX (N-03)
- Backbone attach wiring across RI products
- Playbook redesign · Lane 1 platform changes · architecture changes
