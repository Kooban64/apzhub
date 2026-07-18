# APZHUB Platform Capability Model (M8-05)

## Capability types

| Type       | Examples                                                         |
| ---------- | ---------------------------------------------------------------- |
| `platform` | APZHUB Platform shell                                            |
| `product`  | `law-platform`                                                   |
| `module`   | `platform-administration`, `platform-operations-personalisation` |
| `service`  | Platform services (future registration)                          |

## Registry fields

- `capability_key` — stable identifier
- `capability_type` — platform | product | module | service
- `name`, `description`, `version`, `status`
- `metadata` — JSONB extension point

## Dependencies

`platform_capability_dependency`:

- `depends_on_capability_key`
- `dependency_type` — `required` | `optional`

## Enablement

`platform_governance_enablement` links scope (platform/tenant/product/module/user) to target (product/module/service/capability) with `enabled` boolean.

## Runtime bridge

Manifest-registered capabilities in `PlatformRegistry` remain the discovery source. Governance registry stores **enablement metadata** and dependencies for operations and product consumption.

## Diagnostics

`GET /api/platform/v1/capabilities` returns capabilities, dependencies, enablements, and `consumedCapabilities`.
