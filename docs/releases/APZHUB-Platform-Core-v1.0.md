# APZHUB Platform Core v1.0 — Release Review

> **Status:** Release review — **no git tag** (per PC-001 gate)  
> **Date:** 2026-07-08  
> **Certification:** [CERTIFIED WITH OBSERVATIONS](../reviews/APZHUB-Platform-Core-Certification.md)

---

## Summary

**APZHUB Platform Core v1.0** is the certified permanent foundation for all APZHUB products. It comprises Milestones 1–7 (six capability frameworks + monorepo foundation) and Milestone 8 (identity, administration, governance, security).

This release review documents what Platform Core v1.0 **is**, what it **delivers**, and what **requires v2** before commercial deployment. No release tag is applied in PC-001.

---

## What's included

### Foundation (BUILD-001, SPR-001)

- pnpm monorepo, Next.js App Router, strict TypeScript
- BetterAuth + PostgreSQL + Redis
- Design System (`@apzhub/ui`), dark/light themes
- Desktop shell regions (Header, Activity Bar, Sidebar, Workspace, Status Bar)
- `GET /api/health`

### Capability frameworks (M2–M7)

| Framework | Package | Milestone |
|-----------|---------|-----------|
| Platform Runtime | `@apzhub/platform-runtime` | M2 |
| Workbench | `@apzhub/workbench-framework` | M3 |
| Actions | `@apzhub/command-framework` | M4 |
| Knowledge & Discovery | `@apzhub/knowledge-discovery-framework` | M5 |
| Events & Notifications | `@apzhub/event-notification-framework` | M6 |
| Activity & Timeline | `@apzhub/activity-timeline-framework` | M7 |

### Platform Core services (M8)

| Service | Package | Phase |
|---------|---------|-------|
| Identity | `@apzhub/platform-identity` | M8-01 |
| Authorization | `@apzhub/platform-authorization` | M8-02 |
| Operations Console | apps/web + manifests | M8-03 |
| Personalisation | `@apzhub/platform-personalisation` | M8-04 |
| Governance & Provisioning | `@apzhub/platform-governance` | M8-05 |
| Security & Resilience | `@apzhub/platform-security` | M8-06 |

### Persistence

- Drizzle ORM, PostgreSQL
- Platform migrations: `0011` identity, `0012` authorization, `0013` personalisation, `0014` governance
- Law product schema with RLS (separate migration chain)

### API surface

- 28+ `/api/platform/v1/*` routes
- System probes: `/system/health`, `/readiness`, `/liveness`
- Security: `/security`, `/security/diagnostics`
- Law REST APIs (product layer, LAW-014)

### Operations

- 19-section Platform Administration workspace
- Consolidated operational diagnostics
- Security and resilience consoles

### Quality

- **1873** unit tests passing
- Playwright E2E suites per milestone
- ≥80% coverage gate
- ADRs 0040–0045

---

## What's excluded (intentional)

- Financial Engine extraction
- Banking product
- OSS engine integrations (Plane, Kimai, etc.) — M9+
- SOC/SIEM, Vault, key rotation
- Outbox workers and background job infrastructure
- Dedicated API gateway
- Commercial billing, licensing, metering
- Multi-region HA and automated DR
- CSP enforcement (Report-Only only)

---

## Certification verdict

**CERTIFIED WITH OBSERVATIONS** — see [Platform Core Certification](../reviews/APZHUB-Platform-Core-Certification.md).

Platform Core v1.0 is the **authoritative foundation** for product development. Commercial SaaS and enterprise GA require Platform Core v2.

---

## Upgrade path

Products built on Platform Core v1.0 should:

1. Consume Platform APIs and services — never duplicate IAM, security, or registry infrastructure.
2. Register capabilities via manifests before implementation.
3. Plan for PCv2 worker infrastructure for async events.
4. Monitor [Platform Core v2 Roadmap](../roadmap/APZHUB-Platform-Core-v2-Roadmap.md) for hardening milestones.

---

## Documentation

| Document | Purpose |
|----------|---------|
| [Platform Core Reference Architecture](../architecture/APZHUB-Platform-Core-Reference-Architecture.md) | Canonical architecture |
| [Platform Core Capability Reference](../architecture/APZHUB-Platform-Core-Capability-Reference.md) | Per-capability catalogue |
| [Commercial Assessment](../reviews/APZHUB-Platform-Core-Commercial-Assessment.md) | Deployment tiers |
| [PC-001 Completion Report](../sprint/PC-001-completion-report.md) | Certification closeout |

---

## Recommended next steps (await owner approval)

1. Approve Platform Core v2 roadmap prioritisation
2. M17 — CI/CD and app bootstrap consolidation
3. Product validation on Law Platform (not new platform work)
4. **Do not** begin Financial Engine extraction or Banking without explicit approval

---

## Version relationship

| Release | Scope |
|---------|-------|
| Platform v5.0 | M1–M7 frameworks (frozen baseline) |
| **Platform Core v1.0** | M1–M8 complete platform foundation (this review) |
| Platform Core v2 | SaaS hardening, workers, gateway (planned) |
