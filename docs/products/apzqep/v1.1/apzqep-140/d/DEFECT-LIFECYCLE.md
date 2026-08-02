# Defect Lifecycle

States: `NEW` → `TRIAGED` → `ASSIGNED` → `IN_PROGRESS` → `FIXED` → `READY_FOR_RETEST` → `VERIFIED` → `CLOSED` → `ARCHIVED`.

Terminal / alternate: `REJECTED`, `DUPLICATE`, `WONT_FIX` (then close/archive).

All transitions governed via `assertTransition`. Assign from `new`/`triaged` may auto-enter `assigned`. Reopen: `closed` → `new`.
