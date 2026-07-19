# APZ Projects 1.1 — Compatibility Notes

> **Release:** APZ Projects 1.1.0  
> **Rule:** Workbench-only changes on existing Platform HTTP

---

## Compatible with

- APZHUB Workbench shell (existing deep-link / router wiring)
- Wave 1 Platform HTTP: `/api/v1/projects*`, `/api/v1/tasks*`, `/api/v1/workspaces`, `/api/v1/search/*`, `/api/v1/health`
- Certified Plane adapter `@apzhub/integration-plane` **0.6.0**
- Integration SDK **1.0.0** (frozen)
- QA-002 **PRODUCTION READY** repository baseline

---

## Unchanged (must remain)

| Area                                         | Verification                                                   |
| -------------------------------------------- | -------------------------------------------------------------- |
| Plane adapter package version                | `0.6.0`                                                        |
| Integration SDK package version              | `1.0.0`                                                        |
| Platform Service implementations             | No edits under `packages/platform-services` / service redesign |
| Auth / provisioning / governance / Event Bus | No redesign                                                    |
| Engine branding                              | Still masked in UI certification                               |

---

## Client impact

- New typed client methods are additive (`getTask`, `updateTask`, `transitionTask`, `assignTask`, `clearTaskAssignee`).
- Existing Phase 1 views remain; mutation controls appear for users with `projects.task.manage` / `projects.manage` (UI-gated; server authoritative).
- Session storage key `apzhub.projects.lastProjectId` is browser-session local only.

---

## Breaking changes

None.
