# APZQEP-OES-ARCH-016 — APPENDIX B — Lifecycle State Machine

## States (architectural)

| State                  | Mutability of content                   | Notes                       |
| ---------------------- | --------------------------------------- | --------------------------- |
| Captured / Draft       | Replaceable (versioned)                 | Initial accept              |
| Validated              | Replaceable until classified path locks | Hash present                |
| Classified             | Policy-bound                            | Classification required     |
| Associated             | Policy-bound                            | Relationships usual         |
| In Review              | Policy-bound                            | Review workflow             |
| Approved               | May seal                                | Authorised retention entry  |
| Quarantined / Rejected | Restricted                              | Access narrowed             |
| Sealed / Locked        | Immutable content                       | Certification-grade         |
| Retained               | Per retention class                     | Active custody              |
| Archived               | Cold / long-term                        | Still governed              |
| Legal Hold             | Any prior active state + hold flag      | Blocks disposition          |
| Disposed               | Terminal                                | Disposition record required |

## Transition rules (summary)

See PART-03 §1.1. All transitions audited + evented. Eng Spec may refine exact enum names without changing intent.

## availableActions

Computed server-side from state × ACL × policy × legal hold. Workbench renders only returned actions.
