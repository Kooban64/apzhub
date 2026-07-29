# RELEASE-002 Execution Plan (planning only)

## Purpose

Promote the frozen patch candidate to production patch release **1.0.1** under Limited Availability after Owner accepts FREEZE-002 and authorises RELEASE-002.

## Planned activities (when authorised)

1. Confirm FREEZE-002 Owner acceptance.
2. Commit candidate tree if still uncommitted; resolve remote rebase safely.
3. Promote version identity **1.0.1-rc.1 → 1.0.1** per repository versioning policy.
4. Create release tag (e.g. `apzqep-test-execution-v1.0.1`).
5. Final release notes / evidence / release pack under `docs/releases/.../1.0.1/`.
6. Deployment readiness confirmation — Limited Availability only.
7. Explicitly **not** approve unrestricted GA.

## Dependencies

- L-02 CLOSED / RA-02 RETIRED (Owner CERT-002) — satisfied pending Freeze closeout recording
- Operational browser readiness — **not** a RELEASE-002 security gate; remains GA hold

## Gate

```text
PLANNING ONLY
NOT AUTHORISED
```
