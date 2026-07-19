# Platform Release Roadmap

> **Classification:** Documentation only  
> **Authority:** [PLATFORM-LIFECYCLE](../operations/PLATFORM-LIFECYCLE.md) · [RELEASE-MANAGEMENT-STANDARD](../operations/RELEASE-MANAGEMENT-STANDARD.md) · [BRANCHING-AND-VERSIONING](../operations/BRANCHING-AND-VERSIONING.md) · [APZHUB-FOUNDATION-001](../foundation/APZHUB-FOUNDATION-001-Platform-Foundation-Completion-Report.md)  
> **Quality baseline:** QA-002 **PRODUCTION READY**  
> **Rule:** Platform Foundation is **CLOSED**. Platform Releases are exceptional.

---

## Purpose

How platform packages and cross-cutting capabilities are versioned, released, and certified after Foundation closeout.

---

## Platform versioning strategy

| Layer                    | Version source                                      | Rule                                                                          |
| ------------------------ | --------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Workspace root**       | Root `package.json` (`0.1.0-foundation` today)      | Advances only under an Owner-approved Platform Release                        |
| **Publishable packages** | Each `packages/*` / `integrations/*` `package.json` | Semantic Versioning ([RELEASE-NAMING-STANDARD](./RELEASE-NAMING-STANDARD.md)) |
| **Frozen packages**      | e.g. `@apzhub/integration-sdk` **1.0.0**            | No public API change without **ADR + Owner**                                  |
| **Release evidence**     | `docs/releases/` notes + Completion/Acceptance      | Required before production tag for deployable platform changes                |

Do not invent marketing platform versions that conflict with disk.

---

## Platform release cadence

There is **no fixed calendar cadence**.

Platform Releases are triggered by:

1. Product Release dependency that cannot be met by existing capabilities
2. Operational necessity (security, reliability, supportability)
3. Owner-approved **ADR** for architecture evolution

Between releases: maintenance patches and hotfixes per [HOTFIX-POLICY](../operations/HOTFIX-POLICY.md).

---

## Breaking-change policy

| Change type                                               | Requirement                                                 |
| --------------------------------------------------------- | ----------------------------------------------------------- |
| Public API / contract break on a package                  | MAJOR SemVer + release evidence                             |
| Frozen subsystem (SDK, Search, Documents, Workflow, etc.) | **ADR + Owner Approval** before implementation              |
| Gateway / OpenAPI contract break                          | Versioned API path or documented deprecation window + Owner |
| Adapter-only internal change (no public contract)         | PATCH/MINOR as appropriate; still certify scope             |

Breaking changes never ship silently. Consumers (products, gateway clients) must be listed in release evidence.

---

## Backward compatibility

- Prefer additive (MINOR) changes over breaks.
- Deprecate before remove ([RELEASE-NAMING-STANDARD](./RELEASE-NAMING-STANDARD.md) LTS/deprecation).
- Platform metadata SoR remains APZHUB PostgreSQL; engines remain authoritative for engine business data (Document 011).
- Products must keep working on the prior Platform Release until migration notes are Owner-accepted.

---

## ADR requirements

Platform evolution that changes architecture, freezes, layering, or public contracts follows:

```text
Proposal → ADR → Owner Approval → Implementation → Certification → Platform Release
```

See [PLATFORM-LIFECYCLE](../operations/PLATFORM-LIFECYCLE.md). ADRs live under `docs/adr/`. Conversation history never substitutes for an ADR.

---

## Certification requirements

Before a Platform Release tag/deploy:

| Gate                 | Requirement                                       |
| -------------------- | ------------------------------------------------- |
| Repository typecheck | PASS                                              |
| Repository lint      | PASS                                              |
| Repository tests     | PASS (or scoped suite + Owner-accepted rationale) |
| Scope tests          | Platform packages / adapters in release           |
| Freeze compliance    | Verified against AI-MANIFEST frozen table         |
| Documentation        | CURRENT-* / release notes / limitations updated   |
| Owner                | Release approval                                  |

Aligns with [DEFINITION-OF-DONE](../operations/DEFINITION-OF-DONE.md) and Document 015.

---

## Current platform baseline (disk)

| Item                              | Status                                                                            |
| --------------------------------- | --------------------------------------------------------------------------------- |
| Platform Foundation               | **CLOSED** (APZHUB-FOUNDATION-001 ACCEPTED)                                       |
| Repository quality                | **PRODUCTION READY** (QA-002 ACCEPTED)                                            |
| Integration SDK                   | **1.0.0** Architecture Frozen                                                     |
| Event Bus / Outbox / Provisioning | **0.1.0** delivered (not Foundation reopen)                                       |
| Certified adapters                | Plane **0.6.0** · Zammad **0.6.0** · Meilisearch · n8n **0.1.0** · GitHub Actions |
| Absent adapters                   | Kimai · Paperless · Metabase (and others per AI-MANIFEST)                         |

---

## Next platform release

**Not scheduled.** Authorised only by Owner Approval of a Platform Release or ADR-driven change. Prefer product-layer consumption of existing capabilities first.
