# PERFORMANCE-REVIEW — APZQEP-150-02

| Field      | Value                                           |
| ---------- | ----------------------------------------------- |
| Workstream | 150-02 Performance & Scalability                |
| Result     | **PASS** (observational — LIMITED_AVAILABILITY) |
| Timestamp  | 20260802T184500Z                                |
| Method     | Process-local microbench — no invented claims   |

---

## Observed timings

Source: `pnpm exec tsx testing/apzqep-150/performance-microbench.mjs`  
Observed at: `2026-08-02T18:43:44.653Z`

| Metric                   |                         Observation |
| ------------------------ | ----------------------------------: |
| Suite create ×200        |                   **3.76 ms** total |
| Suite list (200)         |                        **12.54 ms** |
| Plan create ×50          |                   **2.23 ms** total |
| Executive dashboard ×100 | **4.40 ms** total (**0.04 ms** avg) |
| Heap used (after run)    |                        **10.41 MB** |

Environment: single Node process, in-memory Cap factories — **not** production HTTP, concurrency, or multi-instance load.

---

## Coverage vs workstream checklist

| Area                    | Status                     | Notes                                                                        |
| ----------------------- | -------------------------- | ---------------------------------------------------------------------------- |
| Workspace load time     | **Not measured (browser)** | No Playwright timing harness in this pass; shell exists under FEATURE FREEZE |
| API latency             | **Not measured (HTTP)**    | Handler path authenticated; microbench is domain-service level               |
| Projection performance  | **Observed**               | Dashboard metrics calculation sub-ms in-process                              |
| Command execution       | **Prior unit PASS**        | `@apzhub/qep-command` tests pass                                             |
| Notification throughput | **Prior unit PASS**        | `@apzhub/qep-notification` tests pass; external adapters deferred            |
| Dashboard rendering     | **Partial**                | Service-side metrics PASS; browser paint not timed                           |
| Search latency          | **Prior platform**         | QKI unit tests pass; product search not load-tested                          |
| Memory usage            | **Observed**               | ~10 MB heap in microbench                                                    |
| Large dataset           | **Partial**                | 200 suites / 50 plans in-memory only                                         |
| Concurrency             | **Not measured**           | IN-MEMORY SoR is single-process                                              |
| Long-running sessions   | **Not measured**           | Documented limitation                                                        |

---

## Assessment

Performance of Cap domain services in-process is **not** a release blocker for LIMITED_AVAILABILITY. Unrestricted production requires durable SoR load testing (EN-001) — out of scope.

Workstream 150-02: **COMPLETE / PASS** with disclosed measurement limits.
