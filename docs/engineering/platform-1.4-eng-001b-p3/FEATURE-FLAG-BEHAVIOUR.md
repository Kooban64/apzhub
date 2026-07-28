# Feature Flag Behaviour

| Flag                                  | Default | Behaviour                                       |
| ------------------------------------- | ------- | ----------------------------------------------- |
| `APZHUB_NOTIFICATION_DURABLE_RUNTIME` | **OFF** | Process-local active; durable store/worker null |

When **ON** (test/dev only):

- Bootstrap `mode=postgresql_durable`
- Durable worker may claim + dispatch
- Process-local `startWorker` / `processQueue` return without processing

Production examples must not enable the flag. Default remains OFF.
