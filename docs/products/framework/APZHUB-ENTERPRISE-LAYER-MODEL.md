# APZHUB — Enterprise Layer Model

| Field       | Value                                  |
| ----------- | -------------------------------------- |
| Programme   | **APZHUB-PORTFOLIO-BASELINE-001**      |
| Status      | **IN FORCE**                           |
| Timestamp   | 20260806T092000Z                       |
| Kind        | Permanent enterprise layer description |
| Engineering | **NONE** — reference products only     |

## Purpose

Document the permanent enterprise layers of APZHUB.  
No redesign. Products are referenced, not redefined.

## Permanent stack

```text
Enterprise Organisational Memory
        │
Enterprise Governance
        │
Enterprise Decision Support
        │
Enterprise Business Processes
        │
Enterprise Information
        │
Enterprise Operations
        │
Enterprise Quality
        │
Enterprise Foundation
```

## Layer → product map

| Layer                                | Products                                                            | Notes                                                                    |
| ------------------------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Enterprise Organisational Memory** | APZ Knowledge (RI #008)                                             | Curated memory in context — not wiki/search/AI                           |
| **Enterprise Governance**            | APZ Law (RI #007)                                                   | Obligations, policies, compliance, retention, evidence — APZHUB-internal |
| **Enterprise Decision Support**      | APZ Analytics (RI #006)                                             | Questions → insights → decisions; no SoR                                 |
| **Enterprise Business Processes**    | APZ Workflow (RI #005)                                              | Business intent / journeys                                               |
| **Enterprise Information**           | APZ Documents (RI #004)                                             | Information lifecycle SoR                                                |
| **Enterprise Operations**            | APZ Projects (RI #003) · APZ Support (RI #002) · APZ Time (RI #001) | Delivery, service, effort                                                |
| **Enterprise Quality**               | APZQEP                                                              | Quality / release / evidence for all layers                              |
| **Enterprise Foundation**            | APZHUB Platform                                                     | Identity, shell, platform services, standards                            |

## Grouping for portfolio conversation

| Portfolio grouping               | Layers included                                                  | Status                      |
| -------------------------------- | ---------------------------------------------------------------- | --------------------------- |
| Enterprise Productivity Core     | Decision Support · Business Processes · Information · Operations | **COMPLETE** (RI #001–#006) |
| Enterprise Governance Layer      | Governance                                                       | **OPERATIONAL** (RI #007)   |
| Enterprise Organisational Memory | Organisational Memory                                            | **OPERATIONAL** (RI #008)   |
| Quality & Foundation             | Quality · Foundation                                             | **COMPLETE**                |

## Cross-layer rules

1. **Upper layers govern or inform; they do not steal SoR from lower operational layers.**
2. **Lower layers do not redefine upper-layer identity** (e.g. dashboards ≠ Analytics; practice tools ≠ Law).
3. **Consumption is by reference** — Law and Analytics attach context; they do not absorb Projects/Documents/Support.
4. **Quality binds all layers** — APZQEP is not optional per product.
5. **Foundation is invisible infrastructure** — users experience products, not platform internals.

## Related

| Artefact           | Path                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| Portfolio baseline | [APZHUB-ENTERPRISE-PORTFOLIO-BASELINE.md](./APZHUB-ENTERPRISE-PORTFOLIO-BASELINE.md)             |
| Productivity Core  | [APZHUB-ENTERPRISE-PRODUCTIVITY-CORE.md](./APZHUB-ENTERPRISE-PRODUCTIVITY-CORE.md)               |
| Governance Layer   | [APZHUB-ENTERPRISE-GOVERNANCE-LAYER.md](./APZHUB-ENTERPRISE-GOVERNANCE-LAYER.md)                 |
| RI map             | [APZHUB-PORTFOLIO-REFERENCE-IMPLEMENTATIONS.md](./APZHUB-PORTFOLIO-REFERENCE-IMPLEMENTATIONS.md) |
