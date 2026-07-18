# APZHUB OSS Integration Standards

**Milestone:** OSS-001 (extended by OSS-002)  
**Status:** Mandatory for all OSS integration implementation  
**Authority:** Documents 003, 008, 009, 025, 026, 027 · [Capability Abstraction Standard](../architecture/APZHUB-Capability-Abstraction-Standard.md)

---

## 0. Capability abstraction (OSS-002)

All capabilities — OSS-backed and native — must comply with the [Capability Abstraction Standard](../architecture/APZHUB-Capability-Abstraction-Standard.md).

| Type                                             | Applies OSS Integration Standards              | Adapter                                                                                   |
| ------------------------------------------------ | ---------------------------------------------- | ----------------------------------------------------------------------------------------- |
| OSS-backed product module                        | Full standards below                           | Required — [Adapter Boundary Pattern](../architecture/APZHUB-Adapter-Boundary-Pattern.md) |
| Native product module (e.g. Quality Engineering) | Sections 2–11 below; **no** `integration.yaml` | Internal engine boundary only                                                             |
| Operator / security tier                         | Partial — no end-user module                   | Required                                                                                  |

Users see APZHUB capability names only. Engines are never exposed.

---

## 1. Manifest-first

| Artifact           | Required before code  | Location             |
| ------------------ | --------------------- | -------------------- |
| `integration.yaml` | Yes                   | `integrations/{id}/` |
| `service.yaml`     | Yes                   | `services/{id}/`     |
| `module.yaml`      | Yes (product modules) | `modules/{id}/`      |
| `event.yaml`       | Per event type        | `events/{id}/`       |

---

## 2. Naming (Document 002)

| Rule                           | Example                                        |
| ------------------------------ | ---------------------------------------------- |
| User-facing: APZHUB names only | Projects, not Plane                            |
| Service: `{Domain}Service`     | `ProjectService`, not `PlaneService`           |
| Adapter internal client        | `PlaneClient` — never imported outside adapter |
| Module ID                      | `projects`, not `plane`                        |

---

## 3. Layer boundaries

**Mandatory:** All OSS vendor adapters must consume `@apzhub/integration-sdk` (OSS-100). See [Platform Integration SDK Architecture](../architecture/APZHUB-Platform-Integration-SDK-Architecture.md).

**Prohibited:**

- Module → Integration Adapter (bypass service)
- Module → OSS API (bypass platform)
- Adapter → UI (bypass module)
- Adapter → Platform business rules (belongs in service)
- Duplicate identity, auth, config, or ops implementations

**Required:**

- Module → Platform Service interface only
- Service → Adapter interface only
- All client traffic via APZHUB API Gateway

---

## 4. Authentication & SSO

- Single user login via Better Auth
- No user-visible engine login screens
- Per-engine SSO config owned by platform (Document 007)
- Service accounts stored in Vault (PCv2-04) — never in code/repos

---

## 5. Authorization

- `PermissionService` / `@apzhub/platform-authorization` authoritative
- Engine roles translated in service layer
- Never expose engine role names in UI
- API routes use platform guard pipeline (Document 010, 013)

---

## 6. Tenant isolation

- Platform tenant authoritative
- `validateUserTenantMembership` before tenant-scoped operations
- Engine credentials scoped per tenant
- RLS on platform metadata; engine scoping per adapter contract

---

## 7. Events, notifications, activity

- Services publish events — modules do not notify directly (012, 021)
- Register notification routes in event catalogue
- Register activity mappers in AT framework
- Idempotent subscribers; correlation IDs on all events

---

## 8. Search & knowledge

- Register search providers via Knowledge Discovery Framework (020)
- Async event-driven indexing
- Permission-filtered at query time
- No module standalone search UIs

---

## 9. Diagnostics & operations

- Adapter self-reports health to connector probe
- Contribute to consolidated diagnostics via bootstrap loader extension
- Register in operations control plane capability registry
- Participate in lifecycle product registration (products only)

---

## 10. Quality gates (per wave)

| Gate                    | Command                     |
| ----------------------- | --------------------------- |
| Lint                    | `pnpm lint`                 |
| Types                   | `pnpm typecheck`            |
| Build                   | `pnpm build`                |
| Tests                   | `pnpm test`                 |
| Coverage                | `pnpm test:coverage`        |
| E2E smoke               | Playwright wave smoke suite |
| Security review         | Mandatory                   |
| Architecture compliance | No layer bypass             |

---

## 11. CE / self-hosted first

- Community Edition APIs only unless owner approves EE
- Self-hosted deployment in Docker Compose / Caddy stack
- No mandatory commercial engine licensing

---

## Related

- [Platform Integration SDK Architecture](../architecture/APZHUB-Platform-Integration-SDK-Architecture.md)
- [Adapter SDK Specification](../specs/APZHUB-Adapter-SDK-Specification.md)
- [Capability Abstraction Standard](../architecture/APZHUB-Capability-Abstraction-Standard.md)
- [Adapter Boundary Pattern](../architecture/APZHUB-Adapter-Boundary-Pattern.md)
- [OSS Integration Master Architecture](../architecture/APZHUB-OSS-Integration-Master-Architecture.md)
- [OSS Product Integration Catalog](../architecture/APZHUB-OSS-Product-Integration-Catalog.md)
