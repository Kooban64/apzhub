# Production Smoke Tests — Platform 1.2.0

> **Programme:** APZHUB-OPS-002 · **Action:** A7

## Command

```bash
export PLAYWRIGHT_BASE_URL="https://<hostname>:3443"   # or public URL
pnpm test:production-smoke
```

Config: `testing/e2e/production-smoke/`.

## Minimum checks (suite)

- Health endpoint reachable
- Auth / login surface
- Shell / workbench loads
- Critical path smoke as defined in PRH-017 suite

## When to run

| Gate              | Required    |
| ----------------- | ----------- |
| Post-deploy       | **Yes**     |
| Post-rollback     | **Yes**     |
| Post-restore      | **Yes**     |
| Weekly (optional) | Recommended |

## Failure handling

Do **not** declare go-live success if smoke fails. Rollback per [ROLLBACK-GUIDE.md](./ROLLBACK-GUIDE.md).
