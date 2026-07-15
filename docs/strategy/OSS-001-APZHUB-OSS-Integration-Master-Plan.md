# OSS-001 — APZHUB OSS Integration Master Plan

> **Milestone:** OSS-001 — OSS Integration Master Plan  
> **Status:** **APPROVED** — definitive implementation guide  
> **Type:** Planning and architecture only — no production integration code  
> **Prerequisite:** [Platform Core v2 Certification](../reviews/APZHUB-Platform-Core-v2-Certification.md) — CERTIFIED WITH OBSERVATIONS  
> **Authority:** [Document 000](../000-apzhub-engineering-constitution.md) · [Integration SDK 026](../026-integration-sdk-adapter-framework-integration-manifest-specification.md) · [Module SDK 025](../025-module-sdk-module-manifest-module-development-standard.md)

---

## Executive summary

This document is the **definitive OSS integration strategy** for APZHUB. Every OSS product integrated into the platform must follow this master plan. Implementation begins only after owner approval of OSS-101 (Plane Integration).

**Planning verdict:** All nine waves are architecturally viable on Platform Core v2. **No product-specific exceptions** bypass Platform Core for identity, authorization, operations, or lifecycle. Operator-only and security-tier exceptions are documented explicitly.

---

## Document registry

| Document | Purpose |
|----------|---------|
| [OSS Integration Master Architecture](../architecture/APZHUB-OSS-Integration-Master-Architecture.md) | Canonical integration architecture |
| [OSS Wave Roadmap](../strategy/APZHUB-OSS-Wave-Roadmap.md) | Wave sequencing and gates |
| [OSS Integration Standards](../governance/APZHUB-OSS-Integration-Standards.md) | Mandatory standards for every integration |
| [OSS Capability Mapping](../architecture/APZHUB-OSS-Capability-Mapping.md) | OSS engine → APZHUB capability map |
| [OSS Product Integration Catalog](../architecture/APZHUB-OSS-Product-Integration-Catalog.md) | Per-product specifications (all fields) |
| [OSS Integration Risk Register](../governance/APZHUB-OSS-Integration-Risk-Register.md) | Risks and mitigations |
| [OSS-001 Engineering Estimates](./OSS-001-Engineering-Estimates.md) | Effort by wave |
| [OSS-001 Acceptance Criteria](./OSS-001-Acceptance-Criteria.md) | Done definition for OSS integration waves |
| [OSS-001 Completion Report](./OSS-001-completion-report.md) | Milestone closeout |

---

## OSS-002 amendment (Wave 5)

**OSS-002** replaces Wave 5 Kiwi TCMS integration with the **native APZHUB Quality Engineering Platform**.

| Wave | Product(s) | APZHUB name | Type |
|------|------------|-------------|------|
| 5 | *(native)* | Quality Engineering | Native product module |

See [Capability Abstraction Standard](../architecture/APZHUB-Capability-Abstraction-Standard.md) and [Quality Engineering Platform Strategy](./APZHUB-Quality-Engineering-Platform-Strategy.md).

---

## Integration principles (non-negotiable)

Every OSS integration **must** consume Platform Core. Products must **never** implement their own:

| Platform capability | Owner |
|--------------------|-------|
| Identity | `@apzhub/platform-identity` |
| Authorization | `@apzhub/platform-authorization` |
| Personalisation | `@apzhub/platform-personalisation` |
| Governance | `@apzhub/platform-governance` |
| Provisioning | Platform Governance + Provisioning |
| Traffic policies | `@apzhub/platform-security` |
| Configuration | `@apzhub/config` |
| Operations | `@apzhub/platform-operations` |
| Lifecycle | `@apzhub/platform-lifecycle` |
| Diagnostics | Bootstrap + Security consolidated diagnostics |
| Search registration | Knowledge Discovery Framework (020) |
| Knowledge registration | Knowledge Discovery Framework |
| Notifications | Event Notification Framework (021) |
| Activity feeds | Activity Timeline Framework (007) |

**Standard path:**

```text
Module UI → Platform Service → Integration Adapter → OSS Engine API
                ↓
    Identity · Authz · Audit · Events · Search · Notifications · Health
```

---

## Wave overview

| Wave | OSS product(s) | APZHUB name | Type |
|------|----------------|-------------|------|
| 1 | Plane | Projects | Product module |
| 2 | Kimai | Time Tracking | Product module |
| 3 | Paperless-ngx | Documents | Product module |
| 4 | Zammad | Support | Product module |
| 5 | *(native)* | Quality Engineering | Native product module |
| 6 | Metabase | Analytics | Product module |
| 7 | n8n | Automation | Product module |
| 8 | Grafana, Prometheus, Loki | Observability | Operator tier |
| 9 | Greenbone, MobSF, Faraday | Security Ops | Security admin tier |

---

## Prerequisites (gates before OSS-101)

| Gate | Status | Owner |
|------|--------|-------|
| Platform Core v2 certified | ✅ PRH-011 | Platform |
| PCv2-02 Workers (outbox) | ⏳ Required before Wave 1 prod | Platform |
| M17 CI/CD | ⏳ Required before Wave 1 prod | Platform |
| OSS-001 Master Plan | ✅ This document | Architecture |

---

## Validation summary

| Validation | Result |
|------------|--------|
| Every planned OSS integration consumes Platform Core | ✅ Confirmed |
| Product-specific exceptions identified pre-implementation | ✅ Documented in catalog |
| No Platform Core modifications in OSS-001 | ✅ Planning only |
| No Plane production code | ✅ Not started |

### Documented exceptions (by design)

| Exception | Products | Rationale |
|-----------|----------|-----------|
| Operator-only surface | Wave 8 (Grafana/Prometheus/Loki) | Administration workspace; not end-user modules |
| Security-admin tier | Wave 9 (Greenbone/MobSF/Faraday) | Security operations; restricted permissions |
| Embedded engine UI | Metabase (Wave 6) | Signed embed URLs only; APZHUB shell wraps |
| No user-visible engine login | All waves | Silent SSO / token bridge per Document 007 |

---

## Stop condition

OSS-001 Master Plan complete. **OSS-002** supersedes Wave 5 (Kiwi TCMS → native Quality Engineering).

**Await owner approval before OSS-101 (Plane Integration) or QE-001 (Quality Engineering Foundation).**

Do not begin OSS integration production code until OSS-101 is approved. Do not begin Quality Engineering implementation until QE-001 is approved.

---

## Related

- [OSS Integration Strategy](./APZHUB-OSS-Integration-Strategy.md) — strategic evaluation (PCS-001); OSS-001 supersedes for implementation detail
- [OSS-002 Completion Report](./OSS-002-completion-report.md) — Capability Abstraction Standard; Wave 5 native QE
- [Build vs Buy Strategy](./APZHUB-Build-vs-Buy-Strategy.md)
- [Product Portfolio Strategy](./APZHUB-Product-Portfolio-Strategy.md)
