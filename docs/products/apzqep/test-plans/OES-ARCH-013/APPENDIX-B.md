# APZQEP-OES-ARCH-013 — APPENDIX B — Lifecycle State Machine

## Primary path

```text
Draft → Review → Approved → Ready → In Execution → Completed → Archived
```

## Exception paths

```text
Review → Rejected → Draft
* → Cancelled   (before / instead of completion; Domain rules)
Approved|Ready|Completed → Superseded
```

## Command catalogue (architectural)

| Command | Typical from → to |
| ------- | ----------------- |
| `submitForReview` | Draft → Review |
| `approve` | Review → Approved |
| `reject` | Review → Rejected |
| `returnToDraft` | Rejected → Draft |
| `markReady` | Approved → Ready |
| `startExecution` | Ready → In Execution |
| `complete` | In Execution → Completed |
| `archive` | Completed → Archived |
| `cancel` | early states → Cancelled |
| `supersede` | eligible states → Superseded |

## Invariants (architecture)

1. Explicit commands only.  
2. Append-only history.  
3. No client-invented transitions.  
4. Plan does not store execution results.  
5. Material post-Approved changes require new version / supersession.
