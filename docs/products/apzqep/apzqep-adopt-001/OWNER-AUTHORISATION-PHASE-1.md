# OWNER-AUTHORISATION — APZQEP-ADOPT-001 Phase 1

| Field                  | Value                                                        |
| ---------------------- | ------------------------------------------------------------ |
| Programme              | **APZQEP-ADOPT-001**                                         |
| Phase                  | **Phase 1 – Production Adoption & APZ Time Integration**     |
| Status                 | **AUTHORISED**                                               |
| Timestamp              | 20260804T191500Z                                             |
| Classification         | Adoption / Operations + Product programme start              |
| Parent authority       | [OWNER-AUTHORISATION.md](./OWNER-AUTHORISATION.md)           |
| APZQEP architecture    | **FROZEN** — do not reopen                                   |
| APZQEP-170+            | **NOT AUTHORISED**                                           |
| Third-party visibility | **NONE** (Kimai / Plane / Zammad never user-facing)          |
| Source                 | Owner Authorisation via ChatGPT strategy + Owner endorsement |

## Objective

Transition APZQEP Version 1.1 from an engineering programme into an operational
platform used daily across APZHUB — while beginning the next APZHUB product
track for **APZ Time** (APZHUB presentation over Kimai).

The goal is **not** to validate the architecture. The architecture is frozen.
The goal is to **use** APZQEP and present APZ Time as a native APZHUB product.

## Parallel tracks

| Track                              | Objective                                                                                                                          |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **A — APZQEP Production Adoption** | Developers/QA use APZQEP as primary testing and release platform                                                                   |
| **B — APZ Time**                   | **Maturation** of Production **1.0.0** — native experience; not greenfield ([TIME-NATIVE-001](../../time/APZHUB-TIME-NATIVE-001/)) |

## Authorised

### Track A — APZQEP

- Validate workspace, Quality Flows, Decision Packages, Evidence, approvals,
  Executive / Operational / Workspace experiences in daily use
- Record operational friction (do not redesign APZQEP)
- Train developers, testers, managers for daily use

### Track B — APZ Time (maturation)

- Priority order: Native UX → Identity → Workspace → APZQEP binding → daily-use gaps
- Not: build Time; Not: Kimai feature parity
- Preserve Production 1.0.0 capability
- Product contract (APZ Time) vs implementation contract (Kimai adapter) evolve independently
- Larger capabilities (approvals, reporting, AI, …) only after operational evidence + named release Auth

## Explicit exclusions

- Reopen APZQEP architecture
- Begin APZQEP-170 / 180 / 190 / 200
- Expose Kimai (or any engine) directly — branding, URLs, terminology, docs, auth, roles
- Dual identities
- Bypass APZHUB branding
- Inconsistent user experiences across products

## Platform principle (locked)

Users interact only with APZHUB products. Never with third-party engines.

| Internal Engine | User Sees             |
| --------------- | --------------------- |
| Kimai           | **APZ Time**          |
| Plane           | **APZ Projects**      |
| Zammad          | **APZ Support**       |
| Grafana         | APZHUB dashboards     |
| Prometheus      | APZHUB monitoring     |
| Playwright      | APZQEP Automation     |
| GitHub          | APZQEP Source Control |

## Success criteria

- APZQEP actively used internally as standard quality platform
- APZ Time development / native platform track started
- APZ Time presented as completely native APZHUB product
- No user-facing references to Kimai
- Operational learning captured throughout

## Note on existing baseline

APZ Time **1.0.0** Phase 1 is already **ACCEPTED / CLOSED** with
`@apzhub/integration-kimai` **0.2.0**. Track B advances native platform
experience, catalogue/governance gaps, and APZQEP quality integration — it is
not a greenfield product invent.
