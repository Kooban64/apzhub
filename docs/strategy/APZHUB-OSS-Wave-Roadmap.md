# APZHUB OSS Wave Roadmap

**Milestone:** OSS-001 (amended by OSS-002)  
**Status:** Owner-approved wave sequencing  
**Prerequisite gates:** Platform Core v2 certified · PCv2-02 Workers · M17 CI/CD

---

## Implementation sequencing

```text
Phase 0 — COMPLETE
  PCv2-01 (PRH-001–PRH-011) Platform Core v2 certification
  OSS-001  OSS Integration Master Plan
  OSS-002  Capability Abstraction Standard
  OSS-101  Projects / Plane integration planning

Phase 1 — REQUIRED BEFORE OSS-101-01 IMPLEMENTATION
  PCv2-02  Background workers & outbox
  M17      CI/CD automation

Phase 2 — Capability Waves
  OSS-100   Platform Integration SDK architecture COMPLETE
  OSS-100-01…10  @apzhub/integration-sdk implementation
  OSS-101  Wave 1 planning COMPLETE
  OSS-101-02 Plane environment & configuration COMPLETE
  OSS-101-03 Projects capability manifest COMPLETE
  OSS-101-04…10  Plane → Projects COMPLETE (Reference Adapter certified)
  OSS-102  Wave 2  Zammad → Support (discovery OSS-102-01 COMPLETE; implementation pending approval)
  OSS-201  Wave 3  Kimai → Time Tracking (historical numbering retained in estimates)
  OSS-301  Wave 4  Paperless-ngx → Documents
  OSS-401  (superseded numbering) — Zammad resequenced to OSS-102 Wave 2 by owner
  QE-001   Wave 5  APZHUB Quality Engineering Platform (native)
  OSS-601  Wave 6  Metabase → Analytics
  OSS-701  Wave 7  n8n → Automation
  OSS-801  Wave 8  Grafana / Prometheus / Loki
  OSS-901  Wave 9  Greenbone / MobSF / Faraday

Phase 3 — Future
  AI connectors (governed — separate roadmap)
```

---

## Wave dependency graph

| Wave                  | Depends on                                                                  | Enables                       |
| --------------------- | --------------------------------------------------------------------------- | ----------------------------- |
| 1 Plane               | PCv2-02*, M17* (*historical gates; Wave 1 delivered under owner sequencing) | Reference Adapter pattern     |
| 2 Zammad (OSS-102)    | Wave 1 complete                                                             | Support capability            |
| 3 Kimai               | Wave 1                                                                      | Time ↔ Project linking        |
| 4 Paperless           | Wave 1                                                                      | Document ↔ Project linking    |
| 5 Quality Engineering | PCv2-02, M17, Wave 1                                                        | Release gates, CI integration |
| 6 Metabase            | Waves 1–2, QE-009                                                           | Cross-product dashboards      |
| 7 n8n                 | Waves 1–4, QE-008                                                           | Cross-module automation       |
| 8 Observability       | Platform Core                                                               | Monitoring for all connectors |
| 9 Security Ops        | Wave 8                                                                      | Security scan observability   |

**Owner amendment (2026-07-10):** Zammad / Support is **Wave 2 via OSS-102**, immediately after Plane Reference Adapter certification. Historical documents that list Zammad as Wave 4 (OSS-401) are superseded for sequencing; effort estimates may still reference OSS-401 IDs until revised.

**OSS-002 note:** Wave 5 is a **native APZHUB capability** — not an OSS integration. Delivery via QE-001–QE-015.

---

## Per-wave deliverables

### OSS waves (OSS-1xx through OSS-9xx, excluding Wave 5)

1. `integration.yaml` manifest (026)
2. `service.yaml` Platform Service manifest (027)
3. `module.yaml` module manifest (025) — except operator/security tiers
4. Integration adapter with health probe
5. Search + notification + activity registration
6. Operations control plane capability entry
7. Contract tests + integration tests + Playwright smoke
8. Wave completion report

### Wave 5 — Quality Engineering (native)

1. `service.yaml` + `module.yaml` (no `integration.yaml`)
2. `QualityEngineeringService` per [Capability Abstraction Standard](../architecture/APZHUB-Capability-Abstraction-Standard.md)
3. Platform PostgreSQL SoR
4. Search + notification + activity registration
5. Operations control plane capability entry
6. Phased delivery per [Quality Engineering Backlog](../backlog/APZHUB-Quality-Engineering-Backlog.md)
7. QE-015 production readiness certification

---

## Wave gates (no wave starts without)

| Gate                                           | Applies to           |
| ---------------------------------------------- | -------------------- |
| Approved sprint guide (OSS-1xx+ or QE-xxx)     | All waves            |
| Owner acceptance of prior wave                 | Waves 2–9, QE phases |
| Capability manifests reviewed                  | All waves            |
| OSS-002 abstraction standard compliance        | All capabilities     |
| Security review                                | All waves            |
| Ops runbook updated                            | All waves            |
| No Platform Core modifications unless approved | All waves            |

---

## Timeline (indicative — not commitments)

| Wave                  | Estimated duration          | Cumulative |
| --------------------- | --------------------------- | ---------- |
| 1 Plane               | 6–8 weeks                   | 8 weeks    |
| 2 Kimai               | 4–6 weeks                   | 14 weeks   |
| 3 Paperless           | 5–7 weeks                   | 21 weeks   |
| 4 Zammad              | 4–6 weeks                   | 27 weeks   |
| 5 Quality Engineering | 20–28 weeks (QE-001–QE-015) | 55 weeks   |
| 6 Metabase            | 4–6 weeks                   | 61 weeks   |
| 7 n8n                 | 5–7 weeks                   | 68 weeks   |
| 8 Observability       | 4–6 weeks                   | 74 weeks   |
| 9 Security Ops        | 6–8 weeks                   | 82 weeks   |

See [Quality Engineering Backlog](../backlog/APZHUB-Quality-Engineering-Backlog.md) for QE phase detail.

---

## Stop condition

Wave 1 begins implementation only with **OSS-101-01** owner approval after OSS-101 planning acceptance. Wave 5 begins only with **QE-001** owner approval after OSS-002 acceptance.

---

## Related

- [OSS-001 Master Plan](./OSS-001-APZHUB-OSS-Integration-Master-Plan.md)
- [Capability Abstraction Standard](../architecture/APZHUB-Capability-Abstraction-Standard.md)
- [OSS-101 Backlog](../backlog/OSS-101-Plane-Integration-Backlog.md)
- [OSS-101 Completion Report](../sprint/OSS-101-completion-report.md)
