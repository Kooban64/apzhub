# ADR-0004 — Platform Registry First Architecture

> **Status:** Accepted  
> **Date:** 2026-06-29  
> **Sprint:** SPR-001 closeout

## Problem

APZHUB modules, integrations, services, and UI components must be discoverable, permission-aware, and replaceable. Ad-hoc imports and hardcoded navigation create coupling that violates Documents 003, 008, and 024.

## Decision

Adopt a **registry-first architecture** where all extensibility points register through manifests and Platform SDK contracts before runtime use:

| Layer         | Manifest           | Registry (future)    |
| ------------- | ------------------ | -------------------- |
| Modules       | `module.yaml`      | Module Registry      |
| Integrations  | `integration.yaml` | Integration Registry |
| Services      | `service.yaml`     | Service Registry     |
| UI components | `component.yaml`   | Component Registry   |
| Events        | `event.yaml`       | Event Bus            |

SPR-001 delivers stubs (`@apzhub/sdk`, `component.yaml` files, placeholder directories). **No business modules** register until the first module sprint.

Static Desktop Shell navigation in SPR-001 is an acknowledged temporary scaffold.

## Alternatives

| Alternative                              | Why rejected                                    |
| ---------------------------------------- | ----------------------------------------------- |
| Direct imports between apps and modules  | Violates replaceability and permission model    |
| Runtime plugin loading without manifests | No Cursor/contributor contract; hard to audit   |
| Micro-frontends per module               | Premature; conflicts with unified Desktop Shell |

## Consequences

- First module sprint begins with `module.yaml` and registry wiring.
- Shell navigation, command palette, and search consume registries — not hardcoded lists.
- `@apzhub/sdk` `registerModule` throws until registry implementation lands.
