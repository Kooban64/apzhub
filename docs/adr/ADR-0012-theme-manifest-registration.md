# ADR-0012 — Theme Manifest Registration

> **Status:** Accepted  
> **Date:** 2026-06-30  
> **Sprint:** SPR-002  
> **Decided by:** Project owner (Sprint 002 implementation approval)

## Problem

Built-in light/dark themes could be registered programmatically in bootstrap code. That bypasses manifest-first discovery and violates ADR-0004 registry-first architecture.

## Decision

Themes are **manifest-driven**. Each theme requires a **`theme.yaml`** file discovered by the registry.

### Location

```text
packages/theme/themes/<theme-id>/theme.yaml
```

### Initial themes (SPR-002)

| Theme ID       | File                                            |
| -------------- | ----------------------------------------------- |
| `apzhub-light` | `packages/theme/themes/apzhub-light/theme.yaml` |
| `apzhub-dark`  | `packages/theme/themes/apzhub-dark/theme.yaml`  |

### Rules

- No hardcoded theme registration in TypeScript bootstrap
- Theme tokens may still live in `packages/theme/src/tokens.css`; manifest references token set path
- `Registry.getThemes()` returns discovered theme manifests only

## Alternatives

| Alternative                    | Why rejected                             |
| ------------------------------ | ---------------------------------------- |
| Programmatic registration      | Owner decision; not discoverable         |
| Single combined theme manifest | Loses per-theme lifecycle and versioning |

## Consequences

- Phase 7 creates `theme.yaml` for light and dark
- Presentation engine (022) Theme Registry consumes `Registry.getThemes()` in future sprint
- `@apzhub/theme` package owns theme files and manifests
