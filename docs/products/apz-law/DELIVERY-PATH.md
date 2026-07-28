# APZ Law Platform — Delivery Path Determination

> **Programme:** APZ-LAW-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Standard:** [Platform Delivery Standard](../../engineering/platform-delivery/PLATFORM-DELIVERY-STANDARD.md)  
> **Authority:** Repository evidence only — no conversation history

---

## Question

Is APZ Law Platform:

1. An **existing platform / product capability** requiring **commercial packaging**, or
2. A **new product** requiring the **full Platform Delivery Standard lifecycle** (foundation → information model → … → workbench)?

---

## Verdict

# Existing Platform → Commercial Packaging

| Criterion                   | Evidence                                                                                                              | Implication                                                     |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Primary commercial vertical | [PRODUCT-CATALOGUE](../../foundation/PRODUCT-CATALOGUE.md) — Law Platform = **Primary commercial offering**           | Not an exploratory greenfield concept                           |
| Engineering programmes      | **LAW-001…015 closed** (Foundation completion · PRODUCT-CATALOGUE · PROJECT-BIBLE)                                    | Vertical already delivered                                      |
| Application on disk         | `apps/law-platform` · `@apzhub/law-platform` **1.0.0**                                                                | Product app exists                                              |
| Domain package              | `@apzhub/legal-business-core` **1.0.0**                                                                               | Shared legal domain types present                               |
| Service manifests           | `services/legal-platform/service.yaml` **1.0.0** + law-* module manifests                                             | Registry/manifest surface present                               |
| Domains                     | Matters · Clients · Documents · Tasks · Time · Billing · Calendar · Trust (LAW-015)                                   | Capability inventory on disk                                    |
| API specification           | `docs/specs/LAW-OpenAPI-v1.yaml` + Bruno/Postman collections                                                          | Contract surface documented                                     |
| Architecture                | Law Platform Reference Architecture · Capability Map · Trust ADRs 0036–0039                                           | Architecture corpus present                                     |
| Readiness review            | [APZHUB-Law-Platform-Readiness](../../reviews/APZHUB-Law-Platform-Readiness.md) — **APPROVED FOR PRODUCT VALIDATION** | Validation gate passed historically                             |
| Portfolio Definition Pack   | [docs/products/law/](../law/README.md) — maturity **In Development**                                                  | Commercial Planning layer was incomplete; this pack supplies it |
| Commercial SemVer folder    | **No** `docs/releases/law/`                                                                                           | Gap = **packaging/certification**, not rebuild                  |
| Core SoR                    | Native platform PostgreSQL — **not** Plane/Zammad for core Law                                                        | Native product path                                             |

---

## Honesty caveat (not “frozen Production GA”)

Unlike Documents/TCMS after their **002** packaging programmes, Law is **not** yet on the Portfolio Production SemVer register as commercial **1.0.0** PRWL. Portfolio maturity remains **In Development**. “Existing Platform → Commercial Packaging” means:

- Do **not** restart Platform Foundation → Contracts → Services → HTTP → Workbench as if Law were absent.
- Do **run** Product Certification → Production Release packaging (future programme), re-verifying Known Limitations honestly (placeholder UX, FIN-001 deferral, etc.; OBS-LAW-01/02 closed under APZHUB-1.1-001/002).

“Frozen” applies to **Platform Foundation / Integration SDK** consumption and closed LAW milestones — **not** to a claim that Law is already commercial Production READY without packaging.

---

## Why not Full Platform Delivery Lifecycle

Re-running Commercial Planning → Platform Foundation → Information Model → Provider Integration → Contracts → Services → HTTP → Workbench would **duplicate** closed LAW-001…015 work and the existing `apps/law-platform` vertical, and would conflict with Law’s role as the primary commercial validation product already on disk.

The Platform Delivery Standard still applies: Release 1.0 proceeds via **Product Certification → Production Release** packaging programmes, citing existing phase evidence.

---

## Lifecycle map (current state)

| PDS phase                       | APZ Law Platform status                                                     |
| ------------------------------- | --------------------------------------------------------------------------- |
| Commercial Planning             | **This programme** (`docs/products/apz-law/`)                               |
| Platform Foundation             | **Complete** (platform + Law consumes it; LAW foundation closed)            |
| Information Model / Domain      | **Complete** (`legal-business-core` · OpenAPI · architecture corpus)        |
| Provider Integration            | **N/A for core Law SoR** (native); external court/DMS/accounting = post-1.0 |
| Contracts / domain types        | **Present** (legal-business-core · LAW-OpenAPI-v1)                          |
| Platform Services / manifests   | **Present** (`services/legal-platform`)                                     |
| Product application / Workbench | **Present** (`apps/law-platform` + law-* manifests)                         |
| Product Certification           | **Pending** commercial programme                                            |
| Production Release              | **Pending** SemVer evidence folder (`docs/releases/law/`)                   |

---

## Authorised next direction (planning only)

After Owner Acceptance of APZ-LAW-001, recommend a named **packaging/certification** programme (e.g. APZ-LAW-002) — not Foundation re-implementation, not Financial Engine extraction (FIN-001 deferred), not unauthorised feature expansion.
