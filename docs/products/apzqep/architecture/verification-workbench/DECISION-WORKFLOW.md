# Decision Workflow — APZQEP-ARCH-010

> Companion extract. Authoritative detail: [VERIFICATION-WORKBENCH-ARCHITECTURE.md](./VERIFICATION-WORKBENCH-ARCHITECTURE.md) §9.

## Decisions

request · assign · start · verify/complete · reject · expire · withdraw · cancel · supersede · retire.

## UX elements

| Element | Rule |
| ------- | ---- |
| Confirmation | Required for mutating decisions |
| Warnings | Terminal / irreversible / expire / retire / supersede |
| Rationale | Required when policy says so; strongly for reject / withdraw / cancel / supersede |
| Outcome | Captured distinctly from status on completion |

## Surfaces

Inspector actions · Verification Decision workspace · Command Palette · bulk only if server-safe.

## Authority

All decisions gated by server `availableActions` (ENG-040B).
