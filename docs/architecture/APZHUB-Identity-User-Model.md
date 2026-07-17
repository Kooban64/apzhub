# Identity User Model

`IdentityUser` stores **profile metadata** only.

- `authSubjectRef` may reference an Authentication platform subject
- Never stores passwords, hashes, sessions, tokens, or MFA secrets
- Lifecycle via `IdentityLifecycleStatus` (`draft` → `invited` → `pending` → `active` → `suspended` / `deactivated` → `archived`)

Related: memberships, employments, service assignments, activations/deactivations, audit/history.
