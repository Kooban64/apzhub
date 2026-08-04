# API — Approval Decision Platform

Provider-neutral surface on `orchestration.approvals` (DI: `orchestration.approval.engine`).

| Operation                    | Purpose                                       |
| ---------------------------- | --------------------------------------------- |
| Create Approval Bundle       | Snapshot template → immutable bundle          |
| Read Bundle                  | Fetch by bundle ID                            |
| Submit Decision              | Append authority decision                     |
| Read Decision                | Fetch decision by ID                          |
| Read Required Authorities    | Template snapshot on bundle                   |
| Read Outstanding Authorities | Authorities still needing coverage            |
| Read History                 | Audit / decision history                      |
| Read Final Status            | Derived bundle status                         |
| Diagnostics                  | Counts, pending, SoD/delegation stats, health |

No release APIs. No execution APIs. No identity APIs.
