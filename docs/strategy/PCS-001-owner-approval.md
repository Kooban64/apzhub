# PCS-001 — Owner Approval & Sequencing Amendments

> **Date:** 2026-07-08  
> **Authority:** Owner direction following PCS-001 strategy review  
> **Status:** **APPROVED** — PCS-001 strategy ratified with sequencing adjustments

---

## Approvals granted

| Decision | Status |
|----------|--------|
| **PCS-001 Platform Core Strategy** | ✅ **Approved** — master strategy ratified (Very Good 8.5/10) |
| **PCv2-01 Production SaaS Hardening** | ✅ **Approved to proceed** — first implementation milestone |
| **Financial Engine extraction** | ❌ **Not approved** — remain deferred per FIN-001 |
| **Banking** | ❌ **Not approved** |
| **Exchange expansion** | ❌ **Not approved** |
| **Additional vertical products** | ❌ **Not approved** |

---

## Owner strategic endorsements

The owner endorses these PCS-001 decisions as particularly strong:

1. **Self-hosted first, cloud optional** — enterprise flexibility with managed SaaS path later.
2. **Platform-owned IAM, authorization, governance, and Workbench** — consistent foundation for all products.
3. **Tiered OSS integration** — immediate value without overwhelming the platform.
4. **Financial Engine extraction deferred** — until production evidence justifies a shared capability.

---

## Sequencing amendment (authoritative)

PCS-001 originally recommended:

```text
PCv2-01 → M17 → PCv2-02 → OSS integrations
```

**Owner-approved sequencing:**

```text
PCv2-01  Production SaaS Hardening
    ↓
PCv2-02  Background Workers & Outbox
    ↓
M17      CI/CD, Release Engineering & E2E Automation
    ↓
OSS Phase 1  (return to original APZHUB productivity vision)
```

**Rationale:** Background workers unlock search projections, notifications, scheduled jobs, provisioning, and reporting. CI/CD is more valuable once workers exist and must be deployed and tested. OSS integrations (Plane, Kimai, Paperless) depend on this operational infrastructure.

This amendment **supersedes** conflicting sequencing in PCS-001 draft documents.

---

## OSS integration waves (authoritative)

After PCv2-02, pivot to the original productivity platform vision. Integration order:

| Wave | Integration | APZHUB name | Reason |
|------|-------------|-------------|--------|
| **1** | Plane | Projects | Central project and work management |
| **2** | Kimai | Time Tracking | Time recording tied to projects and billing |
| **3** | Paperless-ngx | Documents | Document management and workflows |
| **4** | Zammad | Support | Service desk integrated with users, projects, documents |
| **5** | Kiwi TCMS | Testing | QA and testing linked to projects |
| **6** | Metabase | Analytics | Analytics across platform data |
| **7** | n8n | Automation | Automation connecting platform capabilities |
| **8** | Grafana / Prometheus / Loki | Observability | Operations visibility |
| **9** | Greenbone / MobSF / Faraday | Security Ops | Enterprise security operations |

**Gate:** OSS Wave 1 begins only after **M17** (or minimum CI worker deployment coverage) is complete.

---

## Strategic direction (owner statement)

> APZHUB has transitioned from a project into a genuine platform. The next phase is no longer about adding capabilities indiscriminately; it is about making the platform resilient, operationally mature, and ready to support both the internal productivity vision and future commercial products.

---

## Next milestone

**PCv2-01 — Production SaaS Hardening** — authorized to begin upon approved sprint guide.

---

## References

- [Platform Core Strategy](./APZHUB-Platform-Core-Strategy.md)
- [Engineering Roadmap](./APZHUB-Engineering-Roadmap.md)
- [OSS Integration Strategy](./APZHUB-OSS-Integration-Strategy.md)
- [PCS-001 Completion Report](../sprint/PCS-001-completion-report.md)
