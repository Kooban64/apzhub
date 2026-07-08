# LAW-015-12 — Technical Debt & LAW-015-13 Recommendation

---

## Technical debt

| Item                                             | Severity | Notes                                                                |
| ------------------------------------------------ | -------- | -------------------------------------------------------------------- |
| PDF export                                       | Medium   | Placeholder 422 only — requires approved PDF engine in future sprint |
| Excel/XLSX                                       | Low      | Not requested; CSV covers spreadsheet import                         |
| Workbench uses in-process export                 | Low      | REST export route available; UI does not call API yet                |
| OpenAPI registration                             | Low      | Export path not yet in `LAW-OpenAPI-v1.yaml`                         |
| `legal.trust.export` permission                  | Low      | Spec'd but not wired — export uses `legal.trust.report`              |
| Statement reports need client/matter in API POST | Low      | Generate API still omits period/client/matter passthrough            |

---

## Test report summary

- **1844** tests passed, **44** skipped
- **28** new tests (export serializers, API, UI)
- All quality gates green

---

## Recommendation for LAW-015-13

**Proposed title:** Trust Integration & E2E Validation (per backlog)

Priority order after owner sign-off:

1. **Trust E2E Playwright journey** — generate report → export CSV → verify download
2. **Event/notification wiring** — register `legal.trust.report.generated` for activity stream
3. **Workbench API backing** — optional switch from in-process to REST for reports
4. **OpenAPI update** — document export endpoints
5. **Scheduled report delivery** — deferred; requires job infrastructure

Defer bank integration and Financial Engine extraction per phase gate.
