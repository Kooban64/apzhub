# OSS-110-14 Performance Report — Support Module UI

> **Milestone:** OSS-110-14 — Support Module UI Certification & Production Readiness  
> **Date:** 2026-07-11  
> **Verdict:** **PASS** (measurement-only soft baseline; hard fail &lt; 30s)  
> **Suite:** `testing/playwright/e2e/oss-110-14-support-performance.baseline.spec.ts`  
> **Master:** [SUPPORT-UI-CERTIFICATION.md](../architecture/SUPPORT-UI-CERTIFICATION.md)

---

## Scope

Record Soft navigation timings for major Support views under **mocked** `/api/v1`. This is a **measurement baseline for trend collection**, not a production Zammad latency SLA and not a live-engine performance certification.

---

## Method

For each view:

1. Sign in + mock Support API.
2. `page.goto(path, { waitUntil: "domcontentloaded" })`.
3. Wait until the Support ready testid is visible (timeout 30s).
4. Record elapsed ms.
5. Log `SUPPORT_UI_PERF_BASELINE {…}` to CI stdout.
6. Soft warn if any timing ≥ 15_000 ms; hard fail only if ≥ 30_000 ms.

---

## Sample baseline (certification run)

Logged marker shape:

```text
SUPPORT_UI_PERF_BASELINE {"inboxMs":…,"detailMs":…,"searchMs":…,"analyticsMs":…,"recordedAt":"…"}
```

**Sample values used for OSS-110-14 closeout documentation:**

| Metric        | Sample (ms) |
| ------------- | ----------- |
| `inboxMs`     | ~653        |
| `detailMs`    | ~599        |
| `searchMs`    | ~520        |
| `analyticsMs` | ~1130       |

Environment: CI / local Playwright Chromium against mocked API. Absolute numbers vary by machine load; the gate is catastrophic-slowness protection, not a fixed budget.

---

## Results

| Check                  | Result                                              |
| ---------------------- | --------------------------------------------------- |
| Soft timings recorded  | ✅ PASS                                             |
| All views &lt; 30s     | ✅ PASS                                             |
| **Suite contribution** | **1 test** (part of Playwright **23 passed** total) |

---

## Interpretation

- Timings include Next.js route load + React render + mocked network resolution to ready testids.
- They **do not** measure live Zammad, gateway cold-start under load, or multi-tenant production hardware.
- Use the `SUPPORT_UI_PERF_BASELINE` log line for future trend comparison when re-running the suite.

---

## Limitations

- Mocked API only — not engine SoR latency.
- Single soft measurement per run (not a statistical percentile suite).
- No Event Bus / realtime refresh performance (out of scope).
- Analytics higher than inbox/detail is expected for denser metric UI under the same mock posture.

---

## Companion

- API vertical performance (HTTP/gateway): [OSS-110-12-performance-baseline.md](./OSS-110-12-performance-baseline.md)
- Visual: [OSS-110-14-visual-regression-report.md](./OSS-110-14-visual-regression-report.md)
- Completion: [OSS-110-14-completion-report.md](./OSS-110-14-completion-report.md)
