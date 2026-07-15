# APZHUB Platform Core Certification

> **Milestone:** PC-001 — Platform Core Certification  
> **Date:** 2026-07-08  
> **Type:** Certification and governance review — **no implementation**  
> **Authority:** [Engineering Constitution](../000-apzhub-engineering-constitution.md) · M8-01–M8-06 completion reports · [M16 Engineering Review](./APZHUB-Platform-Engineering-Review.md)

---

## Executive summary

PC-001 certifies the APZHUB **Platform Core Phase 1** — the permanent foundation delivered across Milestones 1–7 (capability frameworks) and Milestone 8 (identity, administration, governance, security). The review confirms architectural completeness for **product validation and internal deployment**. Commercial SaaS and enterprise GA require Platform Core v2 hardening (documented separately).

**Certification verdict:** **CERTIFIED WITH OBSERVATIONS**

The Platform Core is sufficiently complete, consistent, and mature to become the permanent foundation for all future APZHUB products, subject to documented observations and the Platform Core v2 roadmap.

---

## Certification scope

| Capability | Package / surface | M8 / M1–M7 |
|------------|-------------------|------------|
| Runtime | `@apzhub/platform-runtime` | M2 |
| Workbench | `@apzhub/workbench-framework` | M3 |
| Identity | `@apzhub/platform-identity` | M8-01 |
| Authorization | `@apzhub/platform-authorization` | M8-02 |
| Operations | Operations Console + APIs | M8-03 |
| Personalisation | `@apzhub/platform-personalisation` | M8-04 |
| Governance | `@apzhub/platform-governance` | M8-05 |
| Provisioning | Governance package | M8-05 |
| Security | `@apzhub/platform-security` | M8-06 |
| Persistence | `@apzhub/config` + Drizzle migrations | LAW-012 + M8 |
| API Framework | `/api/platform/v1/*`, `/api/health` | M8 + LAW-014 |
| Actions | `@apzhub/command-framework` | M4 |
| Knowledge | `@apzhub/knowledge-discovery-framework` | M5 |
| Events | `@apzhub/event-notification-framework` | M6 |
| Notifications | `@apzhub/event-notification-framework` | M6 |
| Activity Timeline | `@apzhub/activity-timeline-framework` | M7 |
| Search | Knowledge & Discovery (Document 020) | M5 |
| Developer Experience | Docs, onboarding, monorepo tooling | BUILD-001+ |
| Testing | Vitest, Playwright, coverage gates | M1–M8 |
| Documentation | Foundation 000–029, architecture, ADRs | Continuous |

---

## Rating methodology

Each capability is rated on eight dimensions:

| Dimension | Scale |
|-----------|-------|
| Architecture | Excellent · Very Good · Good · Fair · Needs Work |
| Maintainability | Excellent · Very Good · Good · Fair · Needs Work |
| Scalability | Excellent · Very Good · Good · Fair · Needs Work |
| Security | Excellent · Very Good · Good · Fair · Needs Work |
| Documentation | Excellent · Very Good · Good · Fair · Needs Work |
| Developer Experience | Excellent · Very Good · Good · Fair · Needs Work |
| Operational Readiness | Excellent · Very Good · Good · Fair · Needs Work |
| Commercial Readiness | Excellent · Very Good · Good · Fair · Needs Work |

**Overall capability score** is the median qualitative assessment across dimensions, weighted toward architecture and security for platform-critical capabilities.

---

## Capability certification matrix

### Platform Core services (M8)

| Capability | Arch | Maint | Scale | Sec | Docs | DX | Ops | Comm | Overall |
|------------|------|-------|-------|-----|------|-----|-----|------|---------|
| **Identity** | VG | VG | G | VG | VG | G | G | F | **Very Good** |
| **Authorization** | VG | VG | G | VG | VG | G | G | F | **Very Good** |
| **Operations** | VG | VG | G | G | VG | VG | VG | F | **Very Good** |
| **Personalisation** | VG | VG | G | G | VG | G | G | F | **Very Good** |
| **Governance** | VG | VG | G | G | VG | G | G | F | **Very Good** |
| **Provisioning** | G | VG | G | G | VG | G | G | F | **Good** |
| **Security** | VG | VG | G | G | VG | G | VG | F | **Very Good** |

### Infrastructure and frameworks (M1–M7)

| Capability | Arch | Maint | Scale | Sec | Docs | DX | Ops | Comm | Overall |
|------------|------|-------|-------|-----|------|-----|-----|------|---------|
| **Runtime** | E | VG | G | G | VG | VG | VG | F | **Excellent** |
| **Workbench** | E | VG | G | G | VG | G | G | F | **Very Good** |
| **Persistence** | VG | G | G | G | VG | G | G | F | **Good** |
| **API Framework** | VG | G | G | G | VG | G | G | F | **Good** |
| **Actions** | E | VG | G | G | VG | VG | G | F | **Very Good** |
| **Knowledge** | E | VG | G | G | VG | VG | G | F | **Very Good** |
| **Events** | VG | VG | G | G | VG | VG | G | F | **Very Good** |
| **Notifications** | VG | VG | G | G | VG | VG | G | F | **Very Good** |
| **Activity Timeline** | VG | VG | G | G | VG | VG | G | F | **Very Good** |
| **Search** | VG | VG | G | G | VG | VG | G | F | **Very Good** |

### Cross-cutting

| Capability | Arch | Maint | Scale | Sec | Docs | DX | Ops | Comm | Overall |
|------------|------|-------|-------|-----|------|-----|-----|------|---------|
| **Developer Experience** | VG | VG | — | G | VG | VG | G | F | **Very Good** |
| **Testing** | VG | VG | G | G | VG | VG | G | F | **Very Good** |
| **Documentation** | VG | VG | — | — | E | VG | VG | G | **Very Good** |

*Abbreviations: E = Excellent, VG = Very Good, G = Good, F = Fair*

---

## Per-capability findings

### Runtime (M2) — Excellent

Manifest-first orchestrator with capability registry, lifecycle manager, dependency graph, health manager, and configuration engine. Template for all subsequent frameworks. In-process only; external bus deferred to PCv2.

**Observation:** Bootstrap troubleshooting could be better documented for new contributors.

### Workbench (M3) — Very Good

Eight engines, session persistence, Request Bus, manifest-driven navigation. Permission adapter seam implemented via M8 authorization bridge. Context panel and selection UI partially wired.

**Observation:** TD-P6-02 (dedicated `AuthWorkbenchPermissionAdapter`) remains a polish item; session authorization bridge satisfies M8 requirements.

### Identity (M8-01) — Very Good

Platform-owned tenants, membership, session tenant enrichment, first-login provisioning. Closes TD-P02 primary path. PostgreSQL + in-memory hybrid.

**Observation:** SaaS tenant onboarding automation deferred to PCv2.

### Authorization (M8-02) — Very Good

Canonical RBAC Phase 1: roles, permissions, assignments, effective permissions, session bridge. Platform events for audit. PostgreSQL migration `0012`.

**Observation:** Superadmin tier and advanced policy engines (ABAC) deferred per Document 007.

### Operations (M8-03) — Very Good

19-section Operations Console (Dashboard through Resilience). Manifest-driven sidebar. Aggregated health, diagnostics, audit, configuration. Real signals in Health section post-M8-06.

**Observation:** No external alerting integration; ops remains console-first.

### Personalisation (M8-04) — Very Good

Preferences, favorites, recent, workbench layout. PostgreSQL `0013`. Theme bridge to presentation engine.

**Observation:** Widget designer, saved searches, advanced layouts deferred per Document 023.

### Governance (M8-05) — Very Good

Capability registry, enablements, feature flags (foundation), diagnostics. PostgreSQL `0014`.

**Observation:** Percentage rollouts, A/B testing, licensing, billing deferred.

### Provisioning (M8-05) — Good

Product/module provisioning records and orchestration foundation. Does not replace identity provisioning.

**Observation:** Commercial provisioning workflows deferred to PCv2.

### Security (M8-06) — Very Good

Environment validation, API guard, rate limiting (memory + Redis), resilience probes, consolidated diagnostics, Permissions-Policy header.

**Observation:** CSP Report-Only; SOC/SIEM, Vault, key rotation deferred.

### Persistence — Good

PostgreSQL via Drizzle; platform migrations 0011–0014; Law schema with RLS. Outbox table exists; workers not implemented.

**Observation:** TD-P18 (outbox workers), TD-M16-M01 (Law schema in config package), FK policy gaps.

### API Framework — Good

28+ platform v1 routes; standard response envelope; guard on privileged endpoints. Law REST APIs (LAW-014).

**Observation:** Dedicated API gateway, API keys, webhooks, versioning policy deferred.

### Actions (M4) — Very Good

Unified executor, palette, shortcuts, toolbar, context menu, audit events. Gateway stubs deferred.

### Knowledge & Search (M5) — Very Good

Knowledge Registry, orchestrator, ranking, overlay experience. Implements Document 020 unified search foundation. Persistent search index deferred.

### Events (M6) — Very Good

Event Registry, Event Bus, platform event catalogue. In-process; external bus deferred.

### Notifications (M6) — Very Good

Notification Registry, mapper, badge/panel experiences. Session-only store; persistent notification store deferred (TD-EN15).

### Activity Timeline (M7) — Very Good

Activity and Timeline registries, context panel integration, audit hook. Live subscriptions and persistent store deferred.

### Developer Experience — Very Good

Monorepo (pnpm), strict TypeScript, onboarding guides per framework, ADR governance, manifest-first workflow.

**Observation:** TD-M16-M02 (GitHub Actions CI), app bootstrap duplication (TD-M16-C01).

### Testing — Very Good

1873 unit tests, Playwright E2E, ≥80% coverage gate. Full pyramid per Document 015.

**Observation:** TD-T04 Playwright not green in CI; pre-commit runs full suite (~4 min).

### Documentation — Very Good

Foundation 000–029 complete. Architecture references per M8 capability. ADRs 0040–0045. M16 review suite.

**Observation:** Platform Core canonical docs now superseded by PC-001 deliverables.

---

## Certification questions

### Is Platform Core complete?

**Yes — for Phase 1 foundation.** All mandated capabilities (Runtime through Security, frameworks M4–M7, persistence, API surface, operations, documentation) are delivered. Gaps are **intentionally deferred** to Platform Core v2 or product milestones, not missing Phase 1 scope.

### Would you change any architectural decisions?

**No fundamental changes.** Minor observations only:

- Consolidate app bootstrap (`web` + `law-platform`) into shared package (TD-M16-C01).
- Extract Law persistence from `@apzhub/config` when product boundaries stabilise.
- Enforce CSP when inline script audit completes.

The manifest-first registry pattern, Platform Service boundary, and Workbench-as-shell decisions remain correct.

### Which decisions proved most valuable?

1. **Manifest-first extension** — auto-discovery, no hardcoded modules.
2. **Registry + bootstrap + DTO + hydration pattern** — repeated identically across M2–M7 (Capability Matrix).
3. **Workbench as permanent shell** — products publish requests, never isolated layouts.
4. **Platform-owned IAM** — BetterAuth for authentication only; APZHUB owns permissions and tenants.
5. **In-memory + PostgreSQL hybrid** — enables dev/test without DB while production uses Postgres.
6. **Phased M8 delivery** — identity before RBAC before ops before governance before security reduced rework.

### Which Platform capabilities are reusable outside APZHUB?

| Capability | Reusability | Notes |
|------------|-------------|-------|
| Platform Runtime | **High** | UI-agnostic orchestrator |
| Workbench Framework | **High** | Generic shell pattern |
| Action Framework | **High** | Command palette / action execution |
| Knowledge & Discovery | **High** | Unified search pattern |
| Event & Notification | **Medium–High** | In-process; needs external bus for scale |
| Activity Timeline | **Medium–High** | Audit-driven presentation |
| Identity / Authorization / Governance | **Medium** | APZHUB-specific permission model |
| Law persistence | **Low** | Product-specific |

### Could the Platform Core become an independent commercial platform?

**Yes, with PCv2 hardening.** The architecture supports white-label workbench, multi-tenant identity, and manifest-driven product loading. Commercial SaaS requires: gateway, workers, Vault, HA, licensing, and operational tooling — all scoped to Platform Core v2.

### What remaining work belongs to Platform Core v2?

See [Platform Core v2 Roadmap](../roadmap/APZHUB-Platform-Core-v2-Roadmap.md). Priority: Production SaaS Hardening, outbox workers, commercial provisioning, Vault, SOC/SIEM, HA, observability, background workers, gateway, commercial licensing.

### Should Financial Engine extraction proceed now?

**No.** [FIN-001](./FIN-001-Architecture-Review.md) verdict: **DEFER EXTRACTION**. Preconditions not met; Law critical path and PCv2 take precedence. Await owner approval.

### Should Banking begin now?

**No.** Banking is explicitly out of scope. No approved sprint guide. Await owner approval after Platform Core v2 planning.

### Should future products depend exclusively on Platform Core?

**Yes — mandatory.** Document 003 layered architecture prohibits module-to-connector bypass. Products consume Platform Services and Platform Core APIs; they do not duplicate identity, security, operations, or registry infrastructure.

---

## Observations (non-blocking)

| ID | Observation | Severity | Target |
|----|-------------|----------|--------|
| OBS-PC01-01 | App bootstrap duplicated across `web` and `law-platform` | Medium | PCv2 / M17 |
| OBS-PC01-02 | Outbox workers not implemented | High | PCv2 workers |
| OBS-PC01-03 | CSP remains Report-Only | Medium | PCv2-01 |
| OBS-PC01-04 | No GitHub Actions CI workflow | Medium | M17 |
| OBS-PC01-05 | Commercial readiness Fair across core | Expected | PCv2 |
| OBS-PC01-06 | Persistent notification/activity stores session-only | Low | PCv2+ |
| OBS-PC01-07 | Law schema coupled to `@apzhub/config` | Medium | Product extraction |
| OBS-PC01-08 | Feature flags foundation only (no rollouts) | Low | PCv2 governance |

---

## Quality gates (certification run)

| Gate | Result | Notes |
|------|--------|-------|
| `pnpm lint` | ✅ Pass | No code changes in PC-001 |
| `pnpm typecheck` | ✅ Pass | |
| `pnpm build` | ✅ Pass | |
| `pnpm test` | ✅ Pass | 1873 tests |
| `pnpm test:coverage` | ✅ Pass | ≥80% |

---

## Verdict

# CERTIFIED WITH OBSERVATIONS

The APZHUB Platform Core Phase 1 is **certified** as the permanent architectural foundation for all APZHUB products. Observations are documented, non-blocking for product validation and internal deployment, and scheduled for Platform Core v2.

**Stop condition met.** Await owner approval before Financial Engine extraction, Banking, Exchange expansion, Trust Phase 2, or new product development.

---

## References

- [Platform Core Reference Architecture](../architecture/APZHUB-Platform-Core-Reference-Architecture.md)
- [Platform Core Capability Reference](../architecture/APZHUB-Platform-Core-Capability-Reference.md)
- [Commercial Assessment](./APZHUB-Platform-Core-Commercial-Assessment.md)
- [Platform Core v1.0 Release Review](../releases/APZHUB-Platform-Core-v1.0.md)
- [Platform Core v2 Roadmap](../roadmap/APZHUB-Platform-Core-v2-Roadmap.md)
- [PC-001 Completion Report](../sprint/PC-001-completion-report.md)
- [Technical Debt Register](../architecture/APZHUB-Platform-Technical-Debt-Register.md)
