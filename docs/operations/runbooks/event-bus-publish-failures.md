# Runbook — Event Bus publish failures

> **Service:** Event Bus (`event-bus`) · **Owner:** Platform Engineering Lead · **Priority:** P2 · **Policy:** `alert.event-bus.publish-failures`

## 1. Title / service / owner

Platform Event Bus / outbox (MVP). Owner: Platform Engineering Lead.

## 2. Symptoms

Publish errors; outbox backlog growth; Attention/inbox not updating after Support events.

## 3. Severity guidance

**P2** when product attention paths degraded; INFO if fail-soft isolated.

## 4. Preconditions

- Event Bus is MVP — not full orchestration.
- Not Workflow Execute.
- No Email delivery expectations.

## 5. Diagnosis steps

1. Event Bus / outbox health.
2. Publisher error logs with `correlationId`.
3. Downstream Attention/ENF consumption errors.
4. Recent 1.1-003/event-related Changes.

## 6. Containment

- Pause non-critical publishers if flag exists.
- Communicate delayed in-app attention.
- Freeze Event Bus Changes.

## 7. Resolution / rollback

- Restore publish path / DB outbox.
- Replay only if supported and safe (idempotent).
- Rollback regressing change.

## 8. Verification

- Test publish succeeds.
- Attention updates for Support sample event.
- Error rate normalised.

## 9. Escalation

Platform Engineering Lead → Platform Ops Lead.

## 10. Related KL / ADRs

APZHUB-1.1-003 · Document 012/029 · Platform 1.1.0 KL.
