# APZHUB Commercial Roadmap

> **Milestone:** PCS-001  
> **Status:** Strategic roadmap — planning only  
> **Authority:** [Commercial Assessment](../reviews/APZHUB-Platform-Core-Commercial-Assessment.md) · [Platform Core Strategy](./APZHUB-Platform-Core-Strategy.md)

---

## Commercial evolution model

```text
Internal Platform → Pilot Platform → Enterprise Platform → Commercial SaaS → Marketplace → Partner Ecosystem
```

Each tier adds **operational capability** and **commercial mechanics** — not architectural forks.

---

## Tier 1: Internal platform (current)

| Attribute | Detail |
|-----------|--------|
| **Status** | **Active** — PC-001 certified |
| **Audience** | Engineering, product validation |
| **Deployment** | Dev/staging on shared host |
| **Revenue** | None |
| **SLA** | None |
| **Support** | Engineering team |
| **Products** | Law Platform demo, Platform shell |
| **Exit criteria** | PCv2-01 complete |

---

## Tier 2: Pilot platform

| Attribute | Detail |
|-----------|--------|
| **Target** | Year 1 post PCv2-01 |
| **Audience** | Single firm / single org, supervised |
| **Deployment** | Self-hosted VPC or managed pilot |
| **Revenue** | Pilot fee (optional); no GA pricing |
| **SLA** | Best-effort; engineering support |
| **Products** | Law Platform primary |
| **Requirements** | PCv2-01, PCv2-02 workers, CI green |
| **Risks** | Outbox, RLS, manual ops |

---

## Tier 3: Enterprise platform

| Attribute | Detail |
|-----------|--------|
| **Target** | Year 2 |
| **Audience** | Multi-department organisations, regulated industries |
| **Deployment** | Self-hosted (Docker/K8s); customer-managed data |
| **Revenue** | Annual platform license + support contract |
| **SLA** | Defined uptime (e.g. 99.5%); support hours |
| **Products** | Law + productivity modules (OSS-backed) |
| **Requirements** | PCv2-04–07 (Vault, observability, HA), PCv2-09 gateway |
| **Add-ons** | Security ops pack, premium support |

**Enterprise value proposition:** One workbench, self-hosted, auditable, RBAC, invisible OSS engines.

---

## Tier 4: Commercial SaaS

| Attribute | Detail |
|-----------|--------|
| **Target** | Year 3 |
| **Audience** | SMB and mid-market; multi-tenant |
| **Deployment** | APZHUB-managed cloud |
| **Revenue** | Per-seat subscription + usage tiers |
| **SLA** | 99.9% target; status page |
| **Products** | Law SaaS tier; productivity suite |
| **Requirements** | PCv2-03 provisioning, PCv2-10 licensing, PCv2-06 HA |
| **Billing** | External billing adapter (Stripe-class) — not built in platform |

---

## Tier 5: Marketplace

| Attribute | Detail |
|-----------|--------|
| **Target** | Year 4 |
| **Audience** | Partners, ISVs, vertical specialists |
| **Model** | Third-party modules via manifest registry |
| **Revenue** | Marketplace revenue share |
| **Requirements** | Platform Core v3 marketplace runtime; security review process |
| **Governance** | Module signing, capability certification |

---

## Tier 6: Partner ecosystem

| Attribute | Detail |
|-----------|--------|
| **Target** | Year 5 |
| **Audience** | SI partners, resellers, integrators |
| **Model** | Certified implementation partners; white-label Workbench |
| **Revenue** | Partner program; certification fees |
| **Requirements** | SDK published; deployment automation; partner portal |

---

## Product commercial classification

| Product | Commercial? | Tier availability |
|---------|-------------|-------------------|
| Platform Core license | Yes (enterprise) | Enterprise+ |
| Law Platform | **Yes — primary SKU** | Pilot+ |
| Trust Accounting | Bundled with Law | Pilot+ |
| Productivity modules | Bundled | Enterprise+ |
| Financial Engine | Component license (future) | Enterprise+ |
| Exchange | Yes (when ready) | Enterprise+ |
| Banking | Yes (when ready) | Enterprise+ |
| Developer Platform | **No** | Internal |
| Operations Console | **No** (operator tool) | All deployments |

---

## Pricing philosophy (strategic — not final numbers)

1. **Platform fee** — base entitlement for Workbench + Core capabilities.
2. **Product fee** — per vertical (Law, Exchange, Banking).
3. **Seat fee** — per active user above threshold.
4. **Usage fee** — storage, API calls, AI tokens (metering hooks in PCv2-10).
5. **Support tier** — standard vs premium vs dedicated.

**No pricing implementation in PCS-001.**

---

## Go-to-market sequencing

```text
1. Law firm pilot (supervised)           — validate commercial workflow
2. Law enterprise self-hosted            — first revenue
3. Productivity suite bundle             — expand wallet share
4. Managed SaaS (Law + platform)         — scale
5. Exchange or Banking vertical          — second product revenue
6. Marketplace partners                    — ecosystem leverage
```

---

## References

- [Product Portfolio Strategy](./APZHUB-Product-Portfolio-Strategy.md)
- [Platform Core v2 Strategy](./APZHUB-Platform-Core-v2-Strategy.md)
- [Engineering Roadmap](./APZHUB-Engineering-Roadmap.md)
