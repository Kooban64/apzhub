# Defect API

Base: `/api/v1/qep/defects`

| Method | Path                  | Purpose             |
| ------ | --------------------- | ------------------- |
| GET    | `/`                   | List / filter       |
| POST   | `/`                   | Create manual       |
| POST   | `/from-execution`     | Raise from Cap C    |
| GET    | `/{id}`               | Aggregate           |
| PATCH  | `/{id}`               | Update              |
| POST   | `/{id}/lifecycle`     | Transition          |
| POST   | `/{id}/assign`        | Assign              |
| POST   | `/{id}/evidence`      | Attach evidence ref |
| POST   | `/{id}/relationships` | Link relationship   |
| GET    | `/{id}/history`       | History             |

Conventions match Caps A–C (platform auth, response envelope, correlation).
