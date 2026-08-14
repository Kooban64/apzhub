# Flagship hardening — durable ledgers + UI wiring (F13–F16)

| Field          | Value                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| Status         | **LOCAL IMPLEMENTED** 2026-08-10                                                                       |
| Scope          | File-backed QEP ledgers; workbench nav for operating-loop modules; cross-links + Defect ALM produce UI |
| Non-negotiable | Never auto-certifies; PAT server-side; Module → Gateway → Platform Services only                       |

## Hardening (persistence)

Shared helper: `apps/web/lib/qep/qep-ledger-fs.ts`

| Ledger                          | Path under `apps/web/.data/`                     | Notes                      |
| ------------------------------- | ------------------------------------------------ | -------------------------- |
| Quality projects (F14)          | `qep-quality-projects/{id}.json`                 | Survives web restart       |
| QA Gate confirmations (F15)     | `qep-qa-gate-confirmations/{changeEventId}.json` | Human confirm only         |
| ALM produce (F16)               | `qep-alm-produce/ledger.json`                    | record_only / live intents |
| Verification dispatch (F10/F11) | `qep-verification-dispatches/ledger.json`        | Advisory ops view          |
| Report packs (F12)              | `qep-report-packs/published/`                    | Pre-existing async publish |

Persist is **off** under Vitest / `NODE_ENV=test`. Force with `APZHUB_QEP_LEDGER_PERSIST=true`. Optional `APZHUB_QEP_DATA_DIR`.

## UI / UX wiring

Workbench manifests mirrored (sidebar discovery):

- `qep-portfolio`, `qep-early-check`, `qep-quality-journey`, `qep-scm`, `qep-defects`, `qep-certification`, `qep-automation` (+ existing `qep`, `qep-quality-flows`)

Cross-links:

- Early Check ↔ Journey / Portfolio / SCM
- Journey ↔ Early Check / Portfolio
- Portfolio linked repos → SCM repository pages
- SCM home → Portfolio / Early Check / Journey
- Defect detail → **Produce fix work items (F16)** + produce history

## Proof commands

```bash
pnpm exec vitest run apps/web/lib/qep/qep-ledger-fs.test.ts \
  apps/web/lib/qep/qa-gate.test.ts \
  apps/web/lib/qep/alm-produce-from-defect.test.ts
```

Restart `@apzhub/web` after deploy so discovery picks up mirrored manifests.

## Owner check

1. Quality sidebar shows Portfolio, Early Check, Quality Journey, Source Control, Defects.
2. Create a quality project; restart web; project still listed.
3. From SCM change row → Early Check / Journey; from Portfolio repo → SCM.
4. Defect detail → Produce fix work items (record_only ledger under `.data`).
