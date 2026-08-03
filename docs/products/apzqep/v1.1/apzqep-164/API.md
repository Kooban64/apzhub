# API — APZQEP-164

Base: `/api/v1/qep/dashboards`

| Method   | Path                     | Operation                       |
| -------- | ------------------------ | ------------------------------- |
| GET      | `/`                      | List dashboards                 |
| GET      | `/widgets`               | List widgets                    |
| GET      | `/visualizations`        | List viz kinds                  |
| GET      | `/{dashboardId}`         | Resolve dashboard + projections |
| GET      | `/projections/{queryId}` | Single projection               |
| GET/POST | `/views`                 | List / save views               |
| POST     | `/layouts`               | Save layout                     |

Provider-neutral metadata APIs. No business mutation APIs.
