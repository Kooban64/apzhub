# POLICY-MODEL — QO-006

Policies are **immutable** definitions. Versioning creates a new record; prior versions are never mutated.

## Fields

Policy ID, Name, Version, Description, Owner, Scope, Lifecycle State (`draft`/`active`/`retired`), Documentation Reference, Metadata, ordered Rule IDs.

Policies **coordinate** rules. Rules never coordinate policies.

## Persistence

Process-local (current orchestration model). Future durable policy store is an outstanding issue.
