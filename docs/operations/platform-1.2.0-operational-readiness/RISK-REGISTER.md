# Risk Register — Platform 1.2.0 Operational Readiness

> **Programme:** APZHUB-OPS-001  
> **Date:** 2026-07-22  
> **Complements:** [OPERATIONAL-RISK-REGISTER](../OPERATIONAL-RISK-REGISTER.md) · [platform-1.2.0 RESIDUAL-RISKS](../../releases/platform-1.2.0/RESIDUAL-RISKS.md)

| ID         | Category       | Risk                                                       | L   | I   | Mitigation / freeze posture                                               |
| ---------- | -------------- | ---------------------------------------------------------- | --- | --- | ------------------------------------------------------------------------- |
| OPS12-R-01 | Operational    | Shared-host SPOF / contention with legacy `apz-stack`      | H   | H   | Host coexistence controls · live audit before cutover · Owner Change gate |
| OPS12-R-02 | Deployment     | Prod compose scaffold / no Dockerfile / no CD              | H   | H   | Complete deploy artefact before cutover (action list)                     |
| OPS12-R-03 | Security       | Dev AuthZ/registration defaults if mis-copied to prod      | M   | H   | Production env hardening checklist                                        |
| OPS12-R-04 | Monitoring     | No live Observe evaluation/delivery (PL12-KL-02)           | M   | M   | Manual triage · on-call · do not overclaim                                |
| OPS12-R-05 | Backup         | No scheduled prod backup job; drill is dev-scoped          | M   | H   | Automate PG backup + Change-window drill                                  |
| OPS12-R-06 | Product        | Workflow Execute accidentally enabled                      | L   | H   | Keep gated (PL12-KL-09)                                                   |
| OPS12-R-07 | Product        | Email SoR / FIN-001 gaps mis-marketed                      | M   | H   | KL honesty · SUPPORTED-SERVICES                                           |
| OPS12-R-08 | Security       | Dependency CVE tooling not in CI                           | M   | M   | Post-cutover CI hardening                                                 |
| OPS12-R-09 | Performance    | No certified latency/capacity SLOs                         | M   | M   | Agree expectations · smoke under load                                     |
| OPS12-R-10 | Documentation  | Ops framework docs still cite 1.1.0 in places              | M   | L   | Align baseline references to 1.2.0                                        |
| OPS12-R-11 | Technical debt | Root `0.1.0-foundation` ≠ platform SemVer 1.2.0            | L   | L   | Documented PL12-KL-11                                                     |
| OPS12-R-12 | Unsupported    | Search live drain / GitLab CI mutations / Support realtime | M   | M   | Remain limited under PRWL                                                 |

No risk in this register authorises engineering under APZHUB-OPS-001.
