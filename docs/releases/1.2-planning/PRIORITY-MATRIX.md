# Release 1.2 — Priority Matrix

> **Programme:** APZHUB-1.2-001  
> **Date:** 2026-07-20  
> **Scores:** H / M / L (qualitative). Complexity: L / M / H / VH.

---

## P0 — Must for 1.2 minimum bar

| ID            | Business | Customer | Operational | Commercial | Complexity | Dependencies          | Est. | Owner       | Recommendation            |
| ------------- | -------- | -------- | ----------- | ---------- | ---------- | --------------------- | ---- | ----------- | ------------------------- |
| R12-OPS-01    | H        | M        | H           | M          | M          | Backup docs           | 1.2  | Ops         | **Do**                    |
| R12-OPS-02    | M        | M        | H           | M          | M          | Observe plane         | 1.2  | Ops         | **Do**                    |
| R12-OPS-03    | H        | L        | H           | M          | M          | ENVIRONMENT.md        | 1.2  | Env         | **Do**                    |
| R12-SEARCH-01 | H        | H        | L           | H          | M          | Search arch frozen OK | 1.2  | Search/Time | **Do**                    |
| R12-SEARCH-02 | H        | H        | L           | H          | M          | Law SoR               | 1.2  | Search/Law  | **Do**                    |
| R12-TCMS-01   | M        | H        | M           | M          | M          | TCMS 1.0.0            | 1.2  | TCMS        | **Done** (APZHUB-1.2-007) |

## P1 — Should for credible 1.2

| ID             | Business | Customer | Operational | Commercial | Complexity | Dependencies           | Est. | Owner      | Recommendation                                   |
| -------------- | -------- | -------- | ----------- | ---------- | ---------- | ---------------------- | ---- | ---------- | ------------------------------------------------ |
| R12-PERSIST-01 | H        | M        | H           | M          | M          | Automation Foundation  | 1.2  | Automation | **Done** (APZHUB-ENG-0001 · Awaiting Acceptance) |
| R12-PERSIST-02 | H        | M        | H           | M          | M          | Law 1.0.0              | 1.2  | Law        | **Done** (APZHUB-ENG-0002 · Awaiting Acceptance) |
| R12-SUP-01     | H        | H        | M           | H          | M          | Zammad CE              | 1.2  | Support    | **Done** (APZHUB-ENG-0003 · Awaiting Acceptance) |
| R12-SUP-02     | H        | H        | M           | H          | M          | Zammad CE              | 1.2  | Support    | **Do** (pick with SUP-01)                        |
| R12-QA-01      | H        | M        | H           | H          | M          | Themes A–C             | 1.2  | QA         | **Do**                                           |
| R12-AUTO-01    | M        | M        | M           | M          | M          | Automation + Event Bus | 1.2  | Portfolio  | **Do selective**                                 |
| R12-SEC-01     | H        | M        | H           | H          | M          | Ongoing                | 1.2  | Security   | **Do continuous**                                |
| R12-COMP-01    | H        | M        | M           | H          | L          | New surfaces           | 1.2  | Compliance | **Do**                                           |

## P2 — Nice / capacity-gated in 1.2

| ID            | Business | Customer | Operational | Commercial | Complexity | Dependencies        | Est.    | Owner     | Recommendation       |
| ------------- | -------- | -------- | ----------- | ---------- | ---------- | ------------------- | ------- | --------- | -------------------- |
| R12-LAW-01    | M        | H        | L           | H          | L–M        | Law AuthZ closed    | 1.2     | Law       | **Do if capacity**   |
| R12-TIME-01   | M        | H        | L           | M          | M          | Time 1.0.0          | 1.2/1.3 | Time      | **Prefer 1.2 slice** |
| R12-PROJ-01   | M        | M        | L           | M          | M          | Projects 1.1.0      | 1.2/1.3 | Projects  | **Capacity**         |
| R12-SEMVER-01 | L        | L        | L           | L          | L          | Release mgmt        | 1.2     | Eng       | **Do**               |
| R12-PERF-01   | M        | M        | M           | L          | M          | Hot paths           | 1.2/1.3 | Platform  | **Measure first**    |
| R12-SUP-03    | M        | H        | M           | M          | H          | SUP-01/02           | 1.3     | Support   | **Defer default**    |
| R12-AN-01     | M        | M        | L           | M          | H          | Metabase foundation | 1.3     | Analytics | **Defer**            |
| R12-WF-01     | M        | M        | L           | M          | H          | No execute          | 1.3     | Workflow  | **Defer**            |

## P3 / Deferred

| ID                                         | Recommendation                        |
| ------------------------------------------ | ------------------------------------- |
| R12-QA-02                                  | Opportunistic                         |
| R12-DOC-01                                 | Defer → Owner unlock / 2.0            |
| R12-NOTIFY-01                              | Defer → 1.3/2.0 (not Email SoR claim) |
| R12-EMAIL-01 · R12-FIN-01 · R12-WF-EXEC-01 | **STOP**                              |
| R12-SUP20-01 · R12-AI-01 · R12-COMM-01     | Future / Innovation                   |
