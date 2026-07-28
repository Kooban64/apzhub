# APZQEP-OES-ARCH-014 — APPENDIX B — Lifecycle Presentation State Machine

This appendix presents the **UI view** of the certified Domain lifecycle (ENG-060A). It is presentation guidance only — the Domain state machine remains authoritative and is not redefined here.

## Primary path

```text
Draft → Review → Approved → Ready → In Execution → Completed → Archived
```

## Exception paths

```text
Review → Rejected → Draft   (via return-to-draft)
Rejected → Cancelled
Draft | Review | Approved | Ready → Cancelled
Approved | Ready | In Execution → Superseded
Any permitted state → Cloned (new unrelated Draft)
```

## Command catalogue (presentation view)

| Command (action id) | Typical from → to | Dialog |
| -------------------- | ------------------- | ------ |
| `submit-for-review` | Draft → Review | Submit for review |
| `approve` | Review → Approved | Approve |
| `reject` | Review → Rejected | Reject (rationale required) |
| `return-to-draft` | Rejected → Draft | Return to Draft confirm |
| `mark-ready` | Approved → Ready | Mark Ready confirm |
| `start-execution` | Ready → In Execution | Start Execution confirm |
| `complete` | In Execution → Completed | Complete confirm |
| `archive` | Completed → Archived | Archive confirm |
| `cancel` | early states → Cancelled | Cancel confirm |
| `supersede` | Approved / Ready / In Execution → Superseded (+ successor) | Supersede flow |
| `clone` | any permitted state → new Draft | Clone confirm |

## Status → UI treatment

| Status | Badge tone (semantic token) | Actionable in Inspector | Editable content |
| ------ | ---------------------------- | ------------------------ | ------------------ |
| Draft | Neutral | Yes | Yes |
| Review | Info | Yes (approve/reject only, per grant) | No |
| Approved | Success | Yes | No |
| Ready | Success (emphasis) | Yes | No |
| In Execution | Info (emphasis) | Yes (complete only) | No |
| Completed | Success (muted) | Yes (archive only) | No |
| Archived | Neutral (muted) | No | No |
| Rejected | Warning | Yes (return-to-draft / cancel only) | No |
| Cancelled | Neutral (muted) | No | No |
| Superseded | Neutral (muted) | No | No |

## Invariants (architecture)

1. Explicit commands only — the Workbench never writes `status` directly.
2. Append-only history; the Workbench never reconstructs history client-side.
3. No client-invented transitions — the Workbench renders only what `availableActions` returns.
4. A Plan never stores execution results; `in_execution` / `completed` reflect planning state, not run outcomes.
5. Terminal statuses (`archived`, `cancelled`, `superseded`) render no mutating actions — only navigation and history/versions/audit.
6. `return-to-draft` is exposed only when Infrastructure `availableActions` includes it for a `rejected` Plan — the Workbench does not assume it is always available.
