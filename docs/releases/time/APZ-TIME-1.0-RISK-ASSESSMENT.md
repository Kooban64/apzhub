# APZ Time 1.0 — Risk Assessment

> **Product:** APZ Time  
> **Classification:** Documentation only  
> **Related:** [Gaps](./APZ-TIME-1.0-GAP-ANALYSIS.md) · [Recommendation](./APZ-TIME-1.0-RECOMMENDATION.md)

---

## Risks

| ID   | Risk                                                      | Likelihood       | Impact   | Classification       | Mitigation (planning / process)                             |
| ---- | --------------------------------------------------------- | ---------------- | -------- | -------------------- | ----------------------------------------------------------- |
| R-01 | Starting Workbench before Kimai adapter + HTTP            | Medium if rushed | Critical | Architecture defect  | Enforce D1 → IR → Approval gate (this suite)                |
| R-02 | Treating host Kimai as integration complete               | Medium           | High     | False readiness      | AI-MANIFEST / Inventory: adapter **Absent**                 |
| R-03 | Inventing Kimai field mappings without CE API discovery   | Medium           | High     | Integration defect   | Capability discovery in adapter; ADR first                  |
| R-04 | Coupling Time UI to Plane / Projects internals            | Medium           | High     | Layer violation      | Projects HTTP only via Platform; no module coupling         |
| R-05 | Expanding scope to Approvals/Reporting in 1.0 before Core | Medium           | Medium   | Delivery slip        | Phases P1 → P2 → P3; freeze AC in Sprint Guide              |
| R-06 | Breaking Integration SDK freeze during adapter work       | Low              | Critical | Governance           | Adapter **uses** SDK 1.0.0; no SDK redesign                 |
| R-07 | Provisioning / SSO gaps for Kimai CE                      | Medium           | High     | AuthN/AuthZ          | Document per-engine SSO; APZHUB owns mapping (007)          |
| R-08 | Duplicate business data in platform PostgreSQL            | Medium           | High     | Data integrity (011) | Platform metadata only; Kimai SoR for entries               |
| R-09 | Skipping audit/events for time mutations                  | Medium           | Medium   | Compliance / ops     | Platform Service publishes; modules do not notify           |
| R-10 | Analytics/Metabase pulled into Time 1.0                   | Low              | Medium   | Scope creep          | Keep Analytics Concept out of Time 1.0                      |
| R-11 | Coexistence port/host conflicts with apz-stack Kimai      | Low              | Medium   | Ops                  | ENVIRONMENT.md; no disruptive host changes without approval |
| R-12 | False “Implementation Ready” without tests                | Medium           | High     | Quality (015)        | IR requires contract + integration evidence on disk         |

---

## Risk to recommendation

Primary risk if Owner ignores assessment: **implementing UI against nothing**, creating throwaway code and architecture debt. Recommendation explicitly blocks implementation until IR.

---

## Residual risk after following strategy

| Residual                                                      | Acceptable?                              |
| ------------------------------------------------------------- | ---------------------------------------- |
| Kimai CE API surface may constrain Approvals/Reporting        | Yes — discover in D1; adjust P2/P3 scope |
| Projects linking depends on Wave 1 Projects stability         | Yes — Projects 1.1.0 Production accepted |
| First Time release may be thinner than full CAPABILITIES list | Yes — honesty over feature pressure      |
