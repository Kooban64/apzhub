# APZ TCMS 1.0.0 — Post-Release Verification Checklist

> **Programme:** APZ-TCMS-002  
> **Date:** 2026-07-19  
> **Use:** After Owner Acceptance of SemVer **1.0.0**

| #   | Check                                                    | Owner / Ops |
| --- | -------------------------------------------------------- | ----------- |
| 1   | Testing module visible only with permissions             |             |
| 2   | HTTP `/api/v1/testing` AuthZ matrix sample               |             |
| 3   | GHA adapter health in target environment (if enabled)    |             |
| 4   | Search publication (if Search enabled)                   |             |
| 5   | Known Limitations communicated to operators              |             |
| 6   | No Kiwi brand as SoR; no GitLab/AI surfaces claimed      |             |
| 7   | Backup/restore dry-run for metadata (+ evidence storage) |             |

Packaging programme does not execute these live checks.
