# LAW-KNOWN-ISSUES

| Field     | Value                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------- |
| Programme | APZHUB-LAW-ADOPT-004                                                                              |
| Timestamp | 20260803T135126Z                                                                                  |
| Source KL | [apz-law/KNOWN-LIMITATIONS.md](../../products/apz-law/KNOWN-LIMITATIONS.md) · ADOPT-002/003 faces |

## Purpose

Standing operational register of accepted residuals and disclosed limitations. Supplements product Known Limitations; does not invent new product defects.

## Register (seeded from certified residuals)

| ID        | Summary                                       | Ops impact                                                  | Status                                    |
| --------- | --------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------- |
| KL-LAW-01 | Placeholder UX surfaces remain                | Support: set expectation                                    | Accepted residual                         |
| KL-LAW-02 | Financial Engine extraction deferred          | Billing remains in-Law                                      | Accepted residual                         |
| KL-LAW-05 | Tenant residual when session lacks tenant     | Prefer session tenant; header/dev fallback only when absent | Accepted residual (narrowed EAB-04)       |
| KL-LAW-07 | No Email System of Record                     | No email edition claims                                     | Accepted residual                         |
| KL-LAW-08 | Practice-area specialty SKUs not productised  | Commercial: no specialty packs                              | Accepted residual                         |
| KL-LAW-09 | No external court e-filing / DMS / accounting | Out of 1.0 scope                                            | Accepted residual                         |
| KL-LAW-11 | search-law 0.1.0 vs product 1.0.0             | Disclose search package residual                            | Accepted residual                         |
| EAB-03-R  | Trust OpenAPI path enumeration incomplete     | Docs honesty; API consumers use Trust routes + notes        | Disclosed residual (non-blocking PBR-003) |
| EAB-05    | Connector pack N/A (first-party SoR)          | Ops: no external Law engine to operate                      | Invalid for eng — closed for ops          |
| EAB-06    | Workspace-session eng deferred                | No proven ops defect from 018 gap                           | Deferred / monitor                        |

## Operational observations

| Observation ID | Note                                                          | Status |
| -------------- | ------------------------------------------------------------- | ------ |
| —              | Empty at programme open — add only from measured ops evidence | —      |

## Rules

1. Do not remove historical KL without Board/Owner programme.
2. New observations require evidence — not speculation.
3. Conversion to Enhancement requires [LAW-ENHANCEMENT-REGISTER.md](./LAW-ENHANCEMENT-REGISTER.md) entry.
