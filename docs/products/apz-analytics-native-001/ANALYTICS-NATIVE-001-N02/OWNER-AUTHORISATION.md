# Owner Authorisation — APZ-ANALYTICS-NATIVE-001-N02

| Field        | Value                                                                    |
| ------------ | ------------------------------------------------------------------------ |
| Slice        | **APZ-ANALYTICS-NATIVE-001-N02**                                         |
| Title        | Identity Convergence — Questions & Decisions                             |
| Status       | **COMPLETE**                                                             |
| Timestamp    | 20260805T181500Z                                                         |
| Prerequisite | N-01 COMPLETE · Enterprise Insight IN FORCE · Decision Entry IN FORCE    |
| Pattern      | TIME / SUPPORT / PROJECTS / DOCUMENTS / WORKFLOW N-02                    |
| Board        | [../PRODUCT-BOARD-DECISION-ENTRY.md](../PRODUCT-BOARD-DECISION-ENTRY.md) |

## Classification

Identity only · Architecture **FROZEN** · Playbook **UNCHANGED** · Lane 1 **UNCHANGED**

## Authorised outcomes

1. APZHUB Authentication consumption for Analytics UI
2. APZHUB Session Propagation (no hard-coded `analytics.*`)
3. APZHUB RBAC mapping — seed `analytics.view` (+ insight keys); Tenant Member without admin/presentation asset wildcards
4. Primary Activity Bar / grants use **decision identity** (`analytics.view`, **APZ Analytics**) — not `analytics.dashboard.view` as product key
5. Gate datasets / reports / health / diagnostics from default identity (**presentation & operator below boundary**)
6. No BI engine identities or second login
7. Every identity decision reinforces Decision Entry + Decision Before Measurement
8. No N-03 question catalogue / home redesign in this slice

## Product-specific design objective (not a Playbook change)

> Identity around **questions and decisions**.  
> The first thing users should see is the question they need answered—not the dashboard that happens to contain the answer.

## Explicitly out of scope

- Full question-first home / EQ catalogue UX (N-03)
- Horizon IA redesign (N-03)
- Chart library / BI engine work
- Playbook redesign · Lane 1 · architecture changes
