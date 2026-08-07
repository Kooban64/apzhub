# APZHUB — Architecture Atlas

| Field       | Value                             |
| ----------- | --------------------------------- |
| Programme   | **APZHUB-PORTFOLIO-BASELINE-001** |
| Status      | **IN FORCE**                      |
| Timestamp   | 20260805T203000Z                  |
| Kind        | Architectural table of contents   |
| Engineering | **NONE**                          |

## Purpose

Navigational document: where things live, who owns what, how products relate, and how the platform should evolve.  
Start here; follow links to governing artefacts.

---

## 1. Start here

| Question                                | Document                                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------------------------ |
| What is APZHUB today?                   | [APZHUB-ENTERPRISE-PORTFOLIO-BASELINE.md](./APZHUB-ENTERPRISE-PORTFOLIO-BASELINE.md)             |
| Which products exist and what are they? | [APZHUB-PRODUCT-CATALOGUE.md](./APZHUB-PRODUCT-CATALOGUE.md)                                     |
| How are layers stacked?                 | [APZHUB-ENTERPRISE-LAYER-MODEL.md](./APZHUB-ENTERPRISE-LAYER-MODEL.md)                           |
| What is frozen vs planned?              | [APZHUB-PORTFOLIO-ROADMAP.md](./APZHUB-PORTFOLIO-ROADMAP.md)                                     |
| Which business domains guide growth?    | [APZHUB-ENTERPRISE-DOMAIN-STRATEGY.md](./APZHUB-ENTERPRISE-DOMAIN-STRATEGY.md)                   |
| How do we choose the next domain?       | [APZHUB-DOMAIN-SELECTION-METHOD.md](./APZHUB-DOMAIN-SELECTION-METHOD.md)                         |
| Which RI numbers apply?                 | [APZHUB-PORTFOLIO-REFERENCE-IMPLEMENTATIONS.md](./APZHUB-PORTFOLIO-REFERENCE-IMPLEMENTATIONS.md) |

Programme packs: … · [../apzknowledge/](../apzknowledge/) (**RI #008**) · [../apz-knowledge-native-001/](../apz-knowledge-native-001/) (**FROZEN**)

---

## 2. Where things live (documentation)

| Concern                        | Location                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| Constitution / foundation docs | `docs/` foundation set (000–029)                                                      |
| Product Engineering Framework  | [./](./) (`docs/products/framework/`)                                                 |
| Enterprise Operating Model     | [../apzhub-portfolio-001/](../apzhub-portfolio-001/)                                  |
| APZQEP                         | [../apzqep/](../apzqep/)                                                              |
| Product mission / ops packs    | `docs/products/apz{product}/` and native programmes `docs/products/apz-*-native-001/` |
| Platform applications          | `apps/web`, `apps/law-platform`, …                                                    |
| Platform packages / services   | `packages/`, `services/`, `modules/`, `adapters/`                                     |

---

## 3. Who owns what

| Concern                               | Owner                                                  |
| ------------------------------------- | ------------------------------------------------------ |
| Platform identity, permissions, shell | APZHUB Platform                                        |
| Quality / release decisions           | **APZQEP**                                             |
| Work effort SoR                       | APZ Time                                               |
| Service case SoR                      | APZ Support                                            |
| Project delivery SoR                  | APZ Projects                                           |
| Information lifecycle SoR             | APZ Documents                                          |
| Business process intent SoR           | APZ Workflow                                           |
| Decision support (no SoR)             | APZ Analytics                                          |
| APZHUB governance SoR                 | APZ Law                                                |
| Implementation engines                | Adapters / connectors — **never user-facing identity** |
| Portfolio sequencing                  | Product Board / Owner                                  |
| Lane 1 platform change                | Evidence → Board / Owner Auth                          |

---

## 4. How products relate

```text
                    ┌─────────────┐
                    │  APZ Law    │  governs obligations (by reference)
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   APZ Analytics     APZ Workflow      APZ Documents
   (decides)         (intent)          (information)
         │                 │                 │
         └────────────┬────┴────────┬────────┘
                      ▼             ▼
               APZ Projects   APZ Support
                      │             │
                      └──────┬──────┘
                             ▼
                         APZ Time
```

APZQEP wraps quality for every change. Foundation provides identity and shell for every product.

---

## 5. How the platform should evolve

| Do                                                       | Do not                                                      |
| -------------------------------------------------------- | ----------------------------------------------------------- |
| Start from the Portfolio Baseline                        | Invent a parallel architecture narrative                    |
| Score domain(s) → Owner Auth → Mission → Native Adoption | Add silent products or product-first expansion              |
| Keep engines invisible                                   | Expose engine brands as product identity                    |
| Use APZQEP for every change                              | Create product-private quality systems                      |
| Keep Lane 1 evidence-driven                              | Use portfolio delivery to force platform redesign           |
| Preserve frozen identities                               | Collapse products into portals / dashboards / practice SaaS |

---

## 6. Quick links by audience

| Audience      | First reads                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------- |
| Executive     | Baseline · Domain Strategy · Layer Model · Portfolio Roadmap · Operating Model               |
| Product Owner | Domain Catalogue · Product Catalogue · RI map · Playbook · Business Roadmap                  |
| Architect     | Baseline · Domain Strategy · Layer Model · Atlas · Constitution 000 · Architecture standards |
| Developer     | Atlas · Product Catalogue · relevant RI / native pack · Playbook · APZQEP checklists         |
| QA / Ops      | APZQEP · product ops packs · Operational Metrics / Learning                                  |

---

## 7. Related governing faces

| Face                    | Path                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------ |
| Portfolio Baseline      | [APZHUB-ENTERPRISE-PORTFOLIO-BASELINE.md](./APZHUB-ENTERPRISE-PORTFOLIO-BASELINE.md) |
| Domain Strategy         | [APZHUB-ENTERPRISE-DOMAIN-STRATEGY.md](./APZHUB-ENTERPRISE-DOMAIN-STRATEGY.md)       |
| Domain Selection Method | [APZHUB-DOMAIN-SELECTION-METHOD.md](./APZHUB-DOMAIN-SELECTION-METHOD.md)             |
| Working model           | [APZHUB-WORKING-MODEL.md](./APZHUB-WORKING-MODEL.md)                                 |
| Current operating state | [APZHUB-CURRENT-OPERATING-STATE.md](./APZHUB-CURRENT-OPERATING-STATE.md)             |
| Operational backbone    | [APZHUB-OPERATIONAL-BACKBONE.md](./APZHUB-OPERATIONAL-BACKBONE.md)                   |
| Productivity Core       | [APZHUB-ENTERPRISE-PRODUCTIVITY-CORE.md](./APZHUB-ENTERPRISE-PRODUCTIVITY-CORE.md)   |
| Governance Layer        | [APZHUB-ENTERPRISE-GOVERNANCE-LAYER.md](./APZHUB-ENTERPRISE-GOVERNANCE-LAYER.md)     |
| Adoption Playbook       | [APZHUB-PRODUCT-ADOPTION-PLAYBOOK.md](./APZHUB-PRODUCT-ADOPTION-PLAYBOOK.md)         |
| Two-lane model          | [APZHUB-TWO-LANE-OPERATING-MODEL.md](./APZHUB-TWO-LANE-OPERATING-MODEL.md)           |
