# {CAPABILITY} — Workbench Module

> **Programme:** {PROGRAMME_ID}  
> **Lifecycle phase:** Workbench Module  
> **Standard:** [Platform Delivery Standard](../PLATFORM-DELIVERY-STANDARD.md)

## Purpose

Deliver presentation for {CAPABILITY} in the APZHUB Workbench.

## Surface

- Routes: `/workspace/{capability}/*`
- Distinct from (if any): …

## Manifests

| Manifest         | Path |
| ---------------- | ---- |
| `module.yaml`    |      |
| Sidebar children |      |

## Client

- Location: `apps/web/lib/{capability}/`
- Calls: `/api/v1/{capability}/*` **only**
- Must not import: gateway · integrations

## Views

| View | Route | Permission |
| ---- | ----- | ---------- |
|      |       |            |

## Tests

| Suite              | Result |
| ------------------ | ------ |
| Unit/component     |        |
| Boundary           |        |
| Playwright         |        |
| a11y (if required) |        |

## Single recommendation

**WORKBENCH READY**

## Exit checklist

- [ ] Manifests registered (not hardcoded in shell)
- [ ] Typed client HTTP-only
- [ ] Permission-driven UI
- [ ] Docs under `docs/workbench/{capability}/`
- [ ] Quality gates PASS
- [ ] Completion + Acceptance reports
