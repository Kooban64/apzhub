# Operations

1. Ensure `APZHUB_OBSERVE_ENABLED=true` + DATABASE_URL.
2. Inventory alert definitions with `metadata.rule`.
3. Set `APZHUB_OBSERVE_ALERT_EVALUATION_ENABLED=true`.
4. Invoke `POST /api/v1/observe/alert-evaluation` (or schedule worker calling evaluateBatch).
5. Monitor `/alert-evaluation/health` + diagnostics.
6. Acknowledge/resolve/suppress via API/workbench.

Rollout: enable in non-prod first; confirm events; then production.
