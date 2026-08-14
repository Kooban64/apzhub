# SPR-IAM-COMMERCIAL-001 — Implementation evidence

| Field  | Value                                                                         |
| ------ | ----------------------------------------------------------------------------- |
| Status | **LOCAL IMPLEMENTED** 2026-08-10                                              |
| Guide  | [SPR-IAM-COMMERCIAL-001](../../sprint/SPR-IAM-COMMERCIAL-001-sprint-guide.md) |

## Delivered

### Phase 0

- Architecture programme + sprint guide + service/integration/event manifests
- Docs registry updated

### Phase 1 — Live IAM

- Doc-007 personas seeded (`persona-roles.ts` + authorization seed)
- `identity.*` / `admin.*` / `billing.*` / `catalogue.*` / `entitlement.*` permissions
- Org member invite / persona / suspend APIs under `/api/v1/iam/*`
- UI: `/workspace/administration/members`

### Phase 2 — Commercial

- Catalogue SKUs (Team, Enterprise, pen-test, QA report)
- Billing ledger: invoices, payments, credits, refunds, statements, dunning
- PayFast adapter + ITN route
- Entitlement dual-gate helper; pen-test soft-gated in QA Gate packs
- UI: `/workspace/billing`

### Phase 3 — UI

- Shell content max-width + denser padding
- Theme font tokens (Plex) light/dark preserved
- Commercial notice banner (Cursor-like dunning copy)

### Phase 4

- Unit tests (personas, IAM lifecycle, billing/PayFast/dunning)
- Ops runbook + marketplace blueprint

## Proof

```bash
pnpm exec vitest run \
  packages/platform-authorization/src/persona-roles.test.ts \
  apps/web/lib/iam/identity-lifecycle.test.ts \
  apps/web/lib/commercial/billing.test.ts
```
