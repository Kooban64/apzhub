# APZ Law Platform — Compatibility Statement (Planning)

> **Programme:** APZ-LAW-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Status:** Planning baseline — not a Production SemVer compatibility claim

---

## Current disk baseline

| Component                     | Version / status         | Notes                                                    |
| ----------------------------- | ------------------------ | -------------------------------------------------------- |
| `@apzhub/integration-sdk`     | **1.0.0**                | Architecture Frozen (platform)                           |
| `@apzhub/law-platform`        | **1.0.0**                | Product application                                      |
| `@apzhub/legal-business-core` | **1.0.0**                | Domain package                                           |
| `services/legal-platform`     | **1.0.0**                | Service manifests                                        |
| LAW OpenAPI                   | `LAW-OpenAPI-v1.yaml`    | Spec + collections                                       |
| Platform Core packages        | Consumed by law-platform | Workbench, Auth, ENF, Knowledge, Activity, Governance, … |
| Financial Engine              | **Deferred**             | FIN-001                                                  |
| External court/DMS adapters   | **ABSENT** (Release 1.0) | Post-1.0 themes                                          |

---

## Release 1.0 compatibility rules (future packaging)

1. Law UI → APZHUB APIs / platform services only — no Module → Connector/DB bypass.
2. Breaking Law OpenAPI / public HTTP requires Major SemVer + Owner Approval.
3. Core Law SoR remains native — do not silently replace with Plane/Zammad.
4. Financial Engine extraction is a **separate** programme (FIN-001 deferred) — not a silent patch to **1.0.0**.
5. Introducing court e-filing / external DMS / Email SoR is a **new** programme.
6. Other Production products unaffected by this planning pack.
7. Host coexistence: Law app port **3301** — respect ENVIRONMENT.md.

---

## This programme

Documentation only — **no** package or API version changes.
