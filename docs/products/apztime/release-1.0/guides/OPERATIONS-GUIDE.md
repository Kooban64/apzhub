# APZ Time — Operations Guide (v1.0)

## Health / failure modes

| Symptom                    | Action                                                                                 |
| -------------------------- | -------------------------------------------------------------------------------------- |
| Time API 503 / unavailable | [time-adapter-unhealthy.md](../../../../operations/runbooks/time-adapter-unhealthy.md) |
| Authz denials              | Confirm `time.view` / `time.manage` / `time.admin`                                     |

## Flags

| Flag                        | Production                            |
| --------------------------- | ------------------------------------- |
| `APZHUB_TIME_ENABLED`       | Required for HTTP                     |
| `KIMAI_INTEGRATION_ENABLED` | Required in production                |
| `APZHUB_TIME_DOMAIN_MODE`   | Must not be `in_memory` in production |

## Backup

Engine SoR owns timesheet business data — follow engine backup/restore procedures. Platform never authoritative for timesheet content.
