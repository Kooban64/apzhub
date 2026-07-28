# Ordering Model

**Not guaranteed globally.**

| Scope                 | Expectation                                     |
| --------------------- | ----------------------------------------------- |
| Global                | No global order                                 |
| Per delivery          | Attempts ordered by attempt_number              |
| Per recipient/channel | Best effort; no strict cross-notification order |
| Per tenant            | No tenant-wide order guarantee                  |

Claim order is generally `next_attempt_at ASC, created_at ASC` — best effort under concurrency.
