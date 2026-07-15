# APZHUB OSS Integration Risk Register

**Milestone:** OSS-001  
**Status:** Planning risk register — update per wave

---

## Risk legend

| Severity | Meaning |
|----------|---------|
| Critical | Blocks wave or causes data/security breach |
| High | Major delay or architectural compromise |
| Medium | Manageable with mitigation |
| Low | Monitor |

---

## Strategic risks

| ID | Risk | Severity | Mitigation |
|----|------|----------|------------|
| OSS-R01 | OSS-101 starts before PCv2-02 workers | High | Enforce gate: outbox required for sync adapters |
| OSS-R02 | OSS-101 starts before M17 CI | High | Enforce gate: no wave without CI |
| OSS-R03 | Platform Core modified during OSS waves | High | Separate PR review; architecture compliance gate |
| OSS-R04 | Engine UI exposed to users | Critical | SSO-only; forward-auth; embed controls |
| OSS-R05 | Adapter bypasses Platform Service | Critical | Architecture compliance tests per wave |

---

## Technical risks

| ID | Risk | Severity | Mitigation |
|----|------|----------|------------|
| OSS-T01 | Plane CE API breaking changes | Medium | Version pin; contract tests |
| OSS-T02 | Kimai multi-tenant model mismatch | Medium | Dedicated customer per platform tenant |
| OSS-T03 | Paperless storage scale | Medium | S3-compatible backend; quota governance |
| OSS-T04 | Metabase AGPL embed restrictions | Medium | Legal review; Superset fallback |
| OSS-T05 | n8n fair-code license | Medium | Self-hosted sustainable license review |
| OSS-T06 | Zammad email deliverability | Medium | Platform SMTP governance |
| OSS-T07 | Kiwi XML-RPC deprecation | — | **N/A — Kiwi superseded by OSS-002** |
| OSS-T08 | Grafana/Prometheus ops complexity | Medium | Wave 8 after product waves; runbooks |
| OSS-T09 | Security scanner false positives | Medium | Masked findings; admin-only UI |
| OSS-T10 | Cross-engine sync conflicts | High | Platform IDs authoritative; idempotent sync |

---

## Operational risks

| ID | Risk | Severity | Mitigation |
|----|------|----------|------------|
| OSS-O01 | Engine downtime invisible to operators | Medium | Connector health in control plane |
| OSS-O02 | Backup gaps per engine | Medium | Per-product DR in catalog |
| OSS-O03 | Credential sprawl | High | Vault (PCv2-04); no secrets in repo |
| OSS-O04 | Upgrade cascade across 9 engines | Medium | Independent version pins per adapter |

---

## Compliance risks

| ID | Risk | Severity | Mitigation |
|----|------|----------|------------|
| OSS-C01 | Tenant data in wrong engine scope | Critical | Membership validation + adapter scoping |
| OSS-C02 | Engine roles visible in UI | High | Role translation; Document 002 enforcement |
| OSS-C03 | Audit gap on adapter actions | Medium | Central audit in Platform Service |

---

## Wave-specific top risks

| Wave | Top risk | ID |
|------|----------|-----|
| 1 Plane | Pattern validation failure delays all waves | OSS-R01, OSS-R05 |
| 2 Kimai | Billing/time linkage complexity | OSS-T10 |
| 3 Paperless | Storage and OCR scale | OSS-T03 |
| 5 Quality Engineering | Native build scope; worker dependency | OSS-R01, QE backlog |
| 6 Metabase | License/embed | OSS-T04 |
| 7 n8n | Workflow security | OSS-C03 |
| 8 Observability | Operational complexity | OSS-T08 |
| 9 Security | Finding data leakage | OSS-C01 |

---

## Related

- [Platform Technical Debt Register](../architecture/APZHUB-Platform-Technical-Debt-Register.md)
- [OSS Integration Master Plan](../strategy/OSS-001-APZHUB-OSS-Integration-Master-Plan.md)
