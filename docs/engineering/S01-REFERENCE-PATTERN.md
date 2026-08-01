# S01 Reference Pattern

| Field                | Value                                                                                                                      |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Document             | S01 Reference Pattern                                                                                                      |
| Programme            | **APZHUB-ENG-001**                                                                                                         |
| Status               | **IN FORCE** — example implementation                                                                                      |
| Reference slice      | **APZQEP-120-S01** Evidence List / Search ACL                                                                              |
| Slice notes          | [../products/apzqep/v1.1/apzqep-120/S01-ENGINEERING-NOTES.md](../products/apzqep/v1.1/apzqep-120/S01-ENGINEERING-NOTES.md) |
| Engineering commit   | `5707c39a8c0ebba5e964a916693711f7010cd96a`                                                                                 |
| Documentation commit | `ed409d8e614fe7ac46a63cab193a0892a35cab91`                                                                                 |
| Date                 | 2026-08-01                                                                                                                 |

---

## Why this is the reference

APZQEP-120-S01 was the first v1.1 enterprise engineering slice executed under the inspect-first model. It closed a real security limitation (**L-EM-01**) without redesigning architecture, left the repository releasable, and produced complete evidence.

Future slices should match this **depth of discipline**, not necessarily this feature.

---

## What S01 did well

| Practice                             | Why keep it                                          |
| ------------------------------------ | ---------------------------------------------------- |
| Inspect before code                  | Planning was days old; code was the authority        |
| Architecture confirm, no redesign    | Matched APZQEP-111 gap closure                       |
| Security in the secured facade       | Reused ENG-110E policy; no second authz framework    |
| ACL **before** pagination            | Totals could not leak unauthorized IDs               |
| Targeted tests only                  | Package security + handler tests — not full monorepo |
| Two commits                          | Engineering then docs/evidence                       |
| Limitation closure in CERT registers | Standing truth updated                               |
| Explicit exclusions                  | S02/S12/storage left alone                           |

---

## Engineering lessons

1. **Vertical security slices are ideal first movers** — ACL boundaries unblock later work and reduce risk early.
2. **Put enforcement at the secured Application boundary** — keep unsecured inner services free of policy duplication when a facade already exists.
3. **Pagination after filter** — never page then ACL-filter.
4. **Admin short-circuit must remain tenant-scoped** — defence in depth even when policy allows admin.
5. **Compatible narrowing is not a breaking API** — fewer rows for unauthorized callers is correct.

---

## Prompt improvements (for S02+)

| Before (S01-era)                       | After (ENG-001)                       |
| -------------------------------------- | ------------------------------------- |
| 10–15 page process restatement         | Short Owner prompt + inherit standard |
| Full lifecycle pasted every time       | Link to ENGINEERING-SLICE-STANDARD    |
| Acceptance criteria mixed with process | Acceptance criteria only in prompt    |
| Meta-instructions in every slice       | AI-ENGINEERING-WORKFLOW permanent     |

**Recommended S02 prompt shape:** identifier · objective · scope · exclusions · acceptance criteria · dependencies · special constraints · “follow ENG-001 standard”.

---

## Repository improvements observed

| Improvement                      | Status                       |
| -------------------------------- | ---------------------------- |
| Enumeration ACL helper module    | Delivered in S01             |
| Sort/order wired through API     | Delivered in S01             |
| CERT limitation registers living | Updated in S01 docs commit   |
| Permanent slice standard pack    | **This programme (ENG-001)** |

No further process scaffolding recommended unless a genuine gap appears.

---

## Testing improvements

| Pattern                                                 | Adopt                    |
| ------------------------------------------------------- | ------------------------ |
| Helper unit tests + secured facade integration tests    | Yes                      |
| Cross-tenant empty list as first-class case             | Yes                      |
| Op-level deny audit assertion                           | Yes when auditing exists |
| Avoid testing the entire product CERT pyramid per slice | Yes                      |

---

## Security improvements

| Pattern                                            | Adopt                                      |
| -------------------------------------------------- | ------------------------------------------ |
| Same visibility rules for get and enumerate        | Yes                                        |
| Fail-closed omit on indeterminate/unavailable      | Yes                                        |
| Security JSON evidence artefact                    | Yes                                        |
| Do not flood audit with per-row enumeration denies | Prefer op-level deny audit + silent filter |

---

## Workflow improvements

```text
Inspect → Confirm → Design → Implement → Test → Secure → Document → Evidence → Certify → Commit → Clean
```

Became permanent in [ENGINEERING-SLICE-STANDARD.md](./ENGINEERING-SLICE-STANDARD.md).

---

## Minimal example (future slice prompt)

```text
# APZQEP-120-S02

Authority: OPEN for S02 only.
Process: docs/engineering/ENGINEERING-SLICE-STANDARD.md (APZHUB-ENG-001)

## Objective
Wire TE EvidenceAccessPort to Evidence ACL in production factories.

## Scope
- Adapter mapping TE evidence ops → Evidence permission evaluation
- Factory wiring; fail-closed if Evidence unavailable
- Integration + tenant isolation tests
- TE CERT wiring note

## Explicit exclusions
- Evidence durable storage; Suites/Runs; new authz framework

## Acceptance criteria
1. Unauthorised attach/link denied
2. Authorised attach succeeds when Evidence grants
3. Cross-tenant denied
4. Fail-closed if Evidence unavailable
5. Docs updated

## Dependencies
- APZQEP-120-S01 COMPLETE
- Packages: qep-test-execution, qep-evidence

## Special constraints
- No competing authorisation framework
```

---

## STOP

```text
S01 = REFERENCE PATTERN
COPY DISCIPLINE — NOT FEATURE SCOPE
FUTURE PROMPTS STAY SHORT
```
