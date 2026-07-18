# Product Engineering Handbook

> **Programme:** APZHUB-PRODUCTS-000  
> **Audience:** Owners, architects, engineers, AI agents  
> **Related:** [PRODUCT-LIFECYCLE](./PRODUCT-LIFECYCLE.md) · [Phase 3 Directive](../foundation/APZHUB-PHASE-3-Product-Engineering-Commencement.md) · [ENGINEERING-HANDBOOK](../foundation/ENGINEERING-HANDBOOK.md)

---

## 1. Purpose

This handbook is the day-to-day guide for building APZHUB products on the completed Platform Foundation. It complements the Knowledge Foundation; on conflict about **platform architecture or freezes**, Knowledge Foundation + foundation docs 000–029 win.

---

## 2. Primary objective

Deliver **high-value business products** that consume Platform Services and respect frozen architecture.

Preferred order of work:

```text
Product capability
  → Platform extension (only when required)
  → Certification
  → Release
```

---

## 3. Product portfolios

| #   | Portfolio    | Path                       |
| --- | ------------ | -------------------------- |
| 1   | Projects     | `docs/products/projects/`  |
| 2   | Time         | `docs/products/time/`      |
| 3   | Support      | `docs/products/support/`   |
| 4   | Documents    | `docs/products/documents/` |
| 5   | Analytics    | `docs/products/analytics/` |
| 6   | Workflow     | `docs/products/workflow/`  |
| 7   | Law Platform | `docs/products/law/`       |

---

## 4. Standard product documentation set

Every product **shall** maintain (when the product programme is active):

| Document               | Purpose                                              |
| ---------------------- | ---------------------------------------------------- |
| `README.md`            | Product entry / status                               |
| `VISION.md`            | Why the product exists                               |
| `ROADMAP.md`           | Phased product intent (not invented programme IDs)   |
| `ARCHITECTURE.md`      | Product architecture (extends platform; no redesign) |
| `CAPABILITIES.md`      | User-facing capabilities                             |
| `INTEGRATIONS.md`      | Engines/adapters (engine names internal only)        |
| `BACKLOG.md`           | Product backlog index                                |
| `ADR-INDEX.md`         | Product-scoped and related ADRs                      |
| `RELEASES.md`          | Release history                                      |
| `KNOWN-LIMITATIONS.md` | Explicit limits / PRWL notes                         |

See [PRODUCT-DOCUMENT-MAP](./PRODUCT-DOCUMENT-MAP.md).

---

## 5. Engineering rules (mandatory)

Every product must:

| Rule                                  | Detail                                                                      |
| ------------------------------------- | --------------------------------------------------------------------------- |
| Bootstrap via **AI-MANIFEST**         | [docs/foundation/AI-MANIFEST.md](../foundation/AI-MANIFEST.md)              |
| Respect frozen architecture           | No redesign without ADR + Owner                                             |
| Consume **Platform Services**         | Canonical client API — never call connectors/engines from modules           |
| Never bypass **governance**           | Enablement / flags via platform governance                                  |
| Never bypass **provisioning**         | Product activation via platform provisioning flows                          |
| Never modify **SDK public contracts** | Integration SDK **1.0.0** Architecture Frozen — STOP + ADR if change needed |
| Follow **ADR discipline**             | Product and platform decisions recorded                                     |
| Repository first                      | Disk + KF override conversation history                                     |
| Owner gates                           | No implementation without Owner Approval                                    |

Layer path (unchanged):

```text
Module → Platform Service → Service Connector → Backend Engine
```

---

## 6. Programme shape

Every product programme should identify:

- **Product** (portfolio)
- **Business value**
- **Platform dependencies**
- **ADR dependencies**
- **Acceptance criteria**

Platform-only enhancement programmes are **exceptional** (product need, ops necessity, or ADR + Owner).

Lifecycle: [PRODUCT-LIFECYCLE](./PRODUCT-LIFECYCLE.md) · Certification: [PRODUCT-CERTIFICATION-STANDARD](./PRODUCT-CERTIFICATION-STANDARD.md).

---

## 7. Relationship to Knowledge Foundation

| Concern                                                    | Authority                                               |
| ---------------------------------------------------------- | ------------------------------------------------------- |
| Platform freezes, SoRs, SDK, constitution                  | Knowledge Foundation / docs 000–029                     |
| Product vision, roadmap, product backlog, product releases | Product Engineering Framework (`docs/products/`)        |
| Where development stops / authorised programme             | [CURRENT-MILESTONE](../foundation/CURRENT-MILESTONE.md) |
| AI bootstrap                                               | [AI-MANIFEST](../foundation/AI-MANIFEST.md)             |

---

## 8. Stop conditions

- Do not invent product programme IDs or milestones.
- Do not implement until Owner Approval.
- Do not recommend the next product until Owner Acceptance of the current programme.
