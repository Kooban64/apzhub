# Defect Domain

Aggregate: `DefectAggregate` (`defect` + `history`).

Key fields: title, description, severity (`critical|major|minor|trivial`), priority (`p0`–`p4`), category, environment, component, applicationVersion, releaseReference, reporter, assignee, reviewer, resolution, rootCause, verificationNotes, duplicateOfDefectId, tags.

`ExecutionOrigin` — raise-time snapshot (sessionId, stepId, suite/plan refs, failureNotes). Cap C remains SoR.

`evidenceRefs` — Evidence Platform IDs only (no byte storage).

Permissions: `qep.defects.{read,create,update,lifecycle,admin}`.
