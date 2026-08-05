# Product Experience — TIME-NATIVE-001-A03

| Field     | Value            |
| --------- | ---------------- |
| Status    | **COMPLETE**     |
| Timestamp | 20260804T200500Z |

## Native product signals

| Signal         | Result                                                             |
| -------------- | ------------------------------------------------------------------ |
| Terminology    | Timesheets, activities, customers, tags — APZHUB product language  |
| Icons          | Lucide via module manifest (`clock`, `layout-dashboard`, …)        |
| Page titles    | Product page titles under **APZ Time** chrome                      |
| Empty states   | APZ Time copy + create CTAs where permitted                        |
| Loading states | “Loading APZ Time…”                                                |
| Error states   | Sanitised messages; Retry                                          |
| Help           | Native Getting Started / Documentation / Support — no engine links |
| Settings       | Compact lists + onboarding tip only — never engine configuration   |

## Leakage controls

| Rule                       | Enforcement                                                             |
| -------------------------- | ----------------------------------------------------------------------- |
| No engine terminology      | Boundary test + copy audit                                              |
| No adapter terminology     | Product/operator framing only                                           |
| No implementation URLs     | Routes remain `/workspace/time…`                                        |
| No raw JSON for end users  | Summary cards; developer `<details>` uses `formatSafeDiagnosticsJson`   |
| No adapter console feeling | “Platform readiness” + “Run readiness check”; ops gated by `time.admin` |

## Human labels (G-08)

Timesheet detail resolves activity, customer, and tag **names**. Raw mono IDs and time-domain project fields are not shown in the product surface (G-09 deferred).
