# Known Limitations — Platform-1.3-ENG-003

| ID          | Limitation                                                      | Status                      |
| ----------- | --------------------------------------------------------------- | --------------------------- |
| ENG003-R-01 | SLA warning wire mapping exists; **no bus producer** in Phase A | Residual                    |
| ENG003-R-02 | `lastEventId` accepted but no durable replay buffer             | Residual                    |
| ENG003-R-03 | Attachment **delete** realtime still out of scope               | Residual (PL12-KL-05 slice) |
| ENG003-R-04 | SSE disabled by default until ops enables flag                  | By design                   |
| ENG003-R-05 | Observe / other products have no realtime stream                | Out of scope                |

## PL12-KL-05

**PARTIALLY REMEDIATED** — Support realtime SUP-03 (SSE) delivered; attachment delete residual remains.
