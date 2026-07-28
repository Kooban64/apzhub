# Supported Events — Platform-1.3-ENG-003

## Wire events (Workbench)

| Wire event                        | Bus source                                                   | Notes                                  |
| --------------------------------- | ------------------------------------------------------------ | -------------------------------------- |
| `support.ticket.created`          | `support.request.created`                                    |                                        |
| `support.ticket.assigned`         | `support.request.assigned`                                   |                                        |
| `support.ticket.updated`          | `support.request.updated`                                    | Always                                 |
| `support.ticket.status_changed`   | `support.request.updated`                                    | When `status` present                  |
| `support.ticket.comment_added`    | `support.article.created`                                    | Non-attachment article types           |
| `support.ticket.attachment_added` | `support.article.created`                                    | attachment/file types                  |
| `support.ticket.sla_warning`      | `support.request.sla_warning` / `support.ticket.sla_warning` | Mapping ready; **no Phase A producer** |
| `support.ticket.resolved`         | `support.request.closed`                                     | Soft-close / resolved                  |

## Envelope

SSE `data` JSON includes: `supportRequestId`, `tenantId`, optional status/priority/assignee/title/article fields, `correlationId`, `sourceEventId`.

## Control events

| Event                 | Purpose                   |
| --------------------- | ------------------------- |
| `realtime.ready`      | Connection established    |
| SSE comment heartbeat | Keep-alive (`: hb <iso>`) |
