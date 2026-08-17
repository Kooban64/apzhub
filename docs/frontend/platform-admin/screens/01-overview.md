# Screen — Overview

| Field          | Value                                                    |
| -------------- | -------------------------------------------------------- |
| Route (target) | Platform Admin → Overview                                |
| Status         | **LOCKED · FIRST VISUAL** · **IMPLEMENTED** (2026-08-17) |
| Route (live)   | `/platform-admin`                                        |

## Intent

Operational control centre for the commercial platform. **Not** a collection of oversized metric cards.

## Cursor instruction

> Build Platform Admin Overview as a dense operational console. Avoid oversized metric cards. The upper status strip provides immediate platform state. The middle region uses two-column operational summaries. Attention Required is a compact actionable table. Recent Platform Activity forms the bottom operational timeline. All metrics must use real backend data or explicitly show unavailable/loading/error state; never manufacture healthy states or sample production numbers.

## Layout

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Overview                                                               Last 24 hours ▾ │
│ Platform operations, customers and services                                            │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│ PLATFORM STATUS                                                                         │
│                                                                                         │
│ ● Operational        42 Tenants        386 Users        7 Providers       2 Warnings   │
│                                                                                         │
├──────────────────────────────────────────────┬──────────────────────────────────────────┤
│ TENANTS                                      │ PLATFORM HEALTH                          │
│                                              │                                          │
│ Active                              38       │ Identity              ● Healthy          │
│ Trial                                3       │ Search                ● Healthy          │
│ Suspended                            1       │ Notifications         ● Healthy          │
│                                              │ Activity              ● Healthy          │
│ Provisioning Issues                  2       │ Provisioning          ◐ Degraded         │
│                                              │ Realtime              ● Healthy          │
│ [View Tenants →]                             │                                          │
├──────────────────────────────────────────────┼──────────────────────────────────────────┤
│ PROVISIONING                                 │ BILLING                                  │
│                                              │                                          │
│ Pending                              12      │ Monthly Revenue             R xxx,xxx    │
│ Processing                            3      │ Outstanding                  R xx,xxx    │
│ Failed                                2      │ Failed Payments                     2    │
│ Completed today                      41      │ Renewals — 30 days                  11    │
│                                              │                                          │
│ [Open Provisioning →]                        │ [Open Billing →]                        │
├──────────────────────────────────────────────┴──────────────────────────────────────────┤
│ ATTENTION REQUIRED                                                                      │
│                                                                                         │
│ Severity │ Area          │ Tenant        │ Issue                         │ Age           │
│ ─────────┼───────────────┼───────────────┼───────────────────────────────┼────────────── │
│ Warning  │ Provisioning  │ Acme Bank     │ Zammad provisioning failed   │ 18 min        │
│ Warning  │ Billing       │ Zen Retail    │ Payment retry required        │ 2 hrs         │
│ Info     │ Subscription  │ Example Ltd   │ Trial expires in 3 days       │ —             │
│                                                                                         │
│                                                        [View All Issues →]              │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ RECENT PLATFORM ACTIVITY                                                                │
│                                                                                         │
│ 08:42  Acme Bank      Added 12 APZPRD licences                          John Smith      │
│ 08:31  Platform       Provider health restored — Metabase               System          │
│ 08:17  Zen Retail     Subscription payment failed                       PayFast         │
│ 07:56  APZOR          User provisioning completed                       System          │
│                                                                                         │
│                                                        [View Audit →]                   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

## Regions

| Region                                    | Behaviour                                                                                      |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Time range                                | Header control (`Last 24 hours` etc.) — filters strip + attention + activity                   |
| Platform status                           | Single dense strip: overall state · tenant count · user count · provider count · warning count |
| Tenants / Health / Provisioning / Billing | Two-column summaries with deep links                                                           |
| Attention Required                        | Compact severity table — actionable                                                            |
| Recent activity                           | Timeline → Audit                                                                               |

## Honesty

Numbers in the ASCII wireframe are **illustrative only**. Implementation must bind live APIs or show unavailable states. Provider names may appear in Attention/Activity when the event is provider-scoped; Prefer capability names in Platform Health.
