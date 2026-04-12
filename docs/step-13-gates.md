# Step 13 regression gates

Run before merging each stabilization slice:

```bash
npm run typecheck
npm test
npx playwright test
npm run build
```

Or use the bundled script:

```bash
npm run verify:stabilization
```

## Environment toggles (reference)

| Variable | Purpose |
|----------|---------|
| `APZHUB_IDENTITY_SOURCE` | `mock` (default) or `oidc` |
| `APZHUB_PROFILE_SOURCE` | `mock` or `real` |
| `APZHUB_ACCESS_SOURCE` | `mock` or `file` |
| `APZHUB_ACCESS_FILE` | Path to JSON when `file` |
| `NEXT_PUBLIC_APZHUB_ACCESS_SOURCE` | Client: when not `mock`, workspace posture uses `/api/workspace/access-posture` |
| `APZHUB_LAUNCH_SOURCE` / `NEXT_PUBLIC_APZHUB_LAUNCH_SOURCE` | `mock` or `real` (launch URL templates) |
| `APZHUB_OIDC_*` | Issuer, client id/secret, redirect URI for OIDC |

## Admin API surface (Step 13)

| Method | Path | Role |
|--------|------|------|
| GET | `/api/admin/control-plane` | Admin — home snapshot |
| GET | `/api/admin/privileged-traces` | Admin |
| POST | `/api/admin/audit/events` | Admin — append validated audit event (in-memory store) |
| GET | `/api/admin/access` | Admin |
| GET | `/api/admin/access/posture` | Admin |
| GET | `/api/workspace/access-posture` | Active session — self `userId` only |
| GET | `/api/admin/provisioning/jobs` | Admin |
| POST | `/api/admin/provisioning/jobs/:id/retry` | Admin |
| POST | `/api/admin/provisioning/jobs/:id/resolve` | Admin |
