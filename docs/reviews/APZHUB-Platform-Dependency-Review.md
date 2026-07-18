# APZHUB Platform Dependency Review

**Milestone:** PRH-011  
**Date:** 2026-07-09

---

## Dependency direction model

```
apps (web, law-platform)
  → platform packages (bootstrap, identity, security, operations, lifecycle, …)
    → config, auth, types
      → (must NOT import apps or products)
```

Products (`apps/law-platform`) may depend on platform packages. Platform packages must not depend on application hosts.

---

## Platform package dependency graph (summary)

| Package                            | Direct platform dependencies                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------- |
| `@apzhub/platform-runtime`         | _(none — foundation)_                                                           |
| `@apzhub/platform-bootstrap`       | runtime, identity, authorization, governance, personalisation, security, config |
| `@apzhub/platform-identity`        | config                                                                          |
| `@apzhub/platform-authorization`   | config                                                                          |
| `@apzhub/platform-personalisation` | config                                                                          |
| `@apzhub/platform-governance`      | config                                                                          |
| `@apzhub/platform-security`        | auth, config, authorization, shared                                             |
| `@apzhub/platform-operations`      | lifecycle, security, types                                                      |
| `@apzhub/platform-lifecycle`       | security                                                                        |
| `@apzhub/auth`                     | config, platform-identity                                                       |

---

## Findings

| ID      | Finding                                                      | Severity | Status                                                   |
| ------- | ------------------------------------------------------------ | -------- | -------------------------------------------------------- |
| DEP-001 | Circular lifecycle ↔ operations dependency                   | High     | **Resolved PRH-011** — removed unused dep from lifecycle |
| DEP-002 | `@apzhub/config` → `@apzhub/legal-business-core`             | Medium   | Open (TD-M16-M01)                                        |
| DEP-003 | Framework cross-dependencies (workspace, command, workbench) | Low      | Accepted — presentation layer                            |
| DEP-004 | No platform package imports from `apps/*`                    | —        | ✅ Verified                                              |

---

## Application host dependencies

Both `apps/web` and `apps/law-platform` declare:

- `@apzhub/platform-bootstrap`, `@apzhub/platform-runtime`
- `@apzhub/platform-identity`, `@apzhub/platform-authorization`
- `@apzhub/platform-security`, `@apzhub/platform-personalisation`, `@apzhub/platform-governance`

`apps/web` additionally declares `@apzhub/platform-operations` and `@apzhub/platform-lifecycle` (primary operations host).

---

## Product consumption

Law Platform correctly consumes platform packages without inverting dependencies. Law REST API implementation resides in `apps/web/lib/api` and depends on `@apzhub/platform-identity` for tenant membership validation.

---

## Related

- [Platform Package Review](./APZHUB-Platform-Package-Review.md)
- [Platform Boundary Review](./APZHUB-Platform-Boundary-Review.md)
