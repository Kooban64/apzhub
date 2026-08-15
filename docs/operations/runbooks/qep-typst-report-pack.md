# QEP — Typst PDF report packs

| Field     | Value                                  |
| --------- | -------------------------------------- |
| Programme | SPR-APZQEP-210 · 210-E                 |
| Priority  | P2                                     |
| Related   | `APZHUB_TYPST_BIN`, report pack export |

## Symptom

`GET /api/v1/qep/report-packs/by-change/{id}?format=pdf` returns `pdf.available: false` with `typst_binary_not_found`.

## Steps

1. Install Typst (`https://typst.app`) or place binary at `tooling/bin/typst`.
2. Or set `APZHUB_TYPST_BIN=/absolute/path/to/typst`.
3. Restart web.
4. Re-export PDF from Quality Journey / report pack API.
5. Confirm durable files under `apps/web/.data/qep-report-packs/{packId}/` (`security-bill-of-health.pdf` + `pdf-manifest.json`).
6. Confirm QEP Audit shows `report_pack.pdf_rendered`.

## Residual

Object-store / WORM is not required for MVP; local durable default matches Evidence posture.
