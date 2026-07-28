# Architecture — Requirements Domain Foundation

> **Programme:** APZQEP-ENG-020A  
> **Style:** Domain-Driven Design · Clean Architecture

## Layer dependency rule

```text
presentation → application → domain
infrastructure → domain
UI (apps/web) → presentation helpers + application contracts (future)
Nothing → infrastructure (no consumers; marker only)
```

## Package layout

```text
packages/qep-requirements/
  src/domain/          # entities, value objects, service/repo interfaces, events
  src/application/     # application service interfaces
  src/infrastructure/  # not_implemented marker only
  src/presentation/    # permissions, navigation, routes
  src/shared/          # domain errors
  tests/               # contract integrity tests
```

## Shell integration

- Route helpers: `@apzhub/qep-requirements/presentation`
- Placeholder: `apps/web/components/qep/requirements-placeholder-view.tsx`
- Router: `apps/web/components/qep/qep-workspace-router.tsx`
- Workbench: `/workspace/qep` and `/workspace/qep/requirements`

## Boundary guarantees (audited)

- Domain has no ORM/HTTP/filesystem persistence imports
- No repository classes in infrastructure
- No CRUD APIs or GraphQL
- No database migrations
