# Notification Route Catalogue (APZNOTIFY-003)

Base: `/api/v1/notifications`

| Method           | Path                                                        | Gateway                                |
| ---------------- | ----------------------------------------------------------- | -------------------------------------- |
| GET/POST         | `/`                                                         | notifications.list / create            |
| GET/PATCH/DELETE | `/{id}`                                                     | get / updateMetadata / archive         |
| POST             | `/{id}/transition`                                          | transition                             |
| POST             | `/{id}/archive`                                             | archive                                |
| POST             | `/{id}/restore`                                             | restore                                |
| POST             | `/{id}/mark-read`                                           | transition → `read`                    |
| POST             | `/{id}/acknowledge`                                         | transition → `acknowledged`            |
| POST             | `/{id}/dismiss`                                             | transition → `dismissed`               |
| GET              | `/{id}/recipients`                                          | recipients.list                        |
| GET              | `/{id}/recipients/{recipientId}`                            | recipients.get                         |
| GET              | `/{id}/references`                                          | references.list                        |
| GET              | `/{id}/audit`                                               | audit.list(scoped)                     |
| GET/POST         | `/templates`                                                | templates.list / create                |
| GET/PATCH/DELETE | `/templates/{id}`                                           | get / update / archive                 |
| POST             | `/templates/{id}/archive`                                   | archive                                |
| GET              | `/preferences`                                              | preferences.list                       |
| GET/PATCH        | `/preferences/{id}`                                         | get / update                           |
| GET              | `/categories` · `/categories/{id}`                          | categories.*                           |
| GET              | `/channels` · `/channels/{id}`                              | channels.* (+ deliveryAvailable=false) |
| GET              | `/references/{id}`                                          | references.get                         |
| GET              | `/audit` · `/audit/{id}`                                    | audit.*                                |
| GET              | `/capabilities` · `/health` · `/readiness` · `/diagnostics` | diagnostics.*                          |

## Forbidden (tests prove absent)

`/send`, `/resend`, `/deliver`, `/dispatch`, `/retry`, `/schedule`, `/cancel-delivery`, `/providers`, `/smtp`, `/sms`, `/push`, `/teams`, `/slack`, `/webhooks`, `/workers`, `/queues`, `/events`, `/stream`, `/subscribe`, `/realtime`
