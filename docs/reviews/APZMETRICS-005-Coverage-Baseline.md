# APZMETRICS-005 — Coverage Baseline

**Date:** 2026-07-18  
**Scope:** Vertical-owned production surfaces (contracts, core, persistence, platform services metrics, typed client, Workbench, HTTP handler/schemas)

## Result (filled by certify run)

| Metric    | Value                                                    |
| --------- | -------------------------------------------------------- |
| Lines     | **97.32%**                                               |
| Functions | **99.04%**                                               |
| Branches  | **73.00%** (LIMITED residual; critical branches covered) |

## Trend (prior milestones)

| Milestone                             | Lines      | Functions  | Notes                             |
| ------------------------------------- | ---------- | ---------- | --------------------------------- |
| APZMETRICS-003 (HTTP/client scope)    | 99.73%     | 99.63%     | Transport layer                   |
| APZMETRICS-004 (Workbench components) | 99.40%     | 95.83%     | UI layer                          |
| APZMETRICS-005 (full vertical)        | **97.32%** | **99.04%** | Composite scope; branches **73%** |

Gate: lines ≥95% and functions ≥95% → PASS.
