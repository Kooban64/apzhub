# Wave 1 Usage Report — APZQEP-161-OE

| Field     | Value                                                              |
| --------- | ------------------------------------------------------------------ |
| Programme | APZQEP-161-OE                                                      |
| Timestamp | 20260803T164801Z                                                   |
| Host      | https://apzhub.apzportal.apzor.com (+ localhost:3300 coexistence)  |
| Evidence  | `evidence/apzqep-161-oe/20260803T164801Z/usage/USAGE-SUMMARY.json` |

## Metric classes

| Class                | Meaning                                          |
| -------------------- | ------------------------------------------------ |
| **Observed**         | Captured from live platform calls this programme |
| **Estimated**        | Not used in this report                          |
| **Not yet measured** | Explicitly marked below                          |

## Runtime (Observed)

| Signal            | Value           |
| ----------------- | --------------- |
| `/api/health`     | healthy         |
| `platformReady`   | true            |
| `capabilityCount` | 340             |
| Public health     | healthy / ready |

## Auth (Observed)

| Scenario                                             | Result                  |
| ---------------------------------------------------- | ----------------------- |
| Local sign-in (`localhost` origin)                   | PASS                    |
| Public origin sign-in (`apzhub.apzportal.apzor.com`) | PASS (after OE-001 fix) |

## Automation scenarios (Observed)

| Scenario                                      | Result    | Notes                                                    |
| --------------------------------------------- | --------- | -------------------------------------------------------- |
| List providers                                | PASS      | 1 active (playwright), 7 placeholders                    |
| Run Playwright dry-run                        | PASS      | execution `acadf351-…` → **completed**                   |
| Review evidence refs                          | PASS      | 7 `evidence://automation/...` refs                       |
| Artifact kinds                                | PASS      | console, log, metadata, screenshot, timing, trace, video |
| Placeholder failure                           | PASS      | selenium → AUTOMATION_ERROR                              |
| Re-run / history                              | PASS      | historyCount = 2                                         |
| Workspace pages (automation, providers, home) | PASS      | HTTP 200 authenticated                                   |
| Export reports                                | NOT READY | Wave 1 residual                                          |
| QKI projections UI                            | PARTIAL   | hooks exist; not yet measured end-to-end in UI           |
| Notifications delivery                        | PARTIAL   | not yet measured                                         |
| Command palette automation actions            | PARTIAL   | not yet measured                                         |

## Internal validation verdict

**PASS** — representative Wave 1 automation workflows succeed for authenticated internal users on the coexistence host.

## Not yet measured

- Multi-user concurrent load
- Live browser (`APZHUB_AUTOMATION_LIVE`) duration / flakiness
- Long-lived durable history across restarts
- Stakeholder demo rehearsal with non-engineering audience
