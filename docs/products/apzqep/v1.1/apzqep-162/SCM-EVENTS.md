# SCM Events — APZQEP-162

All events follow past-tense `platform.scm.*` naming and the existing APZQEP event envelope conventions (correlation id, tenant, provider).

| Event type                           | When                           |
| ------------------------------------ | ------------------------------ |
| `platform.scm.provider.registered`   | Bootstrap registry             |
| `platform.scm.provider.connected`    | Successful connect             |
| `platform.scm.provider.disconnected` | Disconnect (contract reserved) |
| `platform.scm.repository.registered` | First registration             |
| `platform.scm.repository.updated`    | Metadata / state / sync update |
| `platform.scm.commit.received`       | Push webhook                   |
| `platform.scm.pull_request.opened`   | PR opened                      |
| `platform.scm.pull_request.updated`  | PR updated                     |
| `platform.scm.pull_request.closed`   | PR closed                      |
| `platform.scm.branch.created`        | Create ref (non-tag)           |
| `platform.scm.branch.deleted`        | Delete ref                     |
| `platform.scm.tag.created`           | Create tag                     |
| `platform.scm.release.published`     | Release webhook                |
| `platform.scm.webhook.received`      | Accepted delivery              |
| `platform.scm.webhook.failed`        | Signature / validation failure |
| `platform.scm.authentication.failed` | Connect auth failure           |

## Consumers

Automation, Evidence, QKI, Notifications, and Reporting attach via `publishEvent` / `onScmEvent` hooks. Modules do not implement parallel notification or search pipelines.
