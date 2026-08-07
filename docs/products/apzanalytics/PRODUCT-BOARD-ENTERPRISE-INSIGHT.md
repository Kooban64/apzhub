# Product Board Principles — Enterprise Insight (APZ Analytics)

| Field     | Value                                                       |
| --------- | ----------------------------------------------------------- |
| Programme | APZ-ANALYTICS-000                                           |
| Status    | **IN FORCE**                                                |
| Timestamp | 20260805T174500Z                                            |
| Authority | Product Board / Owner Approval                              |
| Gate      | Recorded before mission; strengthened before Owner Approval |

## 1. Enterprise Insight Principle

> **Analytics explains the business. It does not become the business.**

| Domain products own (SoR) | Analytics owns     |
| ------------------------- | ------------------ |
| Projects                  | Interpretation     |
| Support                   | Trends             |
| Time                      | KPIs               |
| Documents                 | Operational health |
| Workflow                  | Portfolio insight  |

Analytics owns **none** of the operational data.

## 2. System of Record law

> **Analytics consumes Systems of Record. It never becomes one.**

```text
Projects remain true.     Analytics observes Projects.
Support remains true.     Analytics observes Support.
Time remains true.        Analytics observes Time.
Documents remain true.    Analytics observes Documents.
Workflow remains true.    Analytics observes Workflow.
```

If Analytics starts storing business truth, the SoR discipline of the operational business layer is broken.

## 3. Questions before visualisations

> **Business questions come before visualisations.**

Dashboards, charts, widgets, reports, APIs, and future AI summaries are **presentations**.  
The product is the **insight**. The product identity is the **enterprise decision product** — never “the dashboard product.”

## 4. Decision before measurement

> **Analytics exists to improve decisions, not simply to measure activity.**

| Poor (activity measurement) | Good (decision improvement)                               |
| --------------------------- | --------------------------------------------------------- |
| Number of tickets           | Which support categories generate the most repeat work?   |
| Number of projects          | Which projects are most likely to miss delivery?          |
| Hours worked                | Where are teams losing productivity?                      |
| Documents uploaded          | Which approval stages create the most delay?              |
|                             | Which workflows consistently require manual intervention? |

The first set measures. The second set improves decisions. **That is the product.**

## Three horizons

| Horizon         | Question                 | Examples                                                                                                |
| --------------- | ------------------------ | ------------------------------------------------------------------------------------------------------- |
| **Operational** | What is happening today? | Open work · SLA status · Active projects · Capacity                                                     |
| **Tactical**    | What changed?            | Delivery trend · Incident trend · Throughput · Lead time · Bottlenecks                                  |
| **Strategic**   | What should we do?       | Portfolio investment · Process improvement · Resource planning · Operational risk · Capability maturity |

The strategic horizon naturally supports the Product Board and Quarterly Portfolio Review: _“Here is what the enterprise learned this quarter.”_

## Product framing

| APZ Analytics **is**                | APZ Analytics is **not** |
| ----------------------------------- | ------------------------ |
| Enterprise Decision Support         | A reporting product      |
| The enterprise **decision** product | The dashboard product    |
| Enterprise insight layer            | Another operational app  |
| Memory of how work performs         | The System of Record     |

## Layer separation

```text
Operational Layer (RI #001–#005)
        │  do the work
        ▼
Insight Layer (APZ Analytics)
        │  understand the work / improve decisions
        ▼
Decisions (including Product Board)
```

The Insight Layer observes the Operational Layer. It does not compete with it.

## Application

Mission, Native Adoption, and all future Analytics scope shall honour these four principles and three horizons. Visualisations remain servants of questions and decisions.
