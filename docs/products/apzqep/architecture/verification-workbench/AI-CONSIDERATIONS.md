# AI Considerations — APZQEP-ARCH-010

> Companion extract. Authoritative detail: [VERIFICATION-WORKBENCH-ARCHITECTURE.md](./VERIFICATION-WORKBENCH-ARCHITECTURE.md) §21.

## AI may

- Summarise Verification history and rationale
- Prioritise queue presentation suggestions
- Recommend assignees or next actions
- Draft rationale text for human edit

## AI must never

- Verify
- Approve
- Reject
- Own Verification truth, lifecycle, or authority

## Rule

All AI-suggested mutations execute only through human-confirmed server commands gated by `availableActions`. No AI implementation under ARCH-010.
