# Realtime and Notification Certification

## Realtime (ADR-0072)

| Check                                        | Result |
| -------------------------------------------- | ------ |
| SSE only                                     | PASS   |
| REST authoritative for mutations             | PASS   |
| No WebSockets                                | PASS   |
| No raw engine events to clients              | PASS   |
| Wire mapping via RealtimeSubscriptionService | PASS   |

## Notification Delivery (ADR-0071)

| Check                      | Result                                        |
| -------------------------- | --------------------------------------------- |
| Not Email SoR              | PASS                                          |
| Provider abstraction       | PASS (`in_app`)                               |
| In-app delivery Phase A    | PASS (design/tests); **Workbench build FAIL** |
| SMTP deferred              | PASS                                          |
| No mailbox / inbound email | PASS                                          |
