# Runbook — Host coexistence / capacity pressure

> **Service:** Shared host / ENVIRONMENT · **Owner:** Environment Owner · **Priority:** P1/P2 · **Policy adjacency:** OPS-R-01 · R12-OPS-03

## 1. Title / service / owner

Shared AWS host running legacy `apz-stack` + APZHUB compose. Owner: Environment Owner.

## 2. Symptoms

Port bind failures; disk > 80%; APZHUB compose cannot start; legacy services degraded after APZHUB change.

## 3. Severity guidance

**P1** if Tier A (identity/gateway/host nginx) impacted; **P2** if APZHUB-only ports fail.

## 4. Preconditions

- Read [ENVIRONMENT.md](../../../ENVIRONMENT.md) and [HOST-COEXISTENCE-CONTROLS.md](../HOST-COEXISTENCE-CONTROLS.md).
- Do not remap legacy ports without Owner Approval.
- Do not prune unknown Docker volumes blindly.

## 5. Diagnosis steps

1. `pnpm ops:host-coexistence-audit -- --live`
2. Confirm conflicting process/container on reserved ports (54334, 6380, 3080, 3443, 3300, 6006).
3. Check host disk % and Docker disk usage.
4. Identify last host/compose Change.

## 6. Containment

- Stop the conflicting **non-approved** binder on APZHUB reserved ports if safe.
- Freeze host port Changes.
- Prefer stopping APZHUB optional services (Caddy/Storybook) before touching legacy stack.

## 7. Resolution / rollback

- Restore APZHUB to reserved ports only.
- Rollback compose Change that introduced forbidden binds.
- Disk: approved cleanup only; retain APZHUB named volumes.

## 8. Verification

- Audit PASS.
- APZHUB postgres/redis healthy.
- Legacy stack still serving (spot-check hostnames from ENVIRONMENT.md).

## 9. Escalation

Environment Owner → Platform Ops Lead → Owner.

## 10. Related KL / ADRs

OPS-R-01 · CAPACITY-PLANNING · ENVIRONMENT.md · Change Management.
