# F10 — Verification dispatch (Option B)

| Field       | Value                                                                                                |
| ----------- | ---------------------------------------------------------------------------------------------------- |
| Status      | **LOCAL PROOF** 2026-08-09                                                                           |
| Bar         | Durable change → dispatch external runners for domain tools → ingest reports                         |
| Not claimed | Running Vitest/ZAP/k6 inside the portal process; auto GO/NO-GO; Greenbone/Faraday/Kali in this slice |

## Pattern (also for later pen-test tools)

```text
Change persists
  → APZQEP dispatches job (GHA / webhook) with changeEventId + domains
  → Runner executes tool with the right inputs
  → Runner POSTs report to /api/v1/qep/automation/executions
  → Evidence links to change → RC domains fill
  → Human GO/NO-GO
```

**Yes — with the right payload/report format we can get results back.**  
F10 domains use existing ingest normalizers (Vitest JSON, axe, SARIF, k6, …).  
Greenbone / Faraday / Kali (and similar) follow the **same** pattern later: dispatch scan job → normalize findings/SARIF (or adapter) → ingest. They are not “magic remote control of Kali desktop”; they are **job + report contract**.

## Env

| Flag                                            | Meaning                                                             |
| ----------------------------------------------- | ------------------------------------------------------------------- |
| `APZHUB_VERIFICATION_DISPATCH=true`             | Enable F10                                                          |
| `APZHUB_VERIFICATION_DISPATCH_MODE=record_only` | Ledger without calling GitHub (local)                               |
| `…_OWNER` / `…_REPO` / `…_WORKFLOW`             | GitHub Actions workflow_dispatch target                             |
| `…_DOMAINS`                                     | e.g. `vitest,accessibility,security,codequality,k6`                 |
| `…_WEBHOOK_URL`                                 | Alternate generic runner webhook                                    |
| PAT                                             | Reuse `APZHUB_SCM_GITHUB_TOKEN` (`actions:write` for live dispatch) |

## Proof checklist

1. Unit: `verification-dispatch-on-change.test.ts`
2. Flag on + webhook → dispatch ledger row (`assistOrigin=f10_verification_dispatch`)
3. `GET /api/v1/qep/verification-dispatches?changeEventId=`
4. Journey UI shows External verification dispatches
5. No cert mutation from dispatch source

## Local proof (2026-08-09)

- Units: 4 pass
- Webhook → ingress 202 → F10 batch → ledger `dispatched` / `github_actions` / domains `vitest,accessibility,security,codequality,k6` (`record_only` mode)
- **Live:** `.github/workflows/verify.yml` stub present — unset `APZHUB_VERIFICATION_DISPATCH_MODE=record_only`, set owner/repo/workflow + PAT `actions:write`; CI job POSTs ingest with `changeEventId` (see `F12-PUBLISH-AND-RUN-PACKS.md`)
