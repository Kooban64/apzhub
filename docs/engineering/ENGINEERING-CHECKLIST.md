# Engineering Checklist

| Field     | Value                                                            |
| --------- | ---------------------------------------------------------------- |
| Document  | Engineering Checklist                                            |
| Programme | **APZHUB-ENG-001**                                               |
| Status    | **IN FORCE**                                                     |
| Process   | [ENGINEERING-SLICE-STANDARD.md](./ENGINEERING-SLICE-STANDARD.md) |

Executable checklist for every engineering slice. Mark each item before declaring COMPLETE.

---

## Pre-flight

- [ ] Owner authorised **this slice only**
- [ ] No other slice assumed in parallel without Owner approval
- [ ] Working tree clean **or** STOP and report dirty state
- [ ] Standing baseline / package versions noted
- [ ] Process documents linked (standard · template · AI workflow · certification)

## Inspect

- [ ] Relevant packages / modules located
- [ ] APIs / handlers / services located
- [ ] Security / ACL / tenant paths located
- [ ] Existing tests located; gaps noted
- [ ] Docs / CERT limitations located
- [ ] COMPLETE / PARTIAL / MISSING recorded
- [ ] **No code modified during inspect**

## Architecture

- [ ] Approved architecture reference identified
- [ ] Change matches approved design
- [ ] No layer bypass introduced
- [ ] Exception filed and STOP if conflict

## Design

- [ ] Scope and exclusions clear
- [ ] Reuse of platform components confirmed
- [ ] Compatibility impact noted
- [ ] Owner decisions identified or NONE
- [ ] Over-engineering avoided

## Implement

- [ ] Only authorised functionality changed
- [ ] Default-deny / fail-closed where security applies
- [ ] No temporary / debug / commented-out code left
- [ ] No unrelated cleanup or refactors
- [ ] Affected packages typecheck / lint locally as required

## Tests

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Negative / failure-path tests as required
- [ ] Tenant isolation tests when ACL/tenant touched
- [ ] Targeted regression green
- [ ] No known failing tests left behind

## Security

- [ ] ACL / permission checks validated
- [ ] Tenant isolation validated
- [ ] Bypass paths considered and closed
- [ ] Anonymous / missing-permission deny validated when applicable
- [ ] Secrets not logged or committed
- [ ] Security evidence produced (**PASS**)

## Documentation

- [ ] Only affected docs updated
- [ ] CERT / limitation registers updated when closing a limitation
- [ ] Slice engineering notes written
- [ ] Standing / pack indexes updated if status changed

## Evidence

- [ ] Completion evidence
- [ ] Security evidence
- [ ] Certification evidence
- [ ] Test commands and results recorded
- [ ] Commit hashes recorded (after commit)

## Certification

- [ ] [SLICE-CERTIFICATION.md](./SLICE-CERTIFICATION.md) result decided
- [ ] Acceptance criteria all evidenced
- [ ] Regression policy followed
- [ ] Result ≠ PASS only if Owner Conditional PASS documented

## Commit & repository

- [ ] Engineering commit created (when code changed)
- [ ] Documentation commit created (when docs/evidence separate)
- [ ] Hooks passed (no `--no-verify`)
- [ ] Pushed if programme requires; remote verified
- [ ] Working tree clean
- [ ] Repository releasable
- [ ] No unrelated changes on branch

## Ready for next slice

- [ ] This slice marked COMPLETE
- [ ] Next slice **not** started without new Owner instruction
- [ ] Outstanding issues = NONE (or explicitly owned)

---

## Quick gate (minimum to claim COMPLETE)

```text
□ Authority
□ Inspect before code
□ Architecture confirmed
□ Tests green (targeted)
□ Security PASS
□ Docs + evidence
□ Certification PASS
□ Clean tree
□ Releasable
```

---

## STOP

```text
IF ANY QUICK GATE UNCHECKED → SLICE NOT COMPLETE
```
