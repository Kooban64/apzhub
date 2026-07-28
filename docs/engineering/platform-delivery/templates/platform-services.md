# {CAPABILITY} — Platform Services

> **Programme:** {PROGRAMME_ID}  
> **Lifecycle phase:** Platform Services  
> **Standard:** [Platform Delivery Standard](../PLATFORM-DELIVERY-STANDARD.md)

## Purpose

Implement business logic and AuthZ for {CAPABILITY} on Platform Services.

## Manifest

- `service.yaml` path: …
- Registry status: …

## Gateway surface

| Facet                    | Operations | AuthZ |
| ------------------------ | ---------- | ----- |
| `gateway.{capability}.*` |            |       |

## Orchestration

- Integrations used: …
- Via Integration SDK only: yes / no

## Events (if any)

| Event | Manifest     | Publisher        |
| ----- | ------------ | ---------------- |
|       | `event.yaml` | Platform Service |

## Single recommendation

**SERVICES READY**

## Exit checklist

- [ ] `service.yaml` first
- [ ] AuthZ operation map complete
- [ ] No UI / HTTP in this programme
- [ ] Unit/service tests PASS
- [ ] Docs under `docs/platform/{capability}/`
- [ ] Completion + Acceptance reports
