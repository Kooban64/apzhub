# APZ Documents — System of Record Boundaries

| Field     | Value             |
| --------- | ----------------- |
| Programme | APZ-DOCUMENTS-000 |
| Status    | **APPROVED**      |
| Timestamp | 20260805T140500Z  |

## Ownership (SoR discipline)

| Datum                                  | System of Record                 |
| -------------------------------------- | -------------------------------- |
| Document lifecycle & document metadata | **APZ Documents**                |
| Project metadata                       | APZ Projects                     |
| Ticket / service request metadata      | APZ Support                      |
| Time / utilisation records             | APZ Time                         |
| Quality evidence metadata              | APZQEP                           |
| Matter / legal practice metadata       | APZ Law Platform (when in force) |

## Relationship rule

Relationships between documents and other work are **by reference** wherever practical. Documents does not become the SoR for project plans, tickets, time entries, or quality evidence.

## Explicit non-claims

- APZ Documents is **not** the System of Record for everything.
- Embedding or duplicating other products’ authoritative data into Documents is prohibited unless a separate Owner Auth / ADR allows a justified exception (cache/search/report/temp only — never authoritative).
