# OSS-101-10 Capability Certification Matrix

> **Milestone:** OSS-101-10  
> **Adapter:** `@apzhub/integration-plane` v0.6.0  
> **Minimum Plane CE:** 0.23.0 (supported range 0.23.0–0.24.x)  
> **Date:** 2026-07-10  
> **Verdict:** **CERTIFIED** as APZHUB Reference Adapter

Legend: **I** Implemented · **T** Tested · **D** Documented · **C** Certified

---

## Capability matrix

| Capability      | I   | T   | D   | C   | Coverage notes        | Known limitations               | Min Plane | Optional | Dependencies          |
| --------------- | --- | --- | --- | --- | --------------------- | ------------------------------- | --------- | -------- | --------------------- |
| Projects        | ✅  | ✅  | ✅  | ✅  | Core + HTTP E2E       | Native UI deferred              | 0.23.0    | No       | Workspaces, mapping   |
| Workspaces      | ✅  | ✅  | ✅  | ✅  | Core + HTTP E2E       | —                               | 0.23.0    | No       | Auth, connectivity    |
| Tasks           | ✅  | ✅  | ✅  | ✅  | Task service + HTTP   | Kanban UI deferred              | 0.23.0    | No       | Projects, states      |
| Labels          | ✅  | ✅  | ✅  | ✅  | Core services         | —                               | 0.23.0    | No       | Projects              |
| States          | ✅  | ✅  | ✅  | ✅  | `project_states`      | —                               | 0.23.0    | No       | Projects              |
| Modules         | ✅  | ✅  | ✅  | ✅  | Core services         | —                               | 0.23.0    | No       | Projects              |
| Members         | ✅  | ✅  | ✅  | ✅  | Core services         | Role names not UI-exposed       | 0.23.0    | No       | Projects              |
| Comments        | ✅  | ✅  | ✅  | ✅  | Collaboration suite   | HTTP surface limited            | 0.23.0    | No       | Tasks                 |
| Activity        | ✅  | ✅  | ✅  | ✅  | Collaboration suite   | Platform activity bus not wired | 0.23.0    | No       | Tasks                 |
| Watchers        | ✅  | ✅  | ✅  | ✅  | Collaboration suite   | —                               | 0.23.0    | No       | Tasks                 |
| Analytics       | ✅  | ✅  | ✅  | ✅  | Optional probe        | May be unavailable on CE        | 0.23.0    | **Yes**  | Projects, cycles      |
| Synchronisation | ✅  | ✅  | ✅  | ✅  | Sync service tests    | No workers / scheduler          | 0.23.0    | No       | Projects, tasks       |
| Events          | ✅  | ✅  | ✅  | ✅  | Event translator      | Platform Event Bus deferred     | 0.23.0    | No       | —                     |
| Webhooks        | ✅  | ✅  | ✅  | ✅  | Webhook service       | **No HTTP ingress**             | 0.23.0    | **Yes**  | Auth, connectivity    |
| Diagnostics     | ✅  | ✅  | ✅  | ✅  | Ops + SDK diagnostics | Secrets never logged            | 0.23.0    | No       | SDK observability     |
| Compatibility   | ✅  | ✅  | ✅  | ✅  | Compatibility matrix  | Pin CE range                    | 0.23.0    | No       | Version provider      |
| Readiness       | ✅  | ✅  | ✅  | ✅  | 9 structured checks   | Optional webhook warn-only      | 0.23.0    | No       | Config, auth, metrics |
| Health          | ✅  | ✅  | ✅  | ✅  | 4-level model         | —                               | 0.23.0    | No       | Connectivity, CB      |
| Cycles          | ✅  | ✅  | ✅  | ✅  | Core services         | Listed in ops cert              | 0.23.0    | No       | Projects              |

---

## Cross-cutting certification

| Concern                   | Status                                     |
| ------------------------- | ------------------------------------------ |
| Error translation         | Certified (VendorErrorMapper + SDK)        |
| Auth bridge               | Certified (API key / token via SDK)        |
| Entity mapping (platform) | Certified (OSS-110-05 store; not in Plane) |
| Authorisation (platform)  | Certified (OSS-110-06; not in Plane)       |
| Provider resolution       | Certified (gateway + registry)             |
| Mock Plane API            | Certified (adapter testing + Wave1 E2E)    |

---

## Documentation map

| Capability area          | Doc                                               |
| ------------------------ | ------------------------------------------------- |
| Adapter                  | `integrations/plane/docs/PLANE-ADAPTER.md`        |
| Tasks                    | `PLANE-TASK-SERVICE.md`                           |
| Collaboration            | `PLANE-COLLABORATION-INTELLIGENCE.md`             |
| Sync / events / webhooks | `PLANE-SYNC-EVENTS.md`                            |
| Operations               | `PLANE-OPERATIONS.md`                             |
| Reference standard       | `docs/architecture/REFERENCE-ADAPTER-STANDARD.md` |

---

## Certification statement

All registered Plane capabilities above are **Implemented, Tested, Documented, and Certified** for Wave 1 at the adapter and platform-service boundaries. Optional analytics and webhooks may degrade without failing required readiness. Platform Event Bus, webhook HTTP ingress, and Projects UI remain explicitly out of Wave 1 scope.
