# Product Ownership Matrix — Unified Work Experience

| Field     | Value                            |
| --------- | -------------------------------- |
| Programme | APZHUB-CAPABILITY-001-VALIDATION |
| Status    | **COMPLETE**                     |
| Timestamp | 20260805T101500Z                 |

## Rule

Every work kind has exactly one **owning product** (or APZQEP for quality work).  
My Work **coordinates** references; it never becomes the owner.

## Matrix

| Work kind (capability)     | Concrete item (examples)                       | Owning product / baseline         | Authoritative SoR                       | Consumers (references)                                                               |
| -------------------------- | ---------------------------------------------- | --------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------ |
| Action                     | Task / assigned delivery action                | **APZ Projects**                  | Projects (task)                         | APZ Time (effort), APZ Support (related request), APZQEP (change linked to delivery) |
| Coordination               | Sprint / plan / milestone coordination         | **APZ Projects**                  | Projects                                | APZ Time, APZ Support (context only)                                                 |
| Deliverable                | Delivery outcome / milestone                   | **APZ Projects**                  | Projects                                | APZQEP (release linkage), Analytics (future)                                         |
| Request                    | Support request / ticket                       | **APZ Support**                   | Support (request)                       | APZ Projects (delivery context), APZ Time (effort if authorised)                     |
| Approval (service)         | Service escalation / ownership approval        | **APZ Support**                   | Support                                 | Projects (context)                                                                   |
| Record                     | Time entry / timesheet line                    | **APZ Time**                      | Time                                    | APZ Projects (delivery context)                                                      |
| Quality action             | Quality Flow action / evidence duty            | **APZQEP**                        | APZQEP (Flow / evidence)                | All products under change                                                            |
| Approval (quality/release) | Release / Decision Package approval            | **APZQEP**                        | APZQEP                                  | Product under change                                                                 |
| Review (document)          | Document review                                | **APZ Documents**                 | Documents (when adopted)                | APZ Projects, APZ Support                                                            |
| Review (delivery)          | Delivery / plan review                         | **APZ Projects**                  | Projects                                | APZQEP when release-related                                                          |
| Decision (quality)         | Decision Package                               | **APZQEP**                        | APZQEP                                  | Product under change                                                                 |
| Decision (operational)     | Business decision recorded in delivery/service | Owning product of the artefact    | Product SoR                             | Capability may **surface**, not own                                                  |
| Risk                       | Delivery / service risk tracked as work        | Owning product of the risk domain | Product SoR (or future Risk capability) | See Gap Register                                                                     |

## Ownership conflicts

| Check                          | Result                                                        |
| ------------------------------ | ------------------------------------------------------------- |
| Duplicate owners for same kind | **None** for RI products (Projects / Support / Time / APZQEP) |
| My Work owns business entities | **No** — My Work is coordination only                         |
| Engine owns user-facing work   | **No** — engines remain invisible                             |

## Notes

- **APZ Documents** is a planned owner for document reviews; product not yet Reference Implementation — see Gap Register.
- Capability vocabulary (Action, Request, …) maps onto product entities; mapping is validation, not redesign.
