# Quick Start Guide — Enterprise Automation (Wave 1)

| Field       | Value                                                  |
| ----------- | ------------------------------------------------------ |
| Audience    | QA engineers, developers, operators                    |
| Time        | **10–15 minutes**                                      |
| Outcome     | First successful Playwright dry-run with evidence refs |
| Programme   | APZQEP-161R                                            |
| Engineering | Unchanged (guide only)                                 |

---

## Prerequisites

- APZHUB monorepo with APZQEP GA stack available (auth, web app).
- `pnpm` installed; packages present: `@apzhub/platform-automation`, `@apzhub/qep-automation`.
- Permission to open QEP workspace (automation module M07).

Live browser execution is **optional** and not required for this walkthrough.

---

## Walkthrough

### 1. Install / start (≈3–5 min)

```bash
pnpm install
# Start web / compose per your ENVIRONMENT.md and GA ops runbooks
```

Confirm the app is reachable and you can sign in.

### 2. Open Enterprise Automation (≈1 min)

Navigate to:

`/workspace/qep/automation`

You should see **Enterprise Automation** with an empty or existing execution queue.

### 3. Confirm providers (≈1 min)

Open **Providers**.

Expect:

| Provider   | Status      |
| ---------- | ----------- |
| Playwright | **active**  |
| Others     | placeholder |

Placeholders must not be used for first run.

### 4. Run first execution (≈1–2 min)

On the Automation home, click **Run Playwright dry-run**.

This calls the provider-neutral API:

`POST /api/v1/qep/automation/executions` with `providerId: "playwright"` and `options.dryRun: true`.

### 5. Inspect results (≈3–5 min)

1. Find the new row in queue/history (state should reach **completed**).
2. Open the execution detail.
3. Confirm:
   - Live status / summary
   - Timing metrics
   - Artifacts (log, screenshot, video, trace, metadata — Wave 1 dry-run produces artifact metadata)
   - Evidence references

### 6. Optional API check (≈2 min)

```bash
# List providers
curl -sS "$BASE/api/v1/qep/automation/providers" -H "Authorization: Bearer $TOKEN"

# List executions
curl -sS "$BASE/api/v1/qep/automation/executions" -H "Authorization: Bearer $TOKEN"
```

### 7. Optional live mode (advanced)

Only if you need a real browser:

1. Install Playwright peer dependency and browsers per Playwright docs.
2. Set `APZHUB_AUTOMATION_LIVE=true`.
3. Re-run with `dryRun: false`.

Default teams should stay on dry-run for Wave 1 certification paths.

---

## Success checklist

- [ ] Workspace opens
- [ ] Playwright shows as active
- [ ] Dry-run completes
- [ ] Artifacts listed
- [ ] Evidence refs present
- [ ] History shows the run

If all boxes are checked, the team has completed Wave 1 first-run adoption.

## Where next

- Repeatable demo: [DEMO-SCRIPT.md](./DEMO-SCRIPT.md)
- Support: [SUPPORTABILITY-REVIEW.md](./SUPPORTABILITY-REVIEW.md)
- Engineering reference: [../apzqep-161/](../apzqep-161/)
