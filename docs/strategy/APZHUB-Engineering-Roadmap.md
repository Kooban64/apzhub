# APZHUB Engineering Roadmap

> **Milestone:** PCS-001  
> **Status:** Strategic engineering roadmap — planning only  
> **Horizon:** 24 months from strategy approval  
> **Authority:** [Platform Core v2 Roadmap](../roadmap/APZHUB-Platform-Core-v2-Roadmap.md) · [Technical Debt Register](../architecture/APZHUB-Platform-Technical-Debt-Register.md)

---

## Roadmap overview

> **Owner-approved sequencing:** PCv2-01 → PCv2-02 → M17 → OSS Waves 1–9. See [PCS-001 Owner Approval](./PCS-001-owner-approval.md).

```text
2026 H2                          2027 H1                          2027 H2
─────────────────────────────────────────────────────────────────────────
PCv2-01 Hardening → PCv2-02 Workers → M17 CI/CD → OSS Wave 1 (Plane)
                    OSS Wave 2 (Kimai) → Wave 3 (Paperless)
                    OSS Waves 4–7 (Zammad, Kiwi, Metabase, n8n)
                    PCv2-04/07/09 (Vault, observability, gateway)
                                         OSS Wave 8 (Grafana stack)
                                         Enterprise pilot
```

---

## Priority 1: Platform Core v2 (must-have)

| ID   | Initiative                  | Phases  | Effort | Dependency      |
| ---- | --------------------------- | ------- | ------ | --------------- |
| E-01 | Production SaaS Hardening   | PCv2-01 | M      | PC-001, PCS-001 |
| E-02 | Outbox Workers & Replay     | PCv2-02 | L      | E-01            |
| E-03 | API Gateway                 | PCv2-09 | L      | E-01            |
| E-04 | Vault Integration           | PCv2-04 | M      | E-01            |
| E-05 | Observability Stack         | PCv2-07 | L      | E-04            |
| E-06 | Commercial Provisioning     | PCv2-03 | M      | E-02            |
| E-07 | Commercial Licensing        | PCv2-10 | M      | E-06            |
| E-08 | SOC/SIEM Export             | PCv2-05 | M      | E-05            |
| E-09 | HA & DR                     | PCv2-06 | L      | E-05            |
| E-10 | Background Workers Platform | PCv2-08 | L      | E-02            |

---

## Priority 2: Engineering infrastructure

| ID   | Initiative               | Rationale                    | Debt ref   | Gate            |
| ---- | ------------------------ | ---------------------------- | ---------- | --------------- |
| E-11 | GitHub Actions CI        | Automated quality gates      | TD-M16-M02 | After PCv2-02   |
| E-12 | App bootstrap package    | Single `ensurePlatformReady` | TD-M16-C01 | PCv2-01         |
| E-13 | Playwright CI green      | E2E in pipeline              | TD-T04     | M17             |
| E-14 | Pre-commit optimisation  | Faster feedback              | TD-M16-M03 | M17             |
| E-15 | OpenAPI publish pipeline | Integrator onboarding        | TD-T05     | Post OSS Wave 3 |

---

## Priority 3: Platform integrations (OSS)

> **Owner wave order:** Plane → Kimai → Paperless → Zammad → Kiwi → Metabase → n8n → Observability → Security.

| ID   | Initiative               | Engine                  | Wave | Sprint pattern                              |
| ---- | ------------------------ | ----------------------- | ---- | ------------------------------------------- |
| E-20 | Projects integration     | Plane                   | 1    | integration.yaml → adapter → ProjectService |
| E-22 | Time integration         | Kimai                   | 2    | TimeTrackingService                         |
| E-21 | Documents integration    | Paperless-ngx           | 3    | DocumentService                             |
| E-25 | Support integration      | Zammad                  | 4    | SupportService                              |
| E-26 | Testing integration      | Kiwi TCMS               | 5    | TestingService                              |
| E-23 | Analytics integration    | Metabase                | 6    | AnalyticsService                            |
| E-24 | Automation integration   | n8n                     | 7    | AutomationService + action gateway          |
| E-27 | Observability connectors | Grafana/Prometheus/Loki | 8    | Ops connectors                              |
| E-28 | Security ops connectors  | Greenbone/MobSF/Faraday | 9    | Enterprise pack                             |

**Gate:** E-20 starts only after **PCv2-01, PCv2-02, and M17** minimum complete.

---

## Priority 4: Product engineering

| ID   | Initiative                  | Product | Gate                                      |
| ---- | --------------------------- | ------- | ----------------------------------------- |
| E-30 | Trust Phase 2               | Law     | Owner approval; bank feeds deferred       |
| E-31 | Billing saga                | Law     | Payment entity; time→invoice linkage      |
| E-32 | Law production hardening    | Law     | PCv2-01 minimum                           |
| E-33 | Financial Engine extraction | Shared  | FIN-001 preconditions + owner approval    |
| E-34 | Exchange charter            | APZEX   | Owner approval; not before E-01           |
| E-35 | Banking charter             | APZBNK  | Owner approval; not before FIN extraction |

**Explicit stop:** No E-33, E-34, E-35 without owner approval post-PCS-001.

---

## Priority 5: Developer tooling

| ID   | Initiative                      | Description                                         |
| ---- | ------------------------------- | --------------------------------------------------- |
| E-40 | Published SDK packages          | `@apzhub/sdk` npm publish (internal registry first) |
| E-41 | Integration scaffolder CLI      | `integration.yaml` + adapter boilerplate            |
| E-42 | Module scaffolder CLI           | `module.yaml` + workbench boilerplate               |
| E-43 | Architecture compliance checker | CI rule: no connector imports in modules            |
| E-44 | Local stack composer            | Single command dev environment                      |
| E-45 | Deployment guides               | Enterprise install runbooks                         |

---

## Quarterly targets (indicative)

### Q3 2026 (PCS-001 approved)

- PCv2-01 execution (authorized)
- PCv2-01 sprint guide

### Q4 2026

- PCv2-01 complete
- PCv2-02 workers MVP
- PCv2-02 outbox processing for trust/product events

### Q1 2027

- M17 CI/CD + E2E automation
- OSS Wave 1 (Plane) charter
- OSS Wave 2 (Kimai)

### Q2 2027

- OSS Wave 3 (Paperless)
- OSS Waves 4–5 (Zammad, Kiwi)
- PCv2-04/07 parallel as resourced

### Q3–Q4 2027

- OSS Waves 6–8 (Metabase, n8n, observability)
- Enterprise pilot customer
- PCv2-03/10 commercial (as needed)

---

## Resource allocation guidance

| Stream            | Suggested allocation |
| ----------------- | -------------------- |
| Platform Core v2  | 50%                  |
| OSS integrations  | 20%                  |
| Law product       | 25%                  |
| Developer tooling | 5%                   |

Adjust per owner priority. **No new product streams** without charter approval.

---

## Success metrics

| Metric                | Target (12 months)               |
| --------------------- | -------------------------------- |
| CI pipeline           | Green on every PR                |
| Outbox processing     | 100% events delivered within SLA |
| Pilot customers       | ≥1 supervised deployment         |
| OSS integrations live | ≥3 (Projects, Documents, Time)   |
| Platform test count   | Maintain ≥1800; no regression    |
| Debt critical items   | TD-M16-C01 closed                |

---

## First implementation milestone

**PCv2-01 — Production SaaS Hardening** — first code milestone after PCS-001 owner approval.

---

## References

- [Platform Core v2 Strategy](./APZHUB-Platform-Core-v2-Strategy.md)
- [OSS Integration Strategy](./APZHUB-OSS-Integration-Strategy.md)
- [Commercial Roadmap](./APZHUB-Commercial-Roadmap.md)
