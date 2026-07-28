# Runbook — Law AuthZ denials spike

> **Service:** Law (`law`) · **Owner:** Law Product Owner · **Priority:** P2 · **Policy:** `alert.law.authz-denials-spike`

## 1. Title / service / owner

Law Platform authorization. Owner: Law Product Owner.

## 2. Symptoms

Sudden 403 volume on Law APIs; Workbench permission errors; AuthZ denials spike.

## 3. Severity guidance

**P2** default. Escalate to security Incident if privilege escalation suspected.

## 4. Preconditions

- OBS-LAW-01 AuthZ hardening is Accepted — deny-by-default is expected for missing grants.
- Do not reintroduce allow-all / `*` injection.
- No Law redesign under incident.

## 5. Diagnosis steps

1. Compare denial rates vs baseline.
2. Sample `correlationId` denials — permission keys vs grants.
3. Check recent role/permission Changes.
4. Confirm session AuthorizationService mode is `auth` (not allow-all) for user paths.

## 6. Containment

- Freeze permission grant Changes if misconfig suspected.
- Communicate temporary access issues honestly.
- If breach suspicion: follow SECURITY-OPERATIONS.

## 7. Resolution / rollback

- Correct grants via authoritative PermissionService path.
- Rollback bad permission config.
- Never bypass AuthZ for convenience.

## 8. Verification

- Legitimate users regain expected access.
- Denial rate returns to baseline.
- No allow-all regression in health summaries for user paths.

## 9. Escalation

Law Product Owner → Security Owner (if needed) → Platform Ops Lead.

## 10. Related KL / ADRs

APZHUB-1.1-001 · Document 007/013 · Law Known Limitations.
