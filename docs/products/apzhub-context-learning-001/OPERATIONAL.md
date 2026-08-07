# Operational — Enterprise Context Product Learning

| Field              | Value                                        |
| ------------------ | -------------------------------------------- |
| Programme          | APZHUB-CONTEXT-LEARNING-001                  |
| Events API         | `POST /api/v1/context/learning/events`       |
| Summary API        | `GET /api/v1/context/learning/summary`       |
| Product Board view | `/workspace/administration/product-learning` |

## Events captured

| Event                     | Meaning                                         |
| ------------------------- | ----------------------------------------------- |
| `context.panel_opened`    | Panel visible                                   |
| `context.panel_collapsed` | Panel hidden / unmounted (+ `visibleMs`)        |
| `context.section_viewed`  | Section entered viewport                        |
| `context.link_followed`   | User followed attributed context link           |
| `context.feedback`        | Helpful / Not helpful (+ optional comment ≤280) |
| `context.load_timed`      | Composition load + missing provider count       |

## Privacy

Never stored: document contents, project contents, user ids, entity titles from SoR payloads.  
Optional feedback comment is truncated and optional.

## Product Board use

After several weeks of pilot usage, answer:

1. Which context users consume
2. Which context users ignore
3. Whether navigation is reduced (link follow-through)
4. Whether users believe it helps

Only then consider CONTEXT-002.
