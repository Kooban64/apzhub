# APZ TCMS — Canonical Automation Model

**Milestone:** APZTCMS-007  
**Contract:** `@apzhub/testing-contracts` **0.4.0**

---

## Aggregate shape

| Concept         | Contents                                                                                |
| --------------- | --------------------------------------------------------------------------------------- |
| **Execution**   | External run ref, adapter kind, overall status, duration, correlation ID, environment   |
| **Suite**       | Key/name, nested cases, rollup status/duration                                          |
| **Case**        | Title/key, status, duration, message/stack, tags, requirement refs, steps               |
| **Step**        | Name, status, expected/actual, duration, evidence refs                                  |
| **Evidence**    | Type, title, storageRef, mime, size, checksum, path hint (metadata)                     |
| **Coverage**    | Covered/total/percentage + raw summary (ingested only)                                  |
| **Environment** | Framework, version, commit, branch, build, pipeline, machine, platform, browser, device |

---

## Persistence mapping

| Table                                  | Role                          |
| -------------------------------------- | ----------------------------- |
| `testing_automation_import`            | Import envelope + fingerprint |
| `testing_automated_execution`          | Normalized execution SoR      |
| `testing_automation_run`               | Suite/case run rows           |
| `testing_automation_result_item`       | Step/result detail            |
| `testing_automation_import_history`    | Append-only events            |
| `testing_automation_coverage_snapshot` | Coverage summaries            |

Migrations: `0023` / `0024` (RLS).
