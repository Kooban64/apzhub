# Failure Classification

Uses existing `NotificationFailureClass` (no public API break):

| Class                                                | Retryable?                          |
| ---------------------------------------------------- | ----------------------------------- |
| `transient_provider`                                 | Yes (via `isTransientFailureClass`) |
| `rate_limit`                                         | Yes                                 |
| `permanent_provider`                                 | No → DLQ                            |
| `configuration`                                      | No → DLQ                            |
| `template_failure`                                   | No → DLQ                            |
| `internal_processing`                                | No → DLQ                            |
| `validation` / `authorisation` / `recipient_failure` | No                                  |
| `unknown`                                            | No (safe default)                   |

Uncertain timeout maps to `transient_provider` + `UNCERTAIN_TIMEOUT`.
