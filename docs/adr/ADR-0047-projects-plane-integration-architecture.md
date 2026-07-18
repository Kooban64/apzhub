# ADR-0047: APZHUB Projects Capability Architecture — Native UI with Plane Engine

## Status

Accepted — OSS-101-01 (architecture only; no implementation in this ADR).

## Context

OSS-101 planning defined Wave 1 integration of Plane behind the APZHUB **Projects** capability. OSS-002 established the Capability Abstraction Standard requiring:

- Users see APZHUB capabilities, not engines
- Module → Platform Service → Adapter → Engine layering
- No Plane terminology or models above the adapter boundary

OSS-101-01 must freeze the permanent contract between Platform Core, `ProjectService`, `PlaneAdapter`, and Plane CE before environment setup (OSS-101-02) or any code.

Alternatives considered:

1. **Embedded Plane UI (iframe)** — faster delivery but breaks UX coherence and SSO requirements (007)
2. **Deep links to Plane** — exposes engine branding; violates Document 002
3. **Native APZHUB UI over Plane API** — full control, stable replacement path
4. **Native build (no Plane)** — excessive cost for Wave 1

## Decision

1. **Projects capability** uses **100% native APZHUB Workbench UI** backed by **Plane CE REST API** via `PlaneAdapter`. Standard users never see Plane UI or URLs.

2. **`ProjectService`** is the **vendor-neutral permanent contract**:
   - APZHUB terminology only (Project, Task, Sprint, Milestone, Team, Status, etc.)
   - No Plane types in public interface
   - Specification: `docs/specs/APZHUB-ProjectService-Specification.md`

3. **`PlaneAdapter`** is the **sole translation boundary**:
   - Maps Task ↔ Plane Issue, Sprint ↔ Plane Cycle, Status ↔ Plane State, etc.
   - Plane event names and models never leave `integrations/plane/`
   - Specification: `docs/specs/APZHUB-PlaneAdapter-Specification.md`

4. **System of Record:** Plane CE holds project/task domain data. Platform PostgreSQL holds entity ID mappings, sync metadata, and derived indexes only — not duplicate authoritative business data.

5. **Tenant model:** One platform tenant maps to one Plane workspace (connector-internal). Provisioned via Platform Provisioning on capability enablement.

6. **Domain lifecycles** (Project, Task, Sprint) are defined in APZHUB terms with adapter translation to Plane states. Platform Lifecycle (PRH-009) product registration ID: `projects`.

7. **Events:** ProjectService publishes canonical APZHUB events (`task.status_changed`, etc.) using platform envelope (029). Plane webhooks/poll events normalized inside adapter only.

8. **Replacement strategy:** Future engine swap implements new adapter behind unchanged `ProjectService` interface and stable module/API DTOs.

9. **OSS-101-01 scope boundary:** Architecture and specifications only. No REST client, Plane deployment, UI, database schema, or Platform Core modifications in this phase.

## Architecture

```text
modules/projects          (Presentation — APZHUB UI only)
       ↓
ProjectService            (Application — vendor-neutral contract)
       ↓
PlaneAdapter              (Adapter — Plane translation only)
       ↓
Plane CE                  (Engine — SoR for project domain)

Platform Core: Identity, Authorization, Governance, Provisioning,
  Operations, Lifecycle, Search, Knowledge, Notifications, Activity
```

Canonical reference: `docs/architecture/APZHUB-Projects-Capability-Architecture.md`

## Consequences

### Positive

- Permanent contract enables parallel work on UI and adapter after OSS-101-02
- Plane replacement without module rewrite
- Full compliance with OSS-002 and Document 002
- Clear architecture review gate for all Wave 1 PRs

### Negative

- Higher initial UI investment vs iframe embed
- Entity mapping table required (OSS-101-04)
- Two-system operational burden (platform + Plane)

### Risks

| Risk                    | Mitigation                               |
| ----------------------- | ---------------------------------------- |
| Plane API changes       | Version pin (OSS-101-02); contract tests |
| Mapping drift           | Reconciliation job; sync_version         |
| Scope creep to Plane UI | ADR + architecture compliance gate       |

## Compliance

| Standard                       | Status                                  |
| ------------------------------ | --------------------------------------- |
| Document 002 (terminology)     | Compliant                               |
| Document 008 (layers)          | Compliant                               |
| Document 009 (service layer)   | Compliant                               |
| OSS-002 Capability Abstraction | Compliant                               |
| Document 029 (events)          | Compliant — canonical event IDs defined |

## References

- [Projects Capability Architecture](../architecture/APZHUB-Projects-Capability-Architecture.md)
- [ProjectService Specification](../specs/APZHUB-ProjectService-Specification.md)
- [PlaneAdapter Specification](../specs/APZHUB-PlaneAdapter-Specification.md)
- [Domain Lifecycle Specification](../specs/APZHUB-Projects-Domain-Lifecycle-Specification.md)
- [Event Mapping Specification](../specs/APZHUB-Projects-Event-Mapping-Specification.md)
- [OSS-101-01 Completion Report](../sprint/OSS-101-01-completion-report.md)

## Implementation gate

Implementation begins with **OSS-101-02** (Plane environment and configuration) only after owner approval of OSS-101-01.
