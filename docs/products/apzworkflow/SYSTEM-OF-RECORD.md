# APZ Workflow — System of Record Boundaries

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZ-WORKFLOW-000 |
| Status    | **APPROVED**     |
| Timestamp | 20260805T163000Z |

## Ownership (SoR discipline)

| Datum                                                    | System of Record |
| -------------------------------------------------------- | ---------------- |
| Workflow journey definitions & journey instance metadata | **APZ Workflow** |
| Project metadata                                         | APZ Projects     |
| Ticket / service request metadata                        | APZ Support      |
| Time / utilisation records                               | APZ Time         |
| Document lifecycle & document metadata                   | APZ Documents    |
| Quality evidence / release decisions                     | APZQEP           |

## Relationship rule

Workflow steps reference other products’ entities **by reference**. Workflow does not become the SoR for projects, tickets, time, documents, or quality evidence.

## Explicit non-claims

Embedding or duplicating other products’ authoritative data into Workflow is prohibited unless a separate Owner Auth / ADR allows a justified exception (cache/search/report/temp only — never authoritative).
