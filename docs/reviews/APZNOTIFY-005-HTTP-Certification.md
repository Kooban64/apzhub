# APZNOTIFY-005 — HTTP Certification

**Result:** PASS

## Surface

All `/api/v1/notifications/*` routes delivered in APZNOTIFY-003 remain present and thin:

- Collection / detail / lifecycle (mark-read, acknowledge, dismiss, archive, restore, transition)
- Templates, preferences, categories, channels
- Recipients, references, audit
- Capabilities, health, readiness, diagnostics

## OpenAPI

| Check | Result |
| --- | --- |
| Tag `Platform Notifications` | Present |
| Spec version | **1.4.0** |
| `pnpm openapi:validate:platform` | PASS |
| Delivery paths (`/send`, `/deliver`, `/providers`, …) | Absent |

## Handler wiring

Handlers call `getPlatformServiceGateway().notification.*` only — no core/persistence imports.
