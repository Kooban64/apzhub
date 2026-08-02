# APZQEP Rollback Guide

Consumes `docs/operations/platform-1.2.0-production-readiness/ROLLBACK-GUIDE.md`.

1. Redeploy previous web image tag from Version Manifest.
2. Restore platform DB only if a migration was applied and is incompatible.
3. Cap A–F in-memory state cannot be rolled back (ephemeral).
4. Record change in operational log.
