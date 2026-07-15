# ADR-0043: Platform Personalisation Framework (M8-04)

## Status

Accepted — implemented M8-04 (User Preferences Phase 1).

## Context

Document 023 defines user preferences as a core platform capability. Workbench session state was previously client-only (`localStorage`). Products must not duplicate preference systems.

## Decision

1. Introduce `@apzhub/platform-personalisation` with `PersonalisationService` and repository layer (memory + PostgreSQL).
2. Persist preferences, favorites, recent items, and workbench layout in platform PostgreSQL (`0013` migration).
3. Expose versioned platform APIs under `/api/platform/v1/`.
4. Integrate Workbench via `SessionStore` bridge and theme hydration component.
5. Provide Operations Console UX for preference management.

## Consequences

- Theme and workbench layout survive sessions and devices when database is configured.
- Law Platform and Trust Accounting inherit personalisation via shared shell pattern.
- Feature flags and governance remain separate (M8-05+).

## Alternatives considered

- Product-local preference stores — rejected (violates 023).
- Extending authorization tables — rejected (wrong concern boundary).
