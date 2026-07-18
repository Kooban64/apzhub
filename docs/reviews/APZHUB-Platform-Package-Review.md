# APZHUB Platform Package Review

**Milestone:** PRH-011  
**Date:** 2026-07-09

---

## Package inventory (23 packages)

| Package                                 | Layer            | Role                                          | PRH-011 status   |
| --------------------------------------- | ---------------- | --------------------------------------------- | ---------------- |
| `@apzhub/platform-runtime`              | Platform         | Manifest engine, registry, bootstrap pipeline | ✅ Certified     |
| `@apzhub/platform-bootstrap`            | Platform         | Canonical host bootstrap + diagnostics loader | ✅ Certified     |
| `@apzhub/config`                        | Platform         | Env, DB, governance registry                  | ⚠️ Law coupling  |
| `@apzhub/platform-identity`             | Platform Service | Tenants, membership, session resolver         | ✅ Certified     |
| `@apzhub/platform-authorization`        | Platform Service | RBAC, permissions                             | ✅ Certified     |
| `@apzhub/platform-personalisation`      | Platform Service | Preferences, favorites, layout                | ✅ Certified     |
| `@apzhub/platform-governance`           | Platform Service | Feature flags, provisioning                   | ✅ Certified     |
| `@apzhub/platform-security`             | Platform Service | Guards, CSP, traffic, resilience              | ✅ Certified     |
| `@apzhub/platform-operations`           | Platform Service | Control plane, verification                   | ✅ Certified     |
| `@apzhub/platform-lifecycle`            | Platform Service | Lifecycle state machine                       | ✅ Certified     |
| `@apzhub/auth`                          | Platform         | Better Auth integration                       | ✅ Certified     |
| `@apzhub/workbench-framework`           | Framework        | Workbench bridge                              | ✅ Certified     |
| `@apzhub/workspace`                     | Presentation     | Desktop shell                                 | ✅ Certified     |
| `@apzhub/command-framework`             | Framework        | Command palette                               | ✅ Certified     |
| `@apzhub/knowledge-discovery-framework` | Framework        | Search providers                              | ✅ Certified     |
| `@apzhub/event-notification-framework`  | Framework        | Events, notifications                         | ✅ Certified     |
| `@apzhub/activity-timeline-framework`   | Framework        | Activity timeline                             | ✅ Certified     |
| `@apzhub/ui`                            | Presentation     | Design system                                 | ✅ Certified     |
| `@apzhub/theme`                         | Presentation     | Theming                                       | ✅ Certified     |
| `@apzhub/types`                         | Shared           | Types                                         | ✅ Certified     |
| `@apzhub/shared`                        | Shared           | Redis health utilities                        | ✅ Certified     |
| `@apzhub/sdk`                           | SDK              | Runtime SDK surface                           | ✅ Certified     |
| `@apzhub/legal-business-core`           | Product domain   | Law domain types                              | ✅ Product-owned |

---

## Host applications

| App                 | Role                            | Platform consumption                                                |
| ------------------- | ------------------------------- | ------------------------------------------------------------------- |
| `apps/web`          | Primary platform + Law API host | Full platform stack including operations/lifecycle                  |
| `apps/law-platform` | Law product workbench host      | Platform services via packages; thin bootstrap/diagnostics wrappers |

---

## Duplication assessment

| Pattern            | Locations                               | Assessment                                                    |
| ------------------ | --------------------------------------- | ------------------------------------------------------------- |
| Bootstrap init     | `apps/*/lib/runtime-init.ts`            | ✅ Intentional thin wrappers — canonical in bootstrap package |
| Diagnostics loader | `apps/*/lib/operational-diagnostics.ts` | ✅ Intentional thin wrappers                                  |
| Hydration libs     | Both apps (~15 files)                   | ⚠️ Maintainability duplication — not canonical logic fork     |

---

## Package boundary violations remediated

- **DEP-001:** Removed unused `@apzhub/platform-operations` dependency from `@apzhub/platform-lifecycle/package.json` to break circular dependency.

---

## Related

- [Platform Dependency Review](./APZHUB-Platform-Dependency-Review.md)
- [Architecture Compliance Report](./APZHUB-Architecture-Compliance-Report.md)
