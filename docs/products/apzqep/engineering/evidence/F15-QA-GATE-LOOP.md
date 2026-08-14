# F15 — QA Gate Loop (+ pen-test for QA)

| Field       | Value                                                                                                                                        |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Status      | **IMPLEMENTED** 2026-08-10                                                                                                                   |
| Bar         | Checklist · QA runs quality **and pen-test** packs · confirm findings → optional defects · Fix Direction Pack · RC GO/NO-GO remains separate |
| Maps to     | [QUALITY-OPERATING-LOOP.md](../../QUALITY-OPERATING-LOOP.md)                                                                                 |
| Not claimed | Auto GO; Kiwi/Tuskr; Plane ticket produce (F16); LLM auto-accept specs                                                                       |

## Pattern

```text
QA opens Journey for change
  → POST …/qa-gate/…/run-packs  (quality + security/pen-test, force)
  → ingest evidence / findings
  → POST …/confirm  (human confirm; optional QEP defects)
  → GET …/fix-direction-packs/…  (markdown for Dev / Cursor)
  → RC human GO/NO-GO (unchanged)
```

**QA may run pen tests** — security pack domains (Trivy/Semgrep/Nuclei/ZAP; Greenbone when configured). Same F11 spine; assistOrigin `f15_qa_gate`.

## APIs

| Method | Path                                                                           |
| ------ | ------------------------------------------------------------------------------ |
| `GET`  | `/api/v1/qep/qa-gate/by-change/{id}`                                           |
| `POST` | `/api/v1/qep/qa-gate/by-change/{id}/run-packs` (`includePenTest` default true) |
| `POST` | `/api/v1/qep/qa-gate/by-change/{id}/confirm`                                   |
| `GET`  | `/api/v1/qep/fix-direction-packs/by-change/{id}?format=markdown`               |

## UI

Quality Journey panel **QA Gate (F15)** — checklist, **Run quality + pen-test packs**, confirm findings, Fix Direction Pack, RC link.

## Proof

1. Units: `qa-gate.test.ts`
2. Policy: no certification mutation from gate/run/fix-direction sources
3. Pen-test included by default on QA run-packs

## Outs

- Treating QA Gate confirm as GO
- Tuskr/Kiwi
- F16 ALM produce
