# APZHUB-ENG-0017 — Remediation Evidence

> **Programme:** APZHUB-ENG-0017  
> **Baseline:** Platform **1.2.0**

## Group closed

| Identifier        | Status         | Evidence                                                  |
| ----------------- | -------------- | --------------------------------------------------------- |
| RG-CERT-PIN-DRIFT | **REMEDIATED** | Pin-scope Vitest **280/280 PASS**; catalogue pins aligned |

## Root cause addressed

| RCA    | Summary                                                          |
| ------ | ---------------------------------------------------------------- |
| RCA-02 | Frozen SemVer / OpenAPI certification pins lagged Platform 1.2.0 |

## Catalogue alignment

| Pin                                  | Prior freeze          | Live catalogue     |
| ------------------------------------ | --------------------- | ------------------ |
| `@apzhub/platform-services`          | 0.26.1 (const 0.28.0) | **0.30.0**         |
| `@apzhub/platform-service-contracts` | 0.17.1                | **0.18.0**         |
| `@apzhub/workflow-contracts`         | 0.3.0                 | **0.4.2**          |
| `@apzhub/integration-zammad`         | 0.6.0                 | **0.8.0**          |
| OpenAPI `info.version`               | ≤1.10.0               | **1.12.0** allowed |
| Zammad cert capabilities             | 11                    | **12**             |

## Durable evidence JSON

[docs/operations/evidence/portfolio-recert/20260721T135822Z-APZHUB-ENG-0017-RG-CERT-PIN-DRIFT.json](../../operations/evidence/portfolio-recert/20260721T135822Z-APZHUB-ENG-0017-RG-CERT-PIN-DRIFT.json)
