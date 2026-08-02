# Execution Domain

`ExecutionSessionAggregate` = session + history. Owns planning snapshot from Cap B handoff, steps/results, evidence refs, amendments, progress. One session per handoff (idempotent create).
