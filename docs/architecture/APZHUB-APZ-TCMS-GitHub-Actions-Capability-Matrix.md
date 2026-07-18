# APZHUB APZ TCMS — GitHub Actions Capability Matrix

**Milestone:** APZTCMS-020  
**Adapter:** `@apzhub/integration-github-actions`

---

| Capability                  | Implemented | Available   | Optional | Unsupported           | Degraded notes     |
| --------------------------- | ----------- | ----------- | -------- | --------------------- | ------------------ |
| repositories (get metadata) | Yes         | Yes         | No       | write/manage          | —                  |
| workflows (list/get)        | Yes         | Yes         | No       | edit/create           | —                  |
| workflow runs (list/get)    | Yes         | Yes         | No       | dispatch/rerun/cancel | —                  |
| jobs (list/get)             | Yes         | Yes         | No       | —                     | —                  |
| steps (list)                | Yes         | Yes         | No       | —                     | from job payload   |
| artifacts (metadata)        | Yes         | Yes         | No       | binary download       | —                  |
| logs (metadata)             | Yes         | Yes         | No       | log body download     | —                  |
| summaries                   | Yes         | Yes         | No       | —                     | —                  |
| approvals                   | Yes         | Conditional | Yes      | —                     | empty on 404       |
| environments                | Yes         | Conditional | Yes      | —                     | empty on 404       |
| diagnostics                 | Yes         | Yes         | No       | —                     | secret-free        |
| health                      | Yes         | Yes         | No       | —                     | 4-level model      |
| compatibility               | Yes         | Yes         | No       | —                     | API `2022-11-28`   |
| version                     | Yes         | Yes         | No       | —                     | —                  |
| GitHub App auth             | Placeholder | No          | —        | live auth             | config only        |
| OAuth                       | Placeholder | No          | —        | live auth             | must stay disabled |
| Issues / PRs / repo mgmt    | No          | No          | —        | entire surface        | out of scope       |

Legend: **Implemented** = code present; **Available** = usable in certified environments; **Optional** = may be unavailable without failing core; **Unsupported** = explicitly non-goals.
