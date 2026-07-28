# Requirements Relationship API

| Field | Value |
| --- | --- |
| Programme | APZQEP-ENG-020F Part 2 |
| Base path | `/api/v1/qep/requirements/relationships` |

## Endpoints (representative)

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/relationships` | List / filter |
| POST | `/relationships` | Create (draft) |
| GET | `/relationships/{id}` | Get |
| PATCH | `/relationships/{id}` | Update permitted semantic fields |
| POST | `/relationships/{id}/activate` | Activate |
| POST | `/relationships/{id}/deprecate` | Deprecate |
| POST | `/relationships/{id}/retire` | Retire |
| POST | `/relationships/supersede` | Create + activate supersession |
| PATCH | `/relationships/{id}/rationale` | Update rationale |
| PATCH | `/relationships/{id}/strength` | Update strength |
| PATCH | `/relationships/{id}/classification` | Update classification |
| PATCH | `/relationships/{id}/criticality` | Update criticality |
| PATCH | `/relationships/{id}/scope` | Update scope |
| GET | `/relationships/taxonomy` | Taxonomy lookup |
| GET | `/relationships/conflicts` | Conflict relationships |
| GET | `/relationships/supersession` | Supersession edges |
| GET | `/relationships/by-taxonomy/{type}` | Filter by type |
| GET | `/relationships/by-lifecycle/{state}` | Filter by lifecycle |
| GET | `/relationships/by-baseline/{baselineId}` | Baseline-scoped |
| GET | `/relationships/by-content-version/{id}` | Content-version pin filter |
| GET | `/requirements/{requirementId}/relationships` | By requirement |
| GET | `/requirements/{requirementId}/relationships/inbound` | Inbound |
| GET | `/requirements/{requirementId}/relationships/outbound` | Outbound |

## Conventions

- Platform API auth + operation authorization map
- Server-side validation only
- Response envelope matches existing QEP requirements APIs
- `relationships` is a reserved path segment (not a requirement id)
