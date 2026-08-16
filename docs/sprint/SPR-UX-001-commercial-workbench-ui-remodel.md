# SPR-UX-001 — Commercial workbench UI remodel programme

> **Status:** **PARKED under Stream 1 freeze** — 2026-08-16  
> **Superseding priority:** [OWNER-UX-STREAM-001-FREEZE](../decisions/OWNER-UX-STREAM-001-FREEZE.md) · [SPR-UX-STREAM-001](./SPR-UX-STREAM-001-public-marketplace-purchase-provisioning.md)  
> **AuthN:** BetterAuth only  
> **Does not:** Touch legacy `apz-*` · Expose engine branding

## Owner redirect (2026-08-16)

Authenticated product remodel (Time, Support, Projects, Knowledge, QEP, PEN) **waits** until Stream 1 public commercial journey is complete. This programme remains the home for **post–Stream 1** workbench consistency — including aligning operator/admin chrome with the same design language (admin leftbar is a **consistency reference**, not a mandated template).

## Delivered (keep)

| ID  | Ship                          | Status                                    |
| --- | ----------------------------- | ----------------------------------------- |
| U0  | Production runtime on `:3300` | **Delivered** — `scripts/run-web-prod.sh` |
| U1  | Activity Bar Lucide icons     | **Delivered**                             |
| U2  | Sidebar icons + labels        | **Delivered**                             |

## Deferred until Stream 1 DoD

| ID  | Ship                                             | Status                                       |
| --- | ------------------------------------------------ | -------------------------------------------- |
| U3  | Time recording remodel (deep)                    | Deferred — partial recording bar may remain  |
| U4  | Support remodel                                  | Deferred                                     |
| U5  | Projects remodel                                 | Deferred                                     |
| U6  | Knowledge remodel                                | Deferred                                     |
| U7  | Clear `typescript.ignoreBuildErrors` + fail-fast | Still planned (platform quality)             |
| U8  | Operator/admin shell consistency pass            | Planned after Stream 1 design language lands |

## Ops (U0)

```bash
NODE_ENV=production pnpm --filter @apzhub/web build
./scripts/run-web-prod.sh
```
