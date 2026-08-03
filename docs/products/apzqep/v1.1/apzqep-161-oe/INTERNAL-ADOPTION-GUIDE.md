# Internal Adoption Guide — APZQEP as first customer of APZQEP

| Field        | Value                              |
| ------------ | ---------------------------------- |
| Programme    | APZQEP-161-OE                      |
| Audience     | APZOR engineers, QA, operators     |
| Host         | https://apzhub.apzportal.apzor.com |
| Metric class | Guidance (process)                 |

## Principle

Use APZQEP Wave 1 as the **primary internal quality surface** for APZHUB verification work. Prefer dry-run automation for daily CI-less smoke; enable live Playwright only when browser proof is required.

## Daily loop

```text
Sign in → Enterprise Automation workspace
        → Confirm Playwright provider active
        → Run dry-run (or suite target)
        → Open execution detail
        → Review artifacts + evidence refs
        → Re-run if needed
        → Log findings in OPERATIONAL-FEEDBACK-REGISTER
```

## Access

| Item              | Value                                                        |
| ----------------- | ------------------------------------------------------------ |
| URL               | https://apzhub.apzportal.apzor.com                           |
| Local coexistence | http://localhost:3300 (same app, reserved ports)             |
| Dev user (known)  | `dev@apzhub.local` / `DevPassword123!` (non-production only) |
| Automation        | `/workspace/qep/automation`                                  |
| Providers         | `/workspace/qep/automation/providers`                        |

## What “done” looks like for an internal run

1. Execution reaches **completed** or a clear **failed** state with summary.
2. Artifact kinds listed (log / screenshot / video / trace / …).
3. Evidence references present (`evidence://automation/...`).
4. History shows the run (process-local — lost on restart; expected Wave 1 residual).

## Do not do (yet)

- Do not treat GitHub/GitLab as available (Wave 2).
- Do not expect media players / live console theatre.
- Do not open APZQEP-162 without Board review of OE findings + Owner Auth.
