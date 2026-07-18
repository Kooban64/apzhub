# APZHUB Platform Core v2 Strategy

> **Milestone:** PCS-001  
> **Status:** Strategic definition — **not approved for implementation**  
> **Prerequisite:** PCS-001 strategy approval · PC-001 certification  
> **Companion:** [Platform Core v2 Roadmap](../roadmap/APZHUB-Platform-Core-v2-Roadmap.md)

---

## Why Platform Core v2 exists

Platform Core v1.0 (M1–M8) is **architecturally complete** and **certified** (PC-001) for product validation and internal deployment. It is **not commercially deployable** as multi-tenant SaaS or enterprise production without:

1. **Async reliability** — outbox workers, replay, DLQ
2. **Production security** — CSP enforcement, gateway rate limits, Vault
3. **Operational maturity** — CI/CD, observability four pillars, HA/DR
4. **Commercial mechanics** — tenant onboarding, licensing entitlements
5. **API maturity** — dedicated gateway, versioning, API keys, webhooks

**Platform Core v2 does not redesign v1.** It hardens and extends the certified foundation.

---

## Strategic intent

| Dimension     | v1 (certified)         | v2 (target)                   |
| ------------- | ---------------------- | ----------------------------- |
| Deployment    | Internal / validation  | Pilot + enterprise production |
| Events        | In-process             | Worker-processed, replayable  |
| Secrets       | Environment variables  | Vault-compatible store        |
| Security ops  | Console diagnostics    | SOC/SIEM export               |
| Observability | Health endpoints       | Metrics, logs, traces         |
| Commercial    | Manual provisioning    | Automated tenant + license    |
| API           | Next.js route handlers | Gateway layer                 |

---

## Major capabilities (v2 phases)

| Phase       | Capability                    | Business value                       |
| ----------- | ----------------------------- | ------------------------------------ |
| **PCv2-01** | Production SaaS Hardening     | Unblock pilot deployments            |
| **PCv2-02** | Outbox Workers & Event Replay | Reliable async; trust/product events |
| **PCv2-03** | Commercial Provisioning       | SaaS onboarding without manual DB    |
| **PCv2-04** | Vault Integration             | Enterprise secret management         |
| **PCv2-05** | SOC/SIEM Integration          | Security operations compliance       |
| **PCv2-06** | High Availability & DR        | Production SLA                       |
| **PCv2-07** | Observability Stack           | Operator visibility                  |
| **PCv2-08** | Background Workers Platform   | Centralised job infrastructure       |
| **PCv2-09** | API Gateway                   | Versioning, rate limits, API keys    |
| **PCv2-10** | Commercial Licensing          | Entitlements drive governance flags  |

---

## Commercial objectives

1. **Enable pilot customers** — supervised single-org deployments with acceptable risk (PCv2-01).
2. **Enable enterprise self-hosted** — HA, backup, Vault, observability (PCv2-04–07).
3. **Enable SaaS economics** — tenant automation, metering hooks, licensing (PCv2-03, PCv2-10).
4. **Preserve single codebase** — cloud is packaging, not fork.
5. **No premature vertical expansion** — v2 is platform; products consume it.

---

## Implementation priorities

> **Owner-approved sequencing:** PCv2-01 → PCv2-02 → M17 → OSS. See [PCS-001 Owner Approval](./PCS-001-owner-approval.md).

```text
Priority 1 (must-have before OSS):
  PCv2-01 SaaS Hardening
  PCv2-02 Outbox Workers
  M17 CI/CD & E2E (after workers — deploy/test worker infrastructure)

Priority 2 (must-have for enterprise):
  PCv2-04 Vault
  PCv2-07 Observability
  PCv2-09 API Gateway

Priority 3 (must-have for SaaS):
  PCv2-03 Commercial Provisioning
  PCv2-10 Licensing

Priority 4 (enterprise compliance):
  PCv2-05 SOC/SIEM
  PCv2-06 HA/DR
  PCv2-08 Workers Platform (generalisation — may overlap PCv2-02)
```

**OSS productivity integrations** begin after M17 (Waves 1–9 per owner order). **Not approved:** Financial Engine extraction, Banking product.

---

## Success criteria

Platform Core v2 is **strategically complete** when:

| Criterion                 | Measure                                              |
| ------------------------- | ---------------------------------------------------- |
| Pilot ready               | Single supervised customer on self-hosted stack      |
| Workers operational       | Outbox processed; DLQ tested; trust events delivered |
| Security production-grade | CSP enforced; Vault refs; gateway rate limits        |
| Observability live        | Prometheus + Grafana + Loki + correlation IDs        |
| Commercial path clear     | Tenant onboard → product enabled → license checked   |
| Commercial Assessment     | Production tier ≥ **Pilot Ready**                    |
| No v1 regression          | PC-001 certification criteria still pass             |

---

## v2 → v3 bridge

Platform Core **v3** (future strategy cycle) will address:

- Multi-region active-active
- External message bus (NATS/Kafka) as optional backbone
- Marketplace runtime (third-party modules)
- AI agent orchestration platform
- Federated identity across organisations
- Zero-downtime schema migrations at scale

v2 must **not** block v3 — design for replaceable adapters (gateway, bus, secrets).

---

## Dependencies and risks

| Risk                                | Mitigation                                                   |
| ----------------------------------- | ------------------------------------------------------------ |
| Scope creep into product features   | Phase gates; sprint guides per PCv2 phase                    |
| v2 delayed by product pressure      | PC-001 stop condition; owner approval per phase              |
| Worker complexity                   | Start with outbox only; generalise in PCv2-08                |
| OSS integration before v2 hardening | PCS-001 sequencing: PCv2-01 before productivity integrations |

---

## References

- [Platform Core Strategy](./APZHUB-Platform-Core-Strategy.md)
- [Engineering Roadmap](./APZHUB-Engineering-Roadmap.md)
- [PC-001 Certification](../reviews/APZHUB-Platform-Core-Certification.md)
- [Platform Core v2 Roadmap](../roadmap/APZHUB-Platform-Core-v2-Roadmap.md)
