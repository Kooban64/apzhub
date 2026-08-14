# F9 — Auto verification on durable change

| Field       | Value                                                                            |
| ----------- | -------------------------------------------------------------------------------- |
| Status      | **LOCAL PROOF** 2026-08-09                                                       |
| Bar         | Durable SCM change → opt-in Playwright smoke + evidence link; never auto-certify |
| Not claimed | Auto-running every scanner; inventing CI reports; auto GO/NO-GO                  |

## Done when

- `onChangeEventsPersisted` fires after webhook/sync upsert
- `APZHUB_AUTOMATION_ON_CHANGE=true` enqueues Playwright with `metadata.changeEventId` + `assistOrigin=f9_on_change`
- Dedupe skips re-trigger for same change
- Source policy: no certification mutation APIs
- Soft-fail: webhook/sync still succeed if automation fails

## Env

| Flag                               | Meaning                                       |
| ---------------------------------- | --------------------------------------------- |
| `APZHUB_AUTOMATION_ON_CHANGE=true` | Enable F9 trigger                             |
| `APZHUB_AUTOMATION_LIVE=true`      | Allow live Chromium (else dry-run smoke)      |
| Server GitHub PAT                  | Already F1 — read/sync/webhook path unchanged |

## Honest split

| Auto on change   | Still CI → ingest                           |
| ---------------- | ------------------------------------------- |
| Playwright smoke | Vitest, a11y, security, code quality, k6, … |

## QA path (non-technical)

1. Dev pushes → APZQEP heartbeat
2. F9 starts smoke (when flag on)
3. QA opens Quality Journey / RC — sees evidence fill
4. QA records GO / NO-GO

## Local proof (2026-08-09)

- Unit: `automation-on-change.test.ts` + SCM engine tests pass
- Webhook push → ingress **202** → F9 batch log → Playwright execution `assistOrigin=f9_on_change` **completed** with `changeEventId`
- Flag: `APZHUB_AUTOMATION_ON_CHANGE=true` (local `.env`)
