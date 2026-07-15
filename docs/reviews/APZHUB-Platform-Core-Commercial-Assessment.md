# APZHUB Platform Core — Commercial Assessment

> **Milestone:** PC-001 — Platform Core Certification  
> **Date:** 2026-07-08  
> **Type:** Assessment only — no implementation  
> **Supersedes:** [Commercial Readiness Assessment](./APZHUB-Commercial-Readiness-Assessment.md) for Platform Core scope (post-M8)

---

## Executive summary

The APZHUB Platform Core is **commercially reusable as an internal platform foundation** and **architecturally ready for independent product development**. It is **not yet commercially deployable** as a multi-tenant SaaS or enterprise GA offering without Platform Core v2 hardening.

**Overall commercial posture:** **Validation / Pilot Ready (internal)** · **Not Production GA**

---

## 1. Is the Platform Core commercially reusable?

**Yes — as a foundation layer.**

| Reuse scenario | Assessment |
|----------------|------------|
| Build new APZHUB products on shared core | **Ready** — Law Platform proves the model |
| White-label workbench for partners | **Architecturally ready** — theming + governance exist; licensing deferred |
| Embed capability frameworks in other stacks | **Partial** — packages are modular; full stack is APZHUB-opinionated |
| Sell Platform Core as standalone PaaS | **Not ready** — requires PCv2 (gateway, HA, billing, ops) |

The manifest-first registry pattern, IAM separation, and Operations Console provide a **genuine platform abstraction** — not a monolithic app with plugins bolted on.

---

## 2. Can independent products be built on it?

**Yes — this is the certified architecture.**

Evidence:

- **Law Platform** (`apps/law-platform`) consumes Workbench, Runtime, Identity, Authorization, Personalisation, Governance, Security without duplicating platform infrastructure.
- **Trust Accounting** is a Law capability gated by governance (`law.trust.accounting`), not a parallel platform.
- Product REST APIs (LAW-014) sit above persistence adapters; they do not bypass Platform Services.

**Constraint:** Products must register via manifests and call Platform Services — never connectors or backends directly (Document 003).

---

## 3. Can it support SaaS?

**Not yet for production multi-tenant SaaS.**

| SaaS requirement | Platform Core v1 | Gap |
|------------------|------------------|-----|
| Tenant isolation | Identity + RLS foundation | Full RLS audit across products |
| Tenant onboarding | First-login provisioning | Automated commercial onboarding |
| Billing / metering | Not implemented | PCv2 / product |
| SLA monitoring | Health probes | External observability stack |
| Rate limiting | Foundation (120/min) | Gateway-level enforcement |
| Secret management | Env validation | Vault integration |
| HA / DR | Manual recovery guidance | Automated failover |
| Status page | Not implemented | PCv2 |

**Pilot SaaS (single region, supervised):** Possible after PCv2-01 (SaaS Hardening) with owner acceptance of operational risk.

---

## 4. Can it support enterprise deployments?

**Yes for self-hosted enterprise pilot; not for regulated production without PCv2.**

| Enterprise requirement | Status |
|------------------------|--------|
| Self-hosted OSS stack | **Supported** — PostgreSQL, Redis, Docker, Caddy |
| RBAC | **Delivered** — M8-02 |
| Audit visibility | **Delivered** — Operations Console + action audit events |
| Air-gapped deployment | **Feasible** — no mandatory cloud services |
| SSO / SAML | **Deferred** — BetterAuth extensible; per-engine SSO per Document 007 |
| SOC 2 / ISO | **Not ready** — SOC/SIEM deferred |
| Multi-region | **Not ready** |
| Enterprise support portal | **Not ready** |

**Enterprise pilot:** Single-firm, on-prem or VPC, with engineering support — **Validation Ready**.

---

## 5. What remains intentionally deferred?

### Platform Core v2 (approved direction, not started)

- Production SaaS hardening (CSP enforce, gateway rate limits, Vault)
- Outbox workers and event replay
- Commercial provisioning and licensing
- SOC/SIEM integration
- High availability and automated DR
- Dedicated API gateway
- Background worker infrastructure
- Full observability stack (Prometheus/Grafana/Loki behind connectors)
- Persistent notification and activity stores

### Product milestones (await owner approval)

- Financial Engine extraction (FIN-001: **DEFER**)
- Banking
- Exchange expansion
- Trust Phase 2 (bank feeds, three-way reconciliation)
- Business capabilities milestone (M9) — Projects, Documents, Support integrations

### Foundation documents (SPR-002+ per phase gate)

- Full command palette in default shell path (partially delivered M4)
- Unified search persistent index
- Notification delivery channels (SMTP, WebSocket)
- Desktop context panel full wiring

---

## 6. Deployment tier ratings (Platform Core only)

| Tier | Rating | Rationale |
|------|--------|-----------|
| **Internal demo** | **Ready** | Full stack, 1873 tests, ops console |
| **Internal validation** | **Ready** | Law Platform + Trust demo capable |
| **Pilot customer (supervised)** | **Validation Only** | RBAC delivered; workers, CI E2E gaps |
| **Production (multi-tenant)** | **Not Ready** | PCv2 required |
| **Commercial GA** | **Not Ready** | Billing, SLA, HA, compliance tooling |

---

## 7. Commercial risk summary

| Risk | Severity | Mitigation |
|------|----------|------------|
| Outbox events unprocessed | High | PCv2 workers |
| App bootstrap drift (web/law) | Medium | Shared bootstrap package |
| CSP Report-Only | Medium | PCv2-01 audit + enforce |
| No automated CI | Medium | M17 GitHub Actions |
| Session-only notifications | Low | PCv2 persistent store |
| Law schema in config package | Medium | Extract when stabilised |

---

## 8. Recommendation

Proceed with **product validation** on certified Platform Core v1. Plan **Platform Core v2** before any commercial SaaS launch. **Do not** begin Financial Engine extraction or Banking until owner approves post-PC-001.

---

## References

- [Platform Core Certification](./APZHUB-Platform-Core-Certification.md)
- [Platform Core v2 Roadmap](../roadmap/APZHUB-Platform-Core-v2-Roadmap.md)
- [Technical Debt Register](../architecture/APZHUB-Platform-Technical-Debt-Register.md)
- [FIN-001 Architecture Review](./FIN-001-Architecture-Review.md)
