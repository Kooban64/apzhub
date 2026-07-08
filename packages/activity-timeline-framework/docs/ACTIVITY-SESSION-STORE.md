# Activity Session Store

> **Package:** `@apzhub/activity-timeline-framework`  
> **Story:** AT-008  
> **Status:** Implemented

---

## Purpose

The Activity Session Store holds immutable `ActivityDocument` instances for the current session. No persistence, user state, or cross-session sharing.

---

## Interface

```typescript
interface ActivitySessionStore {
  append(items: readonly ActivityDocument[]): AddActivitiesResult;
  get(activityId: string): ActivityDocument | undefined;
  list(options?: ListActivitiesOptions): readonly ActivityDocument[];
  clear(): number;
  getTotalCount(): number;
  getLastActivityTimestamp(): string | undefined;
  getScopeCounts(): Readonly<Partial<Record<string, number>>>;
  getCategoryCounts(): Readonly<Partial<Record<ActivityCategory, number>>>;
}
```

---

## Behaviour

| Rule          | Detail                                                             |
| ------------- | ------------------------------------------------------------------ |
| Deduplication | Skip append when `activityId` already exists                       |
| Ordering      | `timestamp` descending, `activityId` ascending tie-break           |
| Immutability  | Documents stored as frozen instances — never mutated               |
| User state    | Not stored — viewed/pinned/hidden deferred to future session model |

---

## Implementation

| Artifact        | Path                                            |
| --------------- | ----------------------------------------------- |
| Interface       | `src/service/activity-session-store.ts`         |
| Default store   | `src/service/default-activity-session-store.ts` |
| Ordering helper | `src/service/compare-activity-documents.ts`     |

---

_Activity Session Store — AT-008._
