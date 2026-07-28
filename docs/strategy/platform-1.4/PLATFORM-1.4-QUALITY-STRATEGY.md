# Platform 1.4 Quality Strategy

## Mandatory gates (every ENG/CERT)

`pnpm build` · `pnpm typecheck` · `pnpm lint` · `pnpm format:check` · unit/component · integration · contract · API · OpenAPI validate · architecture/compatibility tests where applicable · migration tests · event replay / idempotency · security · tenant-isolation · Workbench · affected Playwright · certification evidence honesty.

## Platform 1.4 MUST quality items

1. Full monorepo `pnpm test` executed for CERT with PASS or honest FAIL+remediation.
2. Playwright portfolio executed for CERT with PASS or honest FAIL+remediation.
3. Capacity evidence where enabling SSE/delivery workers.
4. Restart-recovery tests for durable notification runtime.
5. No fabricated green results.

## Determination

Full monorepo + Playwright stabilisation is a Platform 1.4 **MUST** for claiming stronger-than-PRWL readiness; at minimum it is **MUST for CERT entry honesty** (may still certify PRWL if residual fails are classified).
