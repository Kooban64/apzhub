# LAW-GAP-REGISTER

| Field     | Value                                        |
| --------- | -------------------------------------------- |
| Programme | APZHUB-LAW-ADOPT-001                         |
| Timestamp | 20260803T100641Z                             |
| Rule      | Record only — **no remediation implemented** |

| ID    | Description                                             | Evidence                                                                                 | Business | Technical | Operational | Risk   | Dependency   | Suggested remediation                                   | Eng required               |
| ----- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------- | --------- | ----------- | ------ | ------------ | ------------------------------------------------------- | -------------------------- |
| LG-01 | No Law PRODUCT-STATUS.md                                | Glob: only APZQEP PRODUCT-STATUS                                                         | High     | Low       | High        | High   | Board/Owner  | Create authoritative PRODUCT-STATUS under LAW-ADOPT-002 | **NO**                     |
| LG-02 | Maturity/acceptance label conflicts                     | law README “In Development”; releases/law README “Awaiting Acceptance” vs 1.0.0 ACCEPTED | High     | Low       | Medium      | High   | LG-01        | Single authoritative status face                        | **NO**                     |
| LG-03 | No ES-001/002/003 citation pack                         | Product/release trees lack ES citations                                                  | Medium   | High      | Medium      | Medium | Baseline 1.2 | Conformance mapping docs                                | **NO** (docs first)        |
| LG-04 | No standing Law OPS programme                           | ADOPT-001 INITIAL; no Law OPS-001                                                        | High     | Medium    | High        | High   | LG-01        | LAW-ADOPT-005 ops alignment                             | **NO** initially           |
| LG-05 | Monitoring programme Evidence Insufficient              | One authz runbook + health routes                                                        | Medium   | Medium    | High        | Medium | LG-04        | Define metrics/alerts under ops phase                   | **NO** initially           |
| LG-06 | Incomplete event.yaml catalogue                         | Only 2 legal event manifests                                                             | Medium   | Medium    | Low         | Medium | Doc 029      | Expand manifests for domain events                      | **YES** (later)            |
| LG-07 | App-local service orchestration vs Platform Service SDK | Workflow services under apps/law-platform/lib                                            | Medium   | High      | Medium      | Medium | 009/027      | Extract/align services if Board mandates                | **YES** (later)            |
| LG-08 | OpenAPI↔runtime honesty residual                        | Cert/KL residuals                                                                        | Medium   | Medium    | Medium      | Medium | API pack     | Remediate under eng alignment if gates fail             | **YES** (later)            |
| LG-09 | Tenant claim placeholder (KL-LAW-05)                    | Known limitations                                                                        | Medium   | Medium    | Medium      | Medium | AuthZ        | Close under authorised eng if required                  | **YES** (later)            |
| LG-10 | search-law 0.1.0 vs product 1.0.0                       | KL-LAW-11 / package.json                                                                 | Low      | Low       | Low         | Low    | Versioning   | Docs sync first; eng if behaviour wrong                 | **NO** first               |
| LG-11 | Workspace-session ENG-003 adoption not evidenced        | No Law workspace-session adoption pack                                                   | Low      | Medium    | Medium      | Low    | 018          | Assess in later alignment                               | **NO** / later YES if gaps |
| LG-12 | No Law integrations/ connector pack                     | integrations/ has no Law adapter                                                         | Low      | Medium    | Low         | Low    | 008/026      | Only if external engine required                        | **YES** if needed          |

No gap authorises implementation in this programme.
