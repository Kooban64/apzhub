# APZHUB APZ TCMS — Release Readiness Model

**Milestone:** APZTCMS-014  

## Rule

`evaluateReadiness` / `generateReleaseSummary` **aggregate existing** APZ TCMS services:

- Certification
- Quality Intelligence
- Coverage
- Defects
- Evidence
- Approvals
- Automation
- Manual Testing

**No duplicate calculations. No new algorithms.**

## Output

`ReleaseReadinessSnapshot` with advisory verdict:

- `READY`
- `READY_WITH_WARNINGS`
- `NOT_READY`

Always `isDecision: false`. Never authorises production deployment.
