# APZHUB Platform 1.2.0 — Dependency Matrix

> **Programme:** APZHUB-1.2-009  
> **Authority:** [1.2-planning DEPENDENCY-MATRIX](../../1.2-planning/DEPENDENCY-MATRIX.md) · packaged outcomes

| Platform 1.2.0 outcome       | Depends on                                              | Status                      |
| ---------------------------- | ------------------------------------------------------- | --------------------------- |
| Theme A ops programmes       | Operations Framework · ENVIRONMENT.md                   | Satisfied                   |
| search-time                  | Time HTTP/SoR stable · Search Integration               | Satisfied                   |
| search-law                   | Law SoR · OBS-LAW AuthZ                                 | Satisfied                   |
| GitLab CI adapter            | TCMS 1.0.0 contracts · CI/CD Reference Adapter Standard | Satisfied                   |
| Platform 1.2.0 certification | Readiness APZHUB-1.2-008                                | Satisfied (**ACCEPTED**)    |
| Themes D–E                   | Not packaged                                            | Owner-waived for cert entry |
| Workflow Execute             | Explicit Owner unlock                                   | STOP — not packaged         |
| Email SoR / FIN-001          | Explicit Owner programmes                               | STOP — not packaged         |

## External / host

| Dependency                     | Constraint                                                           |
| ------------------------------ | -------------------------------------------------------------------- |
| Legacy `apz-stack` coexistence | Host controls from R12-OPS-03; no disruptive change without Approval |
| Engine CE versions             | Self-hosted CE first; no EE mandates                                 |
