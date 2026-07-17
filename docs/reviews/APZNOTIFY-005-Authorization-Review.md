# APZNOTIFY-005 — Authorization Review

**Result:** PASS — production authorization; no allow-all

## Permissions catalogue

| Permission | Use |
| --- | --- |
| `notification.read` | List/read notifications, categories, channels, recipients, references, diagnostics |
| `notification.manage` | Create/update/archive/restore/transition lifecycle |
| `notification.template` | Template catalogue mutations |
| `notification.preference` | Preference read/update |
| `notification.audit` | Audit timeline |
| `notification.delivery` | Reserved / unwired (no delivery plane) |

## Mapping

`notificationPlatformOps` in `operation-authorization-map.ts` binds every public gateway op to a `notification.*` permission. RequestPipeline evaluates authorization before Platform Service execution.

## Expected outcomes (certified by APZNOTIFY-002 suites + map review)

| Scenario | Outcome |
| --- | --- |
| Anonymous | Denied |
| Missing permission | Denied |
| Authorised principal | Succeeds |
| Tenant / organisation scope | Enforced via RequestPipeline context (platform pattern) |

## Non-bypass

Workbench permission gating is presentation-only. Server remains authoritative. No UI-only authorization.
