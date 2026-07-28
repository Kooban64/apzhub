# Manual Replay — Platform-1.4-ENG-001B-P4

## Rule

Manual replay **must create a NEW delivery**. Never mutate immutable terminal history on the source row.

## Behaviour

1. Load source delivery; assert tenant/org ownership.
2. Require `notifications.admin` + `notifications.replay` (or privileged manage).
3. Insert new delivery with:
   - fresh id
   - idempotency key `replay:<sourceId>:<n>`
   - `replayOfDeliveryId` referencing source
   - initial non-terminal status suitable for re-queue
4. Leave source row unchanged.
5. Append immutable admin audit (`manual_replay`, result, reason).

## Tests

Covered in `eng001b-p4-admin.test.ts` (manual replay creates new id; source unchanged).
