# Repository typecheck debt (not APZQEP Phase 6)

**Date:** 2026-08-20  
**Status:** **CLEARED** — repository engineering cleanup (not an APZQEP phase)  
**Not:** Phase 6 / Phase 7 product scope; those phases stay **CLOSED · ACCEPTED · FROZEN**

Owner recorded this separately so unrelated repository failures could not contaminate APZQEP Phase 6/7.

## Authoritative commands

```bash
pnpm lint
pnpm typecheck
pnpm --filter @apzhub/web build
```

**Cleared (2026-08-20):**

- `pnpm lint` — PASS
- `@apzhub/web` `tsc --noEmit` — PASS
- Previously failing packages (`platform-authorization`, `platform-email`, `qep-ai`, `platform-services`) — PASS
- Production build no longer ignores TypeScript errors (`apps/web/next.config.ts` `ignoreBuildErrors: false`)
- `pnpm --filter @apzhub/web build` — PASS

## What was cleaned

Pre-existing authorization/email types, web App Router handler variance, injectable env stubs in tests, platform-services error codes, a corrupted `.next/dev` types cache, and unused-variable lint. App `tsconfig` excludes `.next/dev` so a crashed `next dev` cannot poison typecheck. Web typecheck runs `next typegen` first.

Cleanup did not reopen Phases 1–7 and did not introduce Chat/Finding SoRs, embeddings, MCP, Source write, SSH, or Terminal.

## Rule

Do not hide type or lint failures with `@ts-ignore`, `@ts-expect-error`, `any`, disabled checks, excluded source files, or a weakened tsconfig. Do not convert remaining engineering work into an APZQEP numbered phase.
