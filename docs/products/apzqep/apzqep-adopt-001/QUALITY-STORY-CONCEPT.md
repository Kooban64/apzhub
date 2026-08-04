# Quality Story Concept — APZQEP-ADOPT-001

| Field     | Value                                   |
| --------- | --------------------------------------- |
| Programme | APZQEP-ADOPT-001                        |
| Status    | **CONCEPT**                             |
| Timestamp | 20260804T185200Z                        |
| Class     | Narrative projection — not a new engine |

Every release should produce a **Quality Story** — a narrative assembled from
existing Systems of Record and projections, not a parallel dashboard product.

## Example shape

```text
Release 1.3.7

Changed:
- Authentication
- User Management

Impact:
- Medium

Policies Applied:
- RC Profile

Automation:
- 184 tests selected

Evidence:
- 184 passed

Governance:
- All mandatory gates satisfied

Approval:
- Engineering Manager
- QA Manager

Decision:
- GO

Confidence:
97%

Residual Risk:
Low
```

## Rules

- Story is **composed** from Decision Package, Evidence Integration Package,
  Executive Experience Package, and related refs.
- Story is **not** a System of Record.
- Story is **not** evidence.
- Building a dedicated “Quality Story engine” is **out of scope** for ADOPT-001;
  capture desired narrative fields in the improvement backlog if the composition
  cannot be produced from existing projections during dogfood.
