# APZ Projects 3.0 — Administrator Guide

| Audience | APZHUB administrators · Projects governors |
| -------- | ------------------------------------------ |
| Product  | APZ Projects Release 3.0                   |

## Access

- Permissions are APZHUB-owned (`projects.view` · `projects.manage` · `projects.admin` · task/sprint variants). Better Auth authenticates; APZHUB authorises.
- Administration surfaces require `projects.admin` (or equivalent admin grant). Backend engine role names are never shown in UI.

## Administration surfaces

Path prefix: `/workspace/projects/admin`

| Area                 | Purpose                                          |
| -------------------- | ------------------------------------------------ |
| Dashboard            | Governance summary and entry points              |
| Governance profiles  | Profile catalogue and assignment policy          |
| Operational policies | Delivery/control policy configuration            |
| Hierarchy            | Configuration hierarchy                          |
| Delegations          | Time-bound permission delegations (SoD enforced) |
| Compliance           | Governance compliance view                       |
| Audit                | Immutable governance audit trail                 |
| Retention            | Retention policies and legal holds               |
| Saved searches       | Governed search definitions                      |
| Roles                | Operational role catalogue                       |

## Portfolio admin

`/workspace/projects/portfolio/admin` — hierarchy maintenance for programmes/initiatives (manage/admin grants).

## Identity

- Use Enterprise Identity pickers for owners and membership — directory-backed principals only.
- Do not paste raw engine user IDs into product UI.

## Health & readiness

- Platform: `GET /api/health`
- Projects admin readiness: `/workspace/projects/health` (admin)

## Change control

Release 3.0 is baseline. Configuration via admin UI is expected; behavioural product changes require formal approval (or 3.1 investment).
