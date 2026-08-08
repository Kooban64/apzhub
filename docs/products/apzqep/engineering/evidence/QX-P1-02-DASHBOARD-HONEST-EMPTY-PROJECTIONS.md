# QX-P1-02 — Dashboard projection honesty

| Field       | Value                                                                                         |
| ----------- | --------------------------------------------------------------------------------------------- |
| Timestamp   | 20260808T054600Z                                                                              |
| Disposition | **CLOSE**                                                                                     |
| Residual    | Wave 4 completion / demo KPI placeholders                                                     |
| Code        | `packages/qep-dashboards/src/projections/projection-store.ts`                                 |
| Suite       | `packages/qep-dashboards/src/projections/projection-store.test.ts` · `qep-dashboards.test.ts` |
| UI          | `apps/web/components/qep/qep-dashboards-views.tsx`                                            |

---

## Decision

**Closed — implemented and evidenced.**

Persona dashboard projections no longer fabricate quality metrics. Unbound projections return honest-empty payloads with attribution `empty:no_system_of_record_binding`. Bound SoR reads remain an optional future enhancement and are not required to close this residual.

---

## Evidence

| Check                                                                           | Result      |
| ------------------------------------------------------------------------------- | ----------- |
| KPI projections use honest empty (`No data`) + empty attribution                | PASS        |
| Chart / list / timeline / risk-matrix empties have zero fabricated series/items | PASS        |
| Confidence / readiness surfaces empty status, not invented scores               | PASS        |
| Package regression (persona dashboards without business calculations)           | PASS        |
| UI shows honest-empty copy for unbound projections                              | Implemented |

---

## Acceptance criteria (from inventory)

| Criterion                                                       | Met                |
| --------------------------------------------------------------- | ------------------ |
| Persona dashboards show SoR-attributed data **or honest empty** | Yes (honest empty) |
| No fabricated KPI values                                        | Yes                |
