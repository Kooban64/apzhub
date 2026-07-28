# Playwright Review — Platform-1.4-REM-001

## Four OR-001 residuals (ownership)

| Spec                                                                                    | Product         | Platform root cause? | Disposition                    |
| --------------------------------------------------------------------------------------- | --------------- | -------------------- | ------------------------------ |
| `apznotify-004-platform-notifications-workbench` — notifications section lists metadata | **APZ Notify**  | No                   | **RECLASSIFIED** → APZ Notify  |
| `apztcms-022-engineering-intelligence-workbench` — panel tabs / a11y landmarks          | **APZ TCMS**    | No                   | **RECLASSIFIED** → APZ TCMS    |
| `oss-110-14-support-performance.baseline` — Soft timings                                | **APZ Support** | No                   | **RECLASSIFIED** → APZ Support |
| `oss-110-14-support-visual` — analytics screenshot drift                                | **APZ Support** | No                   | **RECLASSIFIED** → APZ Support |

## Evidence

Focused re-run after Chromium install (OR-001/REM): Notify + TCMS specs **passed** in one focused batch; Support Soft + analytics visual **failed** (screenshot dimension drift / Soft baseline). No Platform shell/runtime defect confirmed as root cause.

## Platform action

**CLOSED** — no Platform code change authorised for product UI residuals.

## OR-DEF-004

**CLOSED** (Platform) / **RECLASSIFIED** (product backlogs).
