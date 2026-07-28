# Product Certification

| Product / Capability  | Ownership                          | Boundary                             | Contracts          | Docs     |
| --------------------- | ---------------------------------- | ------------------------------------ | ------------------ | -------- |
| Observe               | Observe SoR + ENG-002 evaluation   | Delivery via hook/Notification       | ADR-0070           | Complete |
| Support               | Support SoR                        | Realtime presentation only           | ADR-0072 / ENG-003 | Complete |
| Notification Delivery | APZNOTIFY + ENG-004 delivery plane | Provider abstraction; in-app Phase A | ADR-0071           | Complete |
| Realtime              | RealtimeSubscriptionService        | SSE only; REST authoritative         | ADR-0072           | Complete |
| Search                | Search Platform Services           | Live drain ENG-001                   | Existing           | Complete |
| Workbench             | Shell + modules                    | No engine calls                      | Existing           | Complete |
| Administration        | Admin Platform Services            | Permission-gated                     | Existing           | Complete |
| Configuration         | Configuration Platform Services    | Deny-by-default flags                | Existing           | Complete |
| Identity              | Identity Platform Services         | Tenant/org authority                 | Existing           | Complete |
