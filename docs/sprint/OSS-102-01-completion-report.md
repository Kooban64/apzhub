# OSS-102-01 Completion Report — Zammad Discovery & Architecture

**Status:** Complete  
**Date:** 2026-07-10  
**Scope:** OSS-102-01 only — discovery & architecture  
**Code:** **None** (documentation only)

---

## Executive summary

Completed full discovery of the Zammad REST API and produced the architecture pack required to implement Support (`SupportService` + `ZammadAdapter`) under the certified [Reference Adapter Standard](../architecture/REFERENCE-ADAPTER-STANDARD.md) **without redesign**.

**No production code, SDK, Platform, HTTP, UI, tests, database, or API client work was performed.**

**Stop condition met.** Await owner approval before **OSS-102-02**.

---

## Architecture summary

| Topic               | Decision                                               |
| ------------------- | ------------------------------------------------------ |
| User-facing product | **Support**                                            |
| Platform Service    | `SupportService`                                       |
| Adapter package     | `@apzhub/integration-zammad`                           |
| Protocol            | REST `/api/v1` only                                    |
| GraphQL             | **Unsupported** (no first-party API)                   |
| Auth default        | Scoped HTTP API token (`Authorization: Token token=…`) |
| Edition             | Self-hosted **Community Edition** first                |
| Layering            | Exact Reference Adapter Standard layout                |
| SoR for tickets     | Zammad; platform owns mappings, authz, audit           |

See [ZAMMAD-ARCHITECTURE.md](../architecture/ZAMMAD-ARCHITECTURE.md).

---

## Canonical mappings

Primary mappings (see [ZAMMAD-MAPPING.md](../architecture/ZAMMAD-MAPPING.md)):

| Zammad       | APZHUB                                                        |
| ------------ | ------------------------------------------------------------- |
| Ticket       | **Support Request** (`SupportTicket`) — **not** Projects Task |
| Article      | Comment / Message / Internal note                             |
| Organization | Organisation                                                  |
| Group        | Support Team / Queue                                          |
| Tag          | Support Tag                                                   |
| State        | Status                                                        |
| Priority     | Priority                                                      |
| User         | Agent / Requester (mapped platform users)                     |
| History      | Activity                                                      |
| SLA          | SLA policy / breach signals                                   |

**Rejected:** Ticket → Task (collides with Plane/Projects Task per document 002).

---

## Capability matrix

See [ZAMMAD-CAPABILITY-MATRIX.md](../architecture/ZAMMAD-CAPABILITY-MATRIX.md).

- **Core MVP:** tickets, articles, attachments, orgs, groups, users, tags, states, priorities, sync, events, diagnostics, readiness, compatibility, health, auth
- **Optional:** search, history, SLA, webhooks, analytics, roles
- **Unsupported:** GraphQL, social channel authoring
- **Enterprise-only:** hosted packaging differentiators — not required

---

## Reference Adapter compliance

| Standard section                  | Compliance                                           |
| --------------------------------- | ---------------------------------------------------- |
| Directory / package structure     | Designed — no deviations                             |
| Dependency rules                  | Designed — audit extension planned in implementation |
| Provider + MappingStore ownership | Platform Services; adapter translation only          |
| Mock-first testing                | Specified in test plan                               |
| Operations/certification pattern  | Planned OSS-102-09 (mirror Plane)                    |

---

## Known Zammad limitations

1. Group/ACL-centric ticket visibility — service account design critical
2. State mutation via API discouraged
3. Destructive ticket deletes
4. Large `full=true` search payloads
5. Token auth may be disabled per instance
6. Attachment base64 payload size
7. Automation (triggers) weaker as first-class write API vs tickets
8. No GraphQL

---

## Community vs Enterprise

Wave 2 targets **CE self-hosted**. Core ticketing/API/SLA/webhooks are available without mandatory EE. Hosted “Enterprise” packaging (branding, multi-instance, managed ops) is out of scope.

---

## Recommended implementation milestones

| ID         | Focus                                                 |
| ---------- | ----------------------------------------------------- |
| OSS-102-02 | Environment, version pin, ADRs                        |
| OSS-102-03 | Manifests (`integration.yaml`, `service.yaml`)        |
| OSS-102-04 | Adapter scaffold + auth + mock API                    |
| OSS-102-05 | Orgs, groups, users, tickets                          |
| OSS-102-06 | Articles, attachments, tags, catalogues               |
| OSS-102-07 | Support contracts + SupportServiceImpl + providers    |
| OSS-102-08 | Sync / events / webhooks (no ingress unless approved) |
| OSS-102-09 | Operations & certification                            |
| OSS-102-10 | Wave 2 closeout                                       |

HTTP Support API and Support UI need **separate** owner approval.

---

## Risk assessment

| Risk                                               | Level  | Mitigation                                      |
| -------------------------------------------------- | ------ | ----------------------------------------------- |
| ACL/service-account misconfiguration hides tickets | High   | Least-privilege token design + readiness checks |
| Terminology collision with Projects Task           | Medium | Mapping doc forbids Ticket→Task                 |
| Version drift vs pinned CE                         | Medium | Pin in 102-02; contract tests                   |
| Webhook ingress not ready                          | Medium | Adapter translator first; ingress later         |
| PII in articles/attachments                        | High   | Logging redaction; size limits; audit           |
| Roadmap resequence vs historical Wave 4            | Low    | Owner-directed Wave 2; docs updated             |

---

## Wave 2 roadmap

```text
OSS-102-01 Discovery ✅
    ↓ (owner approval)
OSS-102-02…04 Foundation
    ↓
OSS-102-05…07 Domain + platform service
    ↓
OSS-102-08…09 Sync/ops
    ↓
OSS-102-10 Wave 2 certification
    ↓
Later: Support HTTP API, Support UI, cross-links to Projects/Law (separate approvals)
```

Historical OSS wave chart listed Zammad as Wave 4; **owner has resequenced Zammad to Wave 2 (OSS-102)** immediately after Plane Reference Adapter certification.

---

## Deliverables

| Document            | Path                                                 |
| ------------------- | ---------------------------------------------------- |
| Architecture        | `docs/architecture/ZAMMAD-ARCHITECTURE.md`           |
| Mapping             | `docs/architecture/ZAMMAD-MAPPING.md`                |
| Capability matrix   | `docs/architecture/ZAMMAD-CAPABILITY-MATRIX.md`      |
| Implementation plan | `docs/architecture/ZAMMAD-IMPLEMENTATION-PLAN.md`    |
| Test plan           | `docs/architecture/ZAMMAD-TEST-PLAN.md`              |
| This report         | `docs/sprint/OSS-102-01-completion-report.md`        |
| Backlog             | `docs/backlog/OSS-102-Zammad-Integration-Backlog.md` |

---

## Stop condition

**Met.** Do not start OSS-102-02 or any Zammad implementation without explicit owner approval.
