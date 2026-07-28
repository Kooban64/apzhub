# Release 1.2 — Dependency Matrix

> **Programme:** APZHUB-1.2-001  
> **Date:** 2026-07-20

---

## Hard dependencies

| Item                      | Depends on                                               | Reason                           |
| ------------------------- | -------------------------------------------------------- | -------------------------------- |
| R12-SEARCH-01             | Time HTTP/SoR stable                                     | Publisher consumes platform Time |
| R12-SEARCH-02             | Law SoR + AuthZ (OBS closed)                             | Permission-filtered index        |
| R12-TCMS-01               | TCMS 1.0.0 contracts                                     | Adapter pattern                  |
| R12-PERSIST-01            | Automation Foundation (1.1-004)                          | Journal schema                   |
| R12-PERSIST-02            | Law 1.1-002 session model                                | Store upgrade                    |
| R12-SUP-01/02             | Zammad CE + Support services                             | Connector depth                  |
| R12-AUTO-01               | Event Bus + Automation Foundation + PERSIST-01 preferred | Intents durable                  |
| R12-QA-01                 | Themes A–C complete                                      | Cert evidence                    |
| R12-LAW-01                | Law AuthZ closed                                         | Safe UX work                     |
| R12-SUP-03                | SUP-01/02                                                | Realtime after ingress maturity  |
| R12-NOTIFY-01             | Delivery design (not Email SoR by default)               | Separate Owner gate              |
| R12-WF-EXEC-01            | Explicit Owner unlock programme                          | STOP                             |
| R12-EMAIL-01 / R12-FIN-01 | Explicit Owner programmes                                | STOP                             |

## Sequence constraints

```text
OPS (A) ─┬─► SEARCH (B) ─► QA-01
         ├─► TCMS (C) ───► QA-01
         └─► PERSIST (D) ─► AUTO-01 ─► optional LAW-01 / TIME-01
SUP-01/02 can parallelise with SEARCH after Support connector readiness
```

## External / host

| Dependency                     | Constraint                                                                                      |
| ------------------------------ | ----------------------------------------------------------------------------------------------- |
| Legacy `apz-stack` coexistence | No disruptive port/resource change without Approval ([ENVIRONMENT.md](../../../ENVIRONMENT.md)) |
| Engine CE versions             | Self-hosted CE first; no EE mandates                                                            |
