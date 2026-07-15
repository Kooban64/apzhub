# APZ TCMS — Normalization Rules

**Milestone:** APZTCMS-007  
**Source:** `packages/testing-services/src/automation/normalization.ts`

---

## Result status mapping

| Provider examples                             | Canonical   |
| --------------------------------------------- | ----------- |
| pass, passed, success, ok, successful         | `pass`      |
| fail, failed, failure                         | `fail`      |
| skip, skipped, pending, todo, xfail (as skip) | `skipped`   |
| blocked, blocked_on                           | `blocked`   |
| timedOut, timedout, timeout, timed_out        | `timed_out` |
| cancelled, canceled, aborted                  | `cancelled` |
| error, errored, broken                        | `errored`   |
| anything else                                 | `unknown`   |

Unknown provider states **must not throw** during normalization — they map to `unknown` and remain visible for review.

---

## Import statuses

`pending → validating → importing → completed | failed | duplicate | corrected`

Duplicates are detected by tenant-scoped `(adapter_kind, external_run_ref)` and/or payload fingerprint.
