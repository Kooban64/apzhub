# Engineering Intelligence — Trend Engine

**Milestone:** APZTCMS-021

## Directions (no forecasting)

`increase` | `decrease` | `stable` | `improving` | `declining` | `unknown`

- Absolute delta &lt; 1 → `stable`
- Delta ≥ 5 → `improving`; &gt; 0 → `increase`
- Delta ≤ −5 → `declining`; &lt; 0 → `decrease`
- Fewer than two points → `unknown`

## Series kinds

quality, coverage, execution, automation, regression, release, certification, defect, lead_time, stability, risk, velocity

## Persistence

`testing_engineering_trend_series` — period kinds: daily, weekly, monthly, quarterly, release, custom.
