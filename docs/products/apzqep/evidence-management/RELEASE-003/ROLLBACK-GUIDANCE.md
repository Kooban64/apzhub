# Rollback Guidance — APZQEP-RELEASE-003

No release tag or remote production baseline was published under this blocked attempt.

If a future `apzqep-evidence-v1.0.0` tag is created incorrectly:

1. Do **not** move or delete the tag on a shared remote without Owner approval.
2. Prefer a forward fix via new patch programme.
3. Preserve git history — no force-push of `main`.
4. Redeploy prior known-good platform commit that does not include Evidence 1.0.0 if rollback of runtime is required.
