# APZHUB Certification Lifecycle

> **Programme:** APZHUB-GOVERNANCE-001  
> **Classification:** DOCUMENTATION ONLY  
> **Authority:** [PRODUCT-CERTIFICATION-STANDARD](../products/PRODUCT-CERTIFICATION-STANDARD.md) · Document 015 · Integration SDK / vertical cert programmes  
> **Date:** 2026-07-19

---

## Purpose

Define lifecycle stages for **certification** of repository, platform slices, integrations, and products — for dashboard Programme / Quality / Certification sections.

---

## 1. Certification kinds

| Kind                   | Examples                                                        |
| ---------------------- | --------------------------------------------------------------- |
| Repository QA          | QA-002 PRODUCTION READY                                         |
| Integration adapter    | Plane Wave 1, Zammad CWL, Kimai CERTIFIED_DOMAIN, n8n Reference |
| Platform vertical      | Identity / Search / Metrics / Support vertical waves            |
| Product UI / Workbench | OSS-110-14 Support UI, Projects 1.1 Playwright cert             |
| Product release        | Projects 1.1.0 / Time 1.0.0 release acceptance                  |
| Architecture freeze    | OSS-100-11 SDK freeze notice                                    |

---

## 2. Lifecycle states

```text
NOT_STARTED
  → IN_PROGRESS
  → CERTIFIED | CERTIFIED_WITH_LIMITATIONS | PRODUCTION_READY[_WITH_LIMITATIONS]
  → (optional) EXPIRED → IN_PROGRESS (re-cert)
  → (exceptional) REVOKED
```

Statuses: [PORTFOLIO-STATUS-MODEL §8](./PORTFOLIO-STATUS-MODEL.md).

---

## 3. Stage gates

| Stage             | Entry criteria                          | Exit artefacts               |
| ----------------- | --------------------------------------- | ---------------------------- |
| NOT_STARTED       | Capability exists or planned            | —                            |
| IN_PROGRESS       | Owner-approved cert programme / sprint  | Audit scripts, test plans    |
| CERTIFIED*        | Audits + tests PASS; limitations honest | Completion Report + cert doc |
| PRODUCTION_READY* | Repo-wide or product QA bar met         | QA / release Acceptance      |
| EXPIRED           | Refresh policy triggered (future)       | Re-cert programme            |
| REVOKED           | Owner decision                          | ADR / Acceptance note        |

---

## 4. Limitations honesty

Certification **with limitations** is valid Production when:

1. Limitations listed in product/integration KNOWN-LIMITATIONS or cert report
2. Dashboard shows `CERTIFIED_WITH_LIMITATIONS` / `PRODUCTION_WITH_LIMITATIONS` — never silent `CERTIFIED`
3. Freeze notices remain linked

---

## 5. Dashboard fields (Certification)

| Field             | Description                                            |
| ----------------- | ------------------------------------------------------ |
| `certificationId` | Programme or cert name                                 |
| `kind`            | repository / integration / vertical / product / freeze |
| `status`          | Enum §2                                                |
| `version`         | Package or product SemVer certified                    |
| `evidenceUri`     | Path to completion / cert report                       |
| `limitationsUri`  | Optional                                               |
| `acceptedAt`      | Owner Acceptance date                                  |
| `health`          | Derived traffic light                                  |

---

## 6. Relationship to releases

Product Release Owner Acceptance **implies** certification evidence filed ([RELEASE-GOVERNANCE-CHECKLIST](../releases/RELEASE-GOVERNANCE-CHECKLIST.md)).  
Certification alone does **not** create a SemVer Product Release.

---

## Related

- [PROGRAMME-LIFECYCLE.md](./PROGRAMME-LIFECYCLE.md)
- [REPOSITORY-HEALTH-MODEL.md](./REPOSITORY-HEALTH-MODEL.md)
