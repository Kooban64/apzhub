# Support and Recovery

| Symptom | Guidance |
|---|---|
| Baseline not visible after create | Confirm permission `baselines.view`; refresh list; check correlation id / audit |
| Search lag | Wait for publication; persistence remains authoritative |
| Membership add failure | Check Draft state, duplicate version, same-requirement conflict, permissions |
| Lock validation failure | Ensure ≥1 content version; verify content-version integrity; refresh state |
| Lock request uncertainty | Do not retry blindly; re-GET baseline; use correlation id |
| Archive failure | Require Locked state + `baselines.archive` |
| Integrity verification failure | Preserve evidence; do not rewrite membership; escalate |
| Cross-tenant denial | Expected Zero Trust behaviour |
| Stale UI | Refresh server-authoritative baseline; irreversible commands are not auto-retried |
| Migration issue | Forward-fix; do not drop locked tables |

Never instruct staff to mutate Locked baseline rows as ordinary remediation.
