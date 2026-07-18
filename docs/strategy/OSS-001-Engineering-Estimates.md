# OSS-001 Engineering Estimates

**Milestone:** OSS-001  
**Type:** Planning estimates — not commitments  
**Unit:** Person-weeks (1 FTE); ranges include manifest, adapter, service, module, tests, docs

---

## Summary by wave

| Wave                | Product(s)                   | Low     | High    | Confidence                    |
| ------------------- | ---------------------------- | ------- | ------- | ----------------------------- |
| 1                   | Plane → Projects             | 24      | 32      | Medium — pattern-setting      |
| 2                   | Kimai → Time Tracking        | 16      | 24      | Medium                        |
| 3                   | Paperless → Documents        | 20      | 28      | Medium                        |
| 4                   | Zammad → Support             | 16      | 24      | Medium                        |
| 5                   | Quality Engineering (native) | 20      | 28      | Medium — QE-001–QE-015 phased |
| 6                   | Metabase → Analytics         | 16      | 24      | Medium                        |
| 7                   | n8n → Automation             | 20      | 28      | Low                           |
| 8                   | Grafana/Prometheus/Loki      | 16      | 24      | Medium                        |
| 9                   | Greenbone/MobSF/Faraday      | 24      | 32      | Low                           |
| **Total OSS waves** |                              | **164** | **236** |                               |

---

## OSS-001 planning (this milestone)

| Activity                  | Estimate      |
| ------------------------- | ------------- |
| Architecture & catalog    | 2 weeks       |
| Standards & risk register | 1 week        |
| Review & certification    | 0.5 weeks     |
| **OSS-001 total**         | **3.5 weeks** |

---

## Per-wave breakdown (Wave 1 example)

| Workstream                          | Person-weeks |
| ----------------------------------- | ------------ |
| `integration.yaml` + adapter        | 6–8          |
| `ProjectService` + tests            | 6–8          |
| `projects` module + workbench       | 6–8          |
| Search/notify/activity registration | 2–3          |
| Provisioning + governance           | 2–3          |
| E2E + docs + ops                    | 2–4          |

---

## Dependencies affecting estimates

| Dependency           | Impact                                      |
| -------------------- | ------------------------------------------- |
| PCv2-02 workers      | -4 pw sync rework if missing                |
| M17 CI               | +2 pw manual QA per wave without CI         |
| Vault (PCv2-04)      | +1 pw credential hardening per wave         |
| Law Platform linking | +2–4 pw per wave for cross-product features |

---

## Staffing recommendation

| Phase            | Team                                     |
| ---------------- | ---------------------------------------- |
| OSS-101 (Wave 1) | 2 platform engineers + 1 QA              |
| Waves 2–4        | 2 platform engineers (parallel after W1) |
| Waves 5–7        | 1–2 engineers per wave                   |
| Waves 8–9        | 1 ops engineer + 1 security engineer     |

---

## Related

- [OSS Wave Roadmap](./APZHUB-OSS-Wave-Roadmap.md)
- [OSS-001 Acceptance Criteria](./OSS-001-Acceptance-Criteria.md)
