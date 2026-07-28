# Build Remediation — Platform-1.4-BLD-001

## Decision

| Question                         | Answer                                        |
| -------------------------------- | --------------------------------------------- |
| Is the defect Platform-owned?    | **No**                                        |
| Platform implementation changed? | **No**                                        |
| Remediation performed in code?   | **None** (authorised only for Platform-owned) |

## Rationale

Authorised scope: if externally owned, do **not** modify Platform implementation; record finding and evidence.

Root cause is **Environment** (shell `NODE_ENV=development`) with a **Framework** interaction (Next.js 16 `/_global-error` prerender). Platform `global-error.tsx` is already a minimal client boundary without providers.

## Operational procedure (no code change)

```bash
env -u NODE_ENV pnpm build
```

Documented in [ENGINEERING-HANDBOOK.md](../../foundation/ENGINEERING-HANDBOOK.md).

## Explicitly not done

- No Next.js / React version change
- No `global-error.tsx` rewrite
- No package.json build-script hardening (Repository/Tooling follow-on)
- Durable flag not enabled
- Feature flag remains OFF
- Process-local runtime retained

## Recommended follow-on (backlog; not authorised here)

| Owner              | Item                                                                |
| ------------------ | ------------------------------------------------------------------- |
| Repository/Tooling | Harden `pnpm build` to unset `NODE_ENV` before `next build`         |
| Framework watch    | Track Next.js fixes for `/_global-error` + React 19 dispatcher null |
