# Membership Rules

1. Each membership item pins one `RequirementContentVersionId`.
2. A content version may appear only once in a baseline.
3. Membership records preserve the Requirement ID, content-version number,
   inclusion time, and actor for interpretation and audit.
4. Draft baselines may add or remove members.
5. Locked and archived baselines cannot change membership.
6. The aggregate does not use a mutable Requirement pointer or resolve "latest"
   content at read time.

Cross-aggregate validation that the referenced version exists and belongs to the
given Requirement is not performed in domain construction; it is enforced by the
Part 2 application service (`addBaselineItem`) before persistence.

7. (Part 3) At lock time, the application service loads each member's content
   version, verifies its own snapshot integrity, and folds the resulting
   `snapshotHash` values into the baseline's integrity fingerprint. Locking a
   baseline with zero members is rejected by both the domain aggregate and the
   application/repository layers.
