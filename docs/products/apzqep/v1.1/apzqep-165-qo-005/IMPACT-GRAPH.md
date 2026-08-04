# IMPACT-GRAPH — QO-005

Directed quality impact graph built by deterministic BFS.

## Node fields

unique id, asset type, metadata, version, relationship strength, confidence, risk contribution, depth.

## Edge fields

from/to, relationship kind, strength, confidence, reason, evidence refs.

## Traversal

- Seeds sorted lexicographically
- Outgoing relationships sorted by `relationshipId`
- Stable `traversalOrder`
- No visual rendering in this slice

## Persistence

Process-local (current orchestration model). Future durable graph store is an outstanding issue.
