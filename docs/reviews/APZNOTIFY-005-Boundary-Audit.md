# APZNOTIFY-005 — Boundary Audit

**Result:** PASS

## Layer boundaries

| From              | To                                               | Allowed?        |
| ----------------- | ------------------------------------------------ | --------------- |
| Workbench         | Typed client facades                             | Yes             |
| Workbench         | Gateway / platform-services / core / persistence | No              |
| Typed client      | `/api/v1/notifications/*`                        | Yes             |
| Typed client      | Gateway / core / persistence                     | No              |
| HTTP handlers     | `gateway.notification.*`                         | Yes             |
| HTTP handlers     | Core / persistence packages                      | No              |
| Platform services | Core + persistence ports                         | Yes             |
| Core              | Persistence package import                       | No (ports only) |
| Persistence       | Platform services / HTTP                         | No              |

## Bypass checks

- No Gateway bypass from Workbench or client
- No Platform Service bypass from HTTP
- No Core bypass from services (thin services confirmed in 002)
- No persistence bypass from HTTP/UI

## Delivery boundary

Send/deliver/provider/worker/queue/schedule/realtime surfaces absent at every layer (routes, OpenAPI, client, Workbench).
