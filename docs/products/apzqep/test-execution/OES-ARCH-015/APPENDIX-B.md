# APZQEP-OES-ARCH-015 — APPENDIX B — Lifecycle State Machine

## States

`draft` · `ready` · `assigned` · `in_progress` · `paused` · `blocked` · `completed` · `submitted_for_review` · `accepted` · `rejected` · `cancelled` · `superseded`

## Primary path

```text
draft → ready → assigned → in_progress → completed
  → submitted_for_review → accepted
```

## Control loops

```text
in_progress ⇄ paused
in_progress ⇄ blocked
```

## Review alternate

```text
submitted_for_review → rejected
completed → accepted   (fast-path when policy + availableActions allow)
```

## Terminal / lineage

```text
* → cancelled          (from non-terminal per guards)
eligible → superseded  (successor execution required)
```

## Mermaid

```mermaid
stateDiagram-v2
  [*] --> draft
  draft --> ready: prepare
  ready --> assigned: assign
  assigned --> in_progress: start
  in_progress --> paused: pause
  paused --> in_progress: resume
  in_progress --> blocked: block
  blocked --> in_progress: resume
  in_progress --> completed: complete
  completed --> submitted_for_review: submitForReview
  completed --> accepted: fastPathAccept
  submitted_for_review --> accepted: accept
  submitted_for_review --> rejected: reject
  draft --> cancelled: cancel
  ready --> cancelled: cancel
  assigned --> cancelled: cancel
  in_progress --> cancelled: cancel
  paused --> cancelled: cancel
  blocked --> cancelled: cancel
  completed --> cancelled: cancel
  rejected --> superseded: supersede
  accepted --> superseded: supersede
```

## Invariants

1. Explicit Domain commands only.
2. Append-only history.
3. No client-invented transitions.
4. Sealed manifest before `in_progress`.
5. No ordinary completion from `cancelled`.
