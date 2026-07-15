# PRH-000 — Implementation Baseline (Frozen)

> **Milestone:** PRH-000 — Production Readiness Acceptance  
> **Freeze date:** 2026-07-08  
> **Status:** **IMMUTABLE** — changes require new owner acceptance  
> **Authority:** [PRH-000 Owner Acceptance](./PRH-000-Owner-Acceptance.md)

---

## Purpose

This document freezes the contractual baseline for PCv2-01 implementation. All engineering work (PRH-001 through PRH-018) must conform to this baseline. Deviations require owner approval and baseline amendment.

---

## Frozen architecture

### Target state

| Document | Role | Frozen reference |
|----------|------|------------------|
| [PCv2-01 Production Readiness Architecture](../architecture/PCv2-01-Production-Readiness-Architecture.md) | Target production architecture post-PCv2-01 | **Authoritative target** |
| [Platform Core Reference Architecture](../architecture/APZHUB-Platform-Core-Reference-Architecture.md) | Canonical Platform Core layers | Baseline — no redesign |
| [Platform Security Reference Architecture](../architecture/APZHUB-Platform-Security-Reference-Architecture.md) | M8-06 security layer | Extend, do not replace |
| [Operational Resilience Architecture](../architecture/APZHUB-Operational-Resilience-Architecture.md) | Health/readiness/recovery | Extend, do not replace |

### Architectural constraints (immutable)

1. **No Platform Core redesign** — extend M8 packages only.
2. **No product business logic** — law-platform receives hardening only.
3. **Manifest-first** — new surfaces follow SDK patterns (024–029).
4. **Self-hosted first** — no cloud-only dependencies.
5. **Coexistence** — do not disrupt legacy `apz-stack` (`ENVIRONMENT.md`).
6. **Must not block PCv2-02 or M17** — bootstrap and health patterns must accommodate workers and CI.

### Proposed implementation surfaces (frozen intent)

| Surface | Location | Story |
|---------|----------|-------|
| Shared bootstrap package | `packages/platform-bootstrap/` (proposed name) | PRH-008 |
| CSP enforcement + violation endpoint | `apps/web`, `apps/law-platform` | PRH-002 |
| RLS integration tests | `testing/integration/` | PRH-007 |
| Production smoke E2E | `testing/e2e/production-smoke/` | PRH-017 |
| Production Deployment Guide | `docs/governance/APZHUB-Production-Deployment-Guide.md` | PRH-012 |
| Production Operations Checklist | `docs/governance/APZHUB-Production-Operations-Checklist.md` | PRH-014 |
| Upgrade & Rollback Guide | `docs/governance/APZHUB-Platform-Upgrade-Rollback-Guide.md` | PRH-013 |
| Tenant Onboarding Design | `docs/architecture/APZHUB-Tenant-Onboarding-Design.md` | PRH-015 |

---

## Frozen dependencies

### Platform packages (existing — extend only)

| Package | Role |
|---------|------|
| `@apzhub/platform-security` | Headers, rate limiting, env validation, API guard, diagnostics |
| `@apzhub/platform-identity` | Identity, tenant context |
| `@apzhub/platform-authorization` | RBAC, permissions |
| `@apzhub/platform-governance` | Governance, provisioning hooks |
| `@apzhub/platform-personalisation` | Preferences |
| `@apzhub/platform-runtime` | Runtime orchestration (bootstrap must not replace) |
| `@apzhub/auth` | Better Auth integration |

### Infrastructure (existing)

| Component | Role |
|-----------|------|
| PostgreSQL | Platform metadata; RLS enforcement |
| Redis | Rate limiting backend (fallback: memory) |
| Caddy | Edge TLS; optional rate-limit config (docs only) |
| Better Auth | Session management |
| Docker Compose | Local/staging deployment |

### External dependencies (not in scope)

| Component | Milestone |
|-----------|-----------|
| Worker process / container | PCv2-02 |
| Vault | PCv2-04 |
| API Gateway service | PCv2-09 |
| Prometheus / Grafana / Loki | PCv2-07 |
| GitHub Actions CI | M17 |

### Technical debt targeted (frozen)

| ID | Description | Story |
|----|-------------|-------|
| TD-M16-C01 | App bootstrap duplicated (`web` / `law-platform`) | PRH-008 |
| TD-P09 | ALS session wiring not on all API routes | PRH-007 |
| TD-P10 | RLS cross-tenant denial not integration-tested | PRH-007 |
| TD-M16-M02 | No GitHub Actions CI | M17 (not PCv2-01) |
| TD-T04 | Playwright not green in CI | M17 (local smoke in PRH-017) |

---

## Frozen backlog

**Source:** [PCv2-01 Backlog](../backlog/PCv2-01-Backlog.md) — **do not modify story scope without owner acceptance.**

### Story prefix

**PRH-** (Production Readiness Hardening)

### Implementation order (frozen)

```text
PRH-001 → PRH-002 → PRH-003 → PRH-004 → PRH-005 → PRH-006 → PRH-007
    → PRH-008 → PRH-009 → PRH-010 → PRH-011 → PRH-012 → PRH-013 → PRH-014
    → PRH-015 → PRH-016 → PRH-017 → PRH-018
```

**Rule:** Complete one story before beginning the next unless explicitly parallelised in backlog.

### Story registry (frozen)

| ID | Title | Effort | Risk |
|----|-------|--------|------|
| PRH-001 | Architecture & ADR | M | Low |
| PRH-002 | CSP audit & enforcement | L | **High** |
| PRH-003 | Security headers hardening | S | Low |
| PRH-004 | Secrets & environment validation | M | Medium |
| PRH-005 | Rate limiting expansion | M | Medium |
| PRH-006 | Session hardening | M | Medium |
| PRH-007 | Tenant validation & RLS audit | L | Medium |
| PRH-008 | App bootstrap consolidation | L | **High** |
| PRH-009 | Platform API guard consistency audit | M | Low |
| PRH-010 | Operations diagnostics enhancement | M | Low |
| PRH-011 | Incident handling & recovery guides | S | Low |
| PRH-012 | Production deployment guide | M | Medium |
| PRH-013 | Upgrade & rollback strategy | M | Medium |
| PRH-014 | Production operations checklist | S | Low |
| PRH-015 | Commercial readiness foundation (design) | M | Low |
| PRH-016 | Audit completeness review | M | Low |
| PRH-017 | Production smoke E2E tests | L | Medium |
| PRH-018 | Readiness review & sprint closeout | S | Low |

**Estimated total:** ~18–25 engineering days (sequential).

---

## Frozen acceptance criteria

### Sprint-level (SC-01–SC-15)

Frozen per [PCv2-01 Sprint Guide](../sprint/PCv2-01-Production-Readiness-Sprint-Guide.md) success criteria table.

### Story-level

Each PRH story acceptance criteria in [PCv2-01 Backlog](../backlog/PCv2-01-Backlog.md) is frozen. Summary of mandatory outcomes:

| Story | Frozen outcome |
|-------|----------------|
| PRH-001 | ADR-0046 accepted; architecture reviewed; open questions resolved |
| PRH-002 | CSP enforced in prod; violation endpoint live; audit complete |
| PRH-003 | All mandated headers present on both apps |
| PRH-004 | Production startup aborts on validation fail |
| PRH-005 | Auth + platform API routes rate limited; 429 + headers |
| PRH-006 | Secure cookie flags in prod; dev registration blocked in prod |
| PRH-007 | RLS integration tests pass; TD-P09/TD-P10 closed |
| PRH-008 | Shared bootstrap; TD-M16-C01 closed; parity tests pass |
| PRH-009 | 100% privileged routes use API guard |
| PRH-010 | Diagnostics include CSP mode, rate limit backend, bootstrap version |
| PRH-011 | Incident/recovery guides updated |
| PRH-012 | Production Deployment Guide published |
| PRH-013 | Upgrade & Rollback Guide published |
| PRH-014 | Production Operations Checklist published |
| PRH-015 | Tenant onboarding design doc (design only) |
| PRH-016 | Audit gap report; critical paths covered |
| PRH-017 | Local production smoke E2E passes |
| PRH-018 | All stories complete; closeout report; gates green |

### Open decisions (resolve in PRH-001 only)

| ID | Decision | Frozen recommendation |
|----|----------|----------------------|
| Q-PRH-01 | Bootstrap package name | `@apzhub/platform-bootstrap` (new package) |
| Q-PRH-02 | Per-app CSP policies | Yes — law may need relaxed `connect-src` |
| Q-PRH-03 | Rate limit defaults | 20/min/IP login; 120/min platform APIs |
| Q-PRH-04 | RLS test database | Docker compose test profile |
| Q-PRH-05 | CSP report endpoint auth | Unauthenticated POST with size limit |

---

## Referenced ADRs

### Existing (frozen baseline)

| ADR | Title | Status |
|-----|-------|--------|
| ADR-0040 | Platform Tenant Foundation | Accepted (M8-01) |
| ADR-0041 | Platform Authorization RBAC Phase 1 | Accepted (M8-02) |
| ADR-0042 | Platform Operations Console | Accepted (M8-03) |
| ADR-0043 | Platform Personalisation Framework | Accepted (M8-04) |
| ADR-0044 | Platform Governance & Provisioning | Accepted (M8-05) |
| ADR-0045 | Platform Security & Operational Resilience | Accepted (M8-06) |

### To be created (PRH-001)

| ADR | Title | Status |
|-----|-------|--------|
| **ADR-0046** | CSP Enforcement & Production Security Posture | **Pending** — created in PRH-001 |

Foundation documents 000–029 remain supreme authority on conflict.

---

## Referenced strategy documents

| Document | Role |
|----------|------|
| [PCS-001 Owner Approval](../strategy/PCS-001-owner-approval.md) | Authoritative sequencing |
| [Platform Core Strategy](../strategy/APZHUB-Platform-Core-Strategy.md) | Master strategy |
| [Platform Core v2 Strategy](../strategy/APZHUB-Platform-Core-v2-Strategy.md) | v2 rationale |
| [Engineering Roadmap](../strategy/APZHUB-Engineering-Roadmap.md) | Engineering priorities |
| [Commercial Roadmap](../strategy/APZHUB-Commercial-Roadmap.md) | Commercial tiers |
| [OSS Integration Strategy](../strategy/APZHUB-OSS-Integration-Strategy.md) | OSS wave order (post-M17) |

---

## Referenced roadmap

| Document | Role |
|----------|------|
| [Platform Core v2 Roadmap](../roadmap/APZHUB-Platform-Core-v2-Roadmap.md) | PCv2 milestone sequence |
| [Platform Roadmap](../architecture/platform-roadmap.md) | Engineering milestone history |

### Owner-approved sequencing (frozen)

```text
PCv2-01  Production Readiness & Operational Hardening
    ↓
PCv2-02  Background Workers & Outbox
    ↓
M17      CI/CD, Release Engineering & E2E Automation
    ↓
OSS Waves (Plane → Kimai → Paperless → Zammad → Kiwi → Metabase → n8n → Observability → Security)
```

---

## Referenced certification

| Document | Verdict | Relevance |
|----------|---------|-----------|
| [Platform Core Certification](./APZHUB-Platform-Core-Certification.md) | **CERTIFIED WITH OBSERVATIONS** | PCv2-01 addresses OBS-PC01-01, OBS-PC01-03, OBS-PC01-04 |
| [Platform Core Commercial Assessment](./APZHUB-Platform-Core-Commercial-Assessment.md) | Pilot after PCv2-01 | Commercial design in PRH-015 |
| [Platform Core v1.0 Release](../releases/APZHUB-Platform-Core-v1.0.md) | No tag | Baseline release |

### PC-001 observations addressed by PCv2-01

| ID | Observation | Story |
|----|-------------|-------|
| OBS-PC01-01 | App bootstrap duplicated | PRH-008 |
| OBS-PC01-03 | CSP Report-Only | PRH-002 |
| OBS-PC01-04 | No GitHub Actions CI | M17 (deferred) |

---

## Referenced reviews

| Document | Verdict | Role |
|----------|---------|------|
| [PCv2-01 Readiness Review](./PCv2-01-Readiness-Review.md) | READY WITH OBSERVATIONS | Planning gate — passed |
| [PRH-000 Owner Acceptance](./PRH-000-Owner-Acceptance.md) | **APPROVED** | Implementation authorisation |
| [PCS-001 Strategy Review](./PCS-001-Strategy-Review.md) | Strategy sound | Strategic alignment |
| [M8-06 Completion Report](../sprint/M8-06-completion-report.md) | Complete | Security prerequisite |

---

## Baseline amendment process

| Change type | Required action |
|-------------|-----------------|
| Story scope increase | New owner acceptance |
| New story (PRH-019+) | New owner acceptance |
| Architecture target change | ADR + owner acceptance |
| Sequencing change | PCS-001 amendment |
| Out-of-scope item brought in-scope | New sprint guide |

---

## References

- [PRH-000 Owner Acceptance](./PRH-000-Owner-Acceptance.md)
- [PRH-000 Sprint Baseline](../releases/PRH-000-Sprint-Baseline.md)
- [PCv2-01 Sprint Guide](../sprint/PCv2-01-Production-Readiness-Sprint-Guide.md)
- [PCv2-01 Backlog](../backlog/PCv2-01-Backlog.md)
