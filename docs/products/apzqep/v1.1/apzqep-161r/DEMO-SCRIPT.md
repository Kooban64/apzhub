# Demo Script — APZQEP Enterprise Automation (Wave 1)

| Field     | Value                                            |
| --------- | ------------------------------------------------ |
| Duration  | **12–18 minutes**                                |
| Audience  | Customers, executives, internal stakeholders     |
| Goal      | Show end-to-end Wave 1 automation story honestly |
| Programme | APZQEP-161R                                      |
| Mode      | **Dry-run by default** (call out clearly)        |

---

## Narrative spine

```text
Select Automation workspace
        ↓
Show provider-neutral registry (Playwright first)
        ↓
Execute Playwright (dry-run)
        ↓
Watch lifecycle → completed
        ↓
Review artifacts & evidence references
        ↓
Show history / operator confidence
        ↓
Explain future: GitHub → APZQEP → Playwright → Evidence → Release readiness
```

Emphasise: **APZQEP orchestrates quality** — Playwright is the first provider, not the product.

---

## Script

### Opening (1–2 min)

> “APZQEP is an Enterprise Quality Engineering Platform. Version 1.0 gave us governed core QE, evidence, and operations. Wave 1 adds a provider-neutral Automation Foundation — so every future engine plugs into the same lifecycle, evidence, and certification model.”

### Scene 1 — Workspace (1 min)

1. Open `/workspace/qep/automation`.
2. Point to Enterprise Automation title and queue.
3. Note shared shell (consistent with Core QE).

### Scene 2 — Providers (2 min)

1. Open Providers.
2. Highlight Playwright **active**.
3. Show placeholders (Selenium, Cypress, Appium, REST, k6, visual, accessibility).
4. Line: “We do not embed one vendor into the product identity.”

### Scene 3 — Execute (2–3 min)

1. Return home; click **Run Playwright dry-run**.
2. Say: “Wave 1 certifies the full lifecycle with dry-run by default so teams can adopt without browser install friction. Live mode is available when ready.”
3. Wait for completion in the table.

### Scene 4 — Evidence & timeline (4–5 min)

1. Open execution detail.
2. Show status badge + summary.
3. Show timing / timeline panel.
4. Show artifacts list (screenshots, videos, traces, logs as metadata).
5. Show evidence references.
6. Honest caveat: “Binary media viewers and live console streaming are polish items; the evidence pipeline and refs are already wired.”

### Scene 5 — History & operability (2 min)

1. Return to queue/history.
2. Show multiple runs if available.
3. Mention cancel/API for operators.

### Scene 6 — The Wave 2 story (2 min) — **do not implement**

> “Next, with Board certification, Wave 2 integrations let a developer push to GitHub, APZQEP orchestrate Playwright, collect evidence, and inform release readiness — without redesigning this engine.”

Stop. Do not open GitHub UI or claim Wave 2 is live.

---

## Demo environment checklist

- [ ] App running; user signed in
- [ ] Automation module visible
- [ ] Dry-run succeeds in rehearsal
- [ ] At least one prior execution for history (optional)
- [ ] Talking points for residuals ready

## Do not claim in Wave 1 demos

- Live GitHub/GitLab pipelines
- AI quality analysis
- Executive dashboards (Wave 164)
- Full media theatre (screenshot stream / video player) unless separately delivered later
