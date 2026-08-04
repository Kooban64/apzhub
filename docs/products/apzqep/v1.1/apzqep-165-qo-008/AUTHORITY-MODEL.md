# Authority Model

Authorities are **governance roles**, not users.

Examples: Release Manager, Product Owner, CAB, Product Board, Compliance Officer, Security Officer, Operations Manager, Future Authority.

| Principle                       | Rule                                                            |
| ------------------------------- | --------------------------------------------------------------- |
| Authority ≠ identity            | Users are assigned externally; QO-008 never manages identity    |
| Declarative                     | Authorities participate via template requirements               |
| No RBAC in this slice           | Permission checks remain outside the Approval Decision Platform |
| Reusable across APZHUB products | Same authority IDs can be referenced by future products         |

The platform records which authority decided — never who the person “is” beyond an opaque actor context string.
