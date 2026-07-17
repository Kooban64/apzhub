# Observability Forms and Validation Guide

**Milestone:** APZOBSERVE-004

## Approach

Facet create/update uses typed defaults from each `FacetConfig.createDefaults` and the Observability typed-client request shapes. Field inputs are constrained to known metadata keys — **no unrestricted JSON editor** and **no secret/provider credential fields**.

## Validation layers

1. **Client field presence** — draft keys from create defaults
2. **Server / Core rules** — authoritative (APZOBSERVE-001/002); Workbench does not duplicate business rules
3. **Typed-client errors** — `ObserveClientError` → `toObserveUserMessage` for validation, conflict, forbidden, unavailable

## UX

- Pending: Create / Save buttons disabled while mutations are pending
- Success: `data-testid="observability-status"`
- Failure: `data-testid="observability-action-error"` (`role="alert"`)
- Cancellation: navigate away / leave draft unsaved (no destructive auto-save)

## Excluded

- Provider credential editors
- PromQL / LogQL authors
- Threshold evaluation forms
- Alert delivery configuration

See also: [Authorization-Aware UI Guide](./APZHUB-Observability-Authorization-Aware-UI-Guide.md).
