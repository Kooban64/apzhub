# Compatibility Assessment

| Surface                    | Result                                |
| -------------------------- | ------------------------------------- |
| Process-local Maps service | Retained; yields when durable flag ON |
| ENG-004 in-app behaviour   | Preserved via `dispatchInAppChannel`  |
| Public delivery statuses   | Unchanged                             |
| Feature flag default       | OFF                                   |
| Integration SDK 1.0.0      | Untouched                             |
| OpenAPI                    | No API surface change in P3           |

Narrow compatibility change: process-local worker/queue no-ops when durable flag ON (single-runtime rule).
