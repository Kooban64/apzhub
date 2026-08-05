# Document Context Analysis — APZ-DOCUMENTS-NATIVE-001-N01

| Field     | Value                                                                            |
| --------- | -------------------------------------------------------------------------------- |
| Slice     | N-01                                                                             |
| Status    | **COMPLETE**                                                                     |
| Timestamp | 20260805T141500Z                                                                 |
| Result    | **GAPS IDENTIFIED**                                                              |
| Mission   | [../../apzdocuments/DOCUMENT-CONTEXT.md](../../apzdocuments/DOCUMENT-CONTEXT.md) |

## Audit question

> Does the document support the work?  
> rather than  
> Does the repository store the document?

## Expected context answers (mission)

What is this document? Why does it exist? Related work item / project / support request / quality evidence / customer / organisation? Lifecycle state?

## Observed product experience

| Context type               | Presented in Documents UI? | Notes                                                        |
| -------------------------- | -------------------------- | ------------------------------------------------------------ |
| Project documents          | **No**                     | No project columns or deep links from Projects               |
| Support attachments        | **No**                     | Support uses ticket file attachments, not Platform Documents |
| Quality evidence           | **No**                     | QEP attaches evidence IDs, not Documents product             |
| Time-related documents     | **No**                     | No Time → Documents wiring                                   |
| Legal documents            | **Separate Law module**    | Law Documents under Law app — not platform Documents context |
| General business documents | **Yes (metadata only)**    | Standalone list/filter of document metadata                  |
| Lifecycle state            | **Partial**                | Status / classification / retention IDs shown                |
| Relationships              | **Stub**                   | Read-only; create deferred to “product services”             |

## Central finding

**Users start with the repository** (Activity Bar → Documents → browse metadata), not with work.

That contradicts the Owner expectation that the long-term APZHUB experience is **work-first**, with the repository as an organising/governance service rather than the mental starting point.

## Gap IDs

G-13, G-14, G-18 (see [APZ-DOCUMENTS-NATIVE-UX-AUDIT.md](./APZ-DOCUMENTS-NATIVE-UX-AUDIT.md)).

No solutions implemented in this slice.
