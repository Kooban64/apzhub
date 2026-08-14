# F13 — Developer Early Check + AI Fix Pack

| Field       | Value                                                                                |
| ----------- | ------------------------------------------------------------------------------------ |
| Status      | **IMPLEMENTED** 2026-08-10 — see `engineering/evidence/F13-DEVELOPER-EARLY-CHECK.md` |
| Bar         | Dev surface + force F10/F11 (+ Playwright when flagged) + AI Fix Pack JSON/markdown  |
| Maps to     | [QUALITY-OPERATING-LOOP.md](../../QUALITY-OPERATING-LOOP.md)                         |
| Not claimed | Certification GO/NO-GO; Portfolio hub (F14); Plane/Zammad tickets (F16); Kiwi/Tuskr  |

## Pattern

```text
changeEventId
  → POST /early-check/.../run  (force quality + security dispatch; optional Playwright)
  → runners ingest evidence
  → GET /ai-fix-packs/by-change/{id}  (JSON | markdown for Cursor)
```

**Early Check ≠ Certification.** Advisory only.

## Surfaces

| Piece       | Path                                                               |
| ----------- | ------------------------------------------------------------------ |
| UI          | `/workspace/qep/early-check` (sidebar **Early Check**)             |
| Module      | `modules/qep-early-check/module.yaml`                              |
| Run API     | `POST /api/v1/qep/early-check/by-change/{id}/run`                  |
| AI Fix Pack | `GET /api/v1/qep/ai-fix-packs/by-change/{id}` (`?format=markdown`) |
| Entry       | SCM “Early Check”; Journey “Open Early Check”                      |

## Libraries

- `apps/web/lib/qep/ai-fix-pack.ts`
- `apps/web/lib/qep/run-early-check.ts`
- `apps/web/components/qep/qep-early-check-views.tsx`

## Env

Same as F9/F10/F11:

- `APZHUB_VERIFICATION_DISPATCH` / `APZHUB_SECURITY_DISPATCH` (often `MODE=record_only` locally)
- `APZHUB_AUTOMATION_ON_CHANGE` (+ optional `APZHUB_AUTOMATION_LIVE`) for Playwright

## Proof checklist

1. Units: `ai-fix-pack.test.ts`, `run-early-check.test.ts`
2. Markdown contains “Not certification” + agent instructions
3. Source policy: no certification mutation from Early Check / AI Fix Pack
4. Module route wired in workspace router

## Explicit outs (this slice)

- F14 Portfolio project registration
- F15 QA Gate packaging
- F16 ALM produce
- Auto-certify / auto GO
