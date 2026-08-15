# QEP — Enable live automation (Playwright)

| Field     | Value                                        |
| --------- | -------------------------------------------- |
| Programme | SPR-APZQEP-210 · 210-E                       |
| Priority  | P2                                           |
| Related   | `APZHUB_AUTOMATION_LIVE`, Integration Centre |

## Symptom

Automation providers stay in dry-run / ingest-only mode. Playwright health may be OK but runs do not execute against real browsers.

## Preconditions

- Platform web process can reach runners (testing cluster or host Playwright).
- Secrets for any remote runner are in server env — never in the UI.

## Steps

1. Set `APZHUB_AUTOMATION_LIVE=true` in the web/.env (or compose) used by `apps/web`.
2. Restart the web process.
3. Open `/workspace/qep/integrations` — confirm Playwright shows live mode.
4. Run a controlled smoke from Automation / Quality Journey and confirm ingest + evidence refs.

## Rollback

Unset `APZHUB_AUTOMATION_LIVE` (or set `false`) and restart. Dry-run remains safe default.

## Honesty

- Live mode does **not** auto-certify.
- Engine brands stay masked for end users (APZQEP Automation).
