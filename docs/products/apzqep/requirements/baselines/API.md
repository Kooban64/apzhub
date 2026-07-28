# API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/qep/requirements/baselines` | List baselines (status filter, pagination) |
| `POST` | `/api/v1/qep/requirements/baselines` | Create a draft baseline |
| `GET` | `/api/v1/qep/requirements/baselines/{id}` | Read one baseline |
| `PATCH` | `/api/v1/qep/requirements/baselines/{id}` | Update draft name/description |
| `GET` | `/api/v1/qep/requirements/baselines/{id}/items` | List membership items |
| `POST` | `/api/v1/qep/requirements/baselines/{id}/items` | Add an exact content-version member (draft only) |
| `DELETE` | `/api/v1/qep/requirements/baselines/{id}/items/{contentVersionId}` | Remove a member (draft only) |
| `POST` | `/api/v1/qep/requirements/baselines/{id}/lock` | Lock (computes integrity fingerprint) |
| `POST` | `/api/v1/qep/requirements/baselines/{id}/archive` | Archive a locked baseline |
| `POST` | `/api/v1/qep/requirements/baselines/{id}/verify` | Re-verify integrity fingerprint (Part 3) |
| `POST` | `/api/v1/qep/requirements/baselines/compare` | Compare two baselines' membership |
| `GET` | `/api/v1/qep/requirements/{requirementId}/baselines` | Baseline history for one requirement |

There is **no** unlock, restore, delete, or clone route for a baseline at any
status. All other HTTP methods on these paths return `405 Method Not Allowed`.
Every route requires authentication and the matching permission (see
[AUTHORIZATION.md](./AUTHORIZATION.md)) and passes through the standard
correlation-id/response-envelope pipeline (Document 010).
