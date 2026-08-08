# APZ Support — Operations Guide (v1.0)

## Health

- `GET /api/v1/health` / readiness — gateway, mapping store, providers, `zammadEnabled`
- Production + Zammad enabled + providers unregistered → readiness **not_ready**

## Incident

Follow [support-adapter-unhealthy.md](../../../../operations/runbooks/support-adapter-unhealthy.md). Fail closed (503); never empty success.

## Backup

Platform Postgres: `platform_entity_mapping` (Support ID bindings). Engine owns ticket business data.

## Evidence

[../ENGINEERING-EVIDENCE-PACK.md](../ENGINEERING-EVIDENCE-PACK.md) · [../../engineering/evidence/SUP-PR-06-OPS-READINESS.md](../../engineering/evidence/SUP-PR-06-OPS-READINESS.md)
