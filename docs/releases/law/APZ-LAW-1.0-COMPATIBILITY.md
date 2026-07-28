# APZ Law Platform 1.0.0 — Compatibility Statement

> **Release:** APZ Law Platform **1.0.0**  
> **Programme:** APZ-LAW-002  
> **Status:** Certification filed — **ACCEPTED / CLOSED**  
> **Date:** 2026-07-19

---

## Baseline

| Component                                               | Version / status                | Notes                              |
| ------------------------------------------------------- | ------------------------------- | ---------------------------------- |
| `@apzhub/integration-sdk`                               | **1.0.0**                       | Architecture Frozen                |
| `@apzhub/law-platform`                                  | **1.0.0**                       | Product application                |
| `@apzhub/legal-business-core`                           | **1.0.0**                       | Domain package                     |
| `services/legal-platform`                               | **1.0.0**                       | Service + law-* manifests          |
| LAW OpenAPI                                             | `LAW-OpenAPI-v1.yaml` **1.0.0** | Spec + collections                 |
| BetterAuth / platform-identity / platform-authorization | Consumed                        | OBS-LAW-01 closed (APZHUB-1.1-001) |
| Trust Accounting                                        | LAW-015 closed                  | In-product capability              |
| Financial Engine                                        | **Deferred**                    | FIN-001                            |
| Email SoR                                               | **ABSENT**                      | Excluded from Release 1.0          |
| Court e-filing / external DMS adapters                  | **ABSENT**                      | Post-1.0                           |

---

## Compatibility rules

1. Law UI → APZHUB APIs / platform services only — no Module → Connector/DB bypass.
2. Breaking Law OpenAPI / public HTTP requires Major SemVer + Owner Approval.
3. Core Law SoR remains native — do not silently replace with Plane/Zammad.
4. Financial Engine extraction is a **new** programme — not a Patch to **1.0.0**.
5. Introducing Email SoR / court e-filing / external DMS is a **new** programme.
6. Host coexistence: Law app port **3301** — respect ENVIRONMENT.md.
7. Other Production products are unaffected by this packaging.

---

## Consumers

| Consumer                             | Expectation                          |
| ------------------------------------ | ------------------------------------ |
| Law Platform app                     | Native SoR + Workbench domains       |
| Platform Search / Knowledge          | In-app legal search patterns         |
| Future Workflow automations          | Optional; not required for Law 1.0.0 |
| APZ Documents / Analytics / Projects | Boundary adjacency only              |
