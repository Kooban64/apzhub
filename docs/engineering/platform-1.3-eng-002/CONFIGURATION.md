# Configuration

| Key                                       | Default              | Allowed                               | Production                                       |
| ----------------------------------------- | -------------------- | ------------------------------------- | ------------------------------------------------ |
| `APZHUB_OBSERVE_ALERT_EVALUATION_ENABLED` | unset = **disabled** | `true`/`1`/`on` enable; else disabled | Enable only after rule inventory + ops readiness |

Invalid/missing values **never** silently activate evaluation.
