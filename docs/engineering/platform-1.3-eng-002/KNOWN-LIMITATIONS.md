# Known Limitations — ENG-002

## PL12-KL-02

**Classification:** **PARTIALLY REMEDIATED**

Phase A evaluation/lifecycle/events/delivery-hook exist and are deny-by-default. Notification delivery providers and Phase B live telemetry remain open.

## Residuals

| ID          | Description                           | Impact                         | Risk | Mitigation               | Owner    | Future  | Release |
| ----------- | ------------------------------------- | ------------------------------ | ---- | ------------------------ | -------- | ------- | ------- |
| ENG002-R-01 | No notification delivery providers    | Alerts update SoR/events only  | M    | ADR-0071 / ENG-004       | Platform | P13-E04 | 1.3+    |
| ENG002-R-02 | No PromQL / live telemetry evaluation | Metadata signals only          | M    | Future Phase B ADR       | Platform | later   | 1.3+    |
| ENG002-R-03 | Evaluation disabled until env enable  | Ops must opt in                | L    | CONFIGURATION.md rollout | Ops      | ops     | 1.3     |
| ENG002-R-04 | No dedicated always-on worker binary  | evaluateBatch is API/job entry | L    | Schedule via ops job     | Ops      | ops     | 1.3     |
