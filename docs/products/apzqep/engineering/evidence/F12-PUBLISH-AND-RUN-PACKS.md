# F12+ — Publish report pack + self-serve run packs + live GHA stubs

| Field                 | Value                                                                               |
| --------------------- | ----------------------------------------------------------------------------------- |
| Status                | **IMPLEMENTED** 2026-08-10                                                          |
| Viable                | Signed/published report · Journey “run packs” · `verify.yml` / `security.yml` stubs |
| Not viable (deferred) | Faraday as product · Kali as QEP UI module                                          |

## Verdict on earlier gaps

| Gap                                    | Decision                                                    |
| -------------------------------------- | ----------------------------------------------------------- |
| Faraday aggregator                     | **Defer** — optional later; same ingest pattern when needed |
| Kali as product module                 | **No** — runner image / cluster only (F11 architecture)     |
| Live GHA `security.yml` / `verify.yml` | **Yes** — stubs shipped; leave `record_only` for live       |
| Signed/published report workflow       | **Yes** — human residual-risk + decision; not GO/NO-GO      |
| Self-serve “run all packs” UI          | **Yes** — Journey force re-dispatch F10+F11                 |

## APIs

| Method | Path                                                | Notes                                                                  |
| ------ | --------------------------------------------------- | ---------------------------------------------------------------------- |
| `POST` | `/api/v1/qep/report-packs/by-change/{id}`           | Publish: `signerName`, `decision`, `residualRiskStatement` (≥20 chars) |
| `GET`  | same                                                | Overlay published sign-off when present                                |
| `POST` | `/api/v1/qep/verification-packs/by-change/{id}/run` | `{ packs: ["quality","security"], force: true }`                       |

Publish does **not** call certification GO/NO-GO.

## Live GHA (leave record_only)

1. Workflows: `.github/workflows/verify.yml`, `.github/workflows/security.yml`
2. Env: set `APZHUB_VERIFICATION_DISPATCH=true` / `APZHUB_SECURITY_DISPATCH=true`
3. Set `…_OWNER` / `…_REPO` / `…_WORKFLOW` (`verify.yml` / `security.yml`)
4. **Unset** `…_MODE=record_only` (or set anything other than `record_only`/`dry`)
5. PAT: `APZHUB_SCM_GITHUB_TOKEN` with `actions:write`
6. Optional secrets on the Actions side: `QEP_INGEST_URL`, `QEP_INGEST_TOKEN` for runner → ingest

Until runners POST executions, ledger shows `dispatched` and Journey still requires human certify.

## UI

Quality Journey (`/workspace/qep/quality-journey?changeEventId=…`):

- **Run quality + security packs**
- **Publish report pack** (signer / residual risk / decision)

## Proof

- Units: `report-pack-publish.test.ts`, force re-dispatch in `security-dispatch-on-change.test.ts`
- Policy: publish + run-packs never mutate certification outcomes
