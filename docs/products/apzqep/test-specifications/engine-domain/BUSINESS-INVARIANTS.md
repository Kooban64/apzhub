# Business Invariants — APZQEP-ENG-050A

Enforced by factories, policies, and aggregate commands:

1. Every Specification has an Identifier (`tsp_*`).
2. Every Specification has a Title.
3. Every Specification has an Objective.
4. Every Specification has an Owner.
5. Every Specification has Classification.
6. Every Specification has a Version.
7. History is append-only.
8. Approved Specifications are immutable (content).
9. Superseded Specifications are immutable.
10. Retired Specifications are immutable.
11. Only Approved may be authoritative (`isAuthoritative`).
12. Relationships cannot reference self.
13. Version numbers (labels) are unique within lineage.
14. Only Draft may be edited.
15. Rejected cannot transition directly to Approved.
16. Rejection requires a review/approval comment.
