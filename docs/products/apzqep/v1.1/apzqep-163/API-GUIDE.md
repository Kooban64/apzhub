# API-GUIDE — APZQEP-163

Base: `/api/v1/qep/quality-intelligence`

| Method   | Path                    | Operation                              |
| -------- | ----------------------- | -------------------------------------- |
| GET      | `/providers`            | List providers                         |
| GET/POST | `/observations`         | List / record                          |
| GET      | `/signals`              | List signals                           |
| GET      | `/recommendations`      | List                                   |
| GET/POST | `/recommendations/{id}` | Get / accept\|reject                   |
| GET      | `/scores`               | List scores                            |
| GET      | `/confidence`           | List confidence assessments            |
| GET      | `/history`              | Recommendation history                 |
| GET      | `/audit`                | Recommendation audit trail             |
| GET      | `/explanations/{id}`    | Get explanation                        |
| POST     | `/analyze`              | Calculate signals + evaluate providers |

Provider-neutral. No OpenAI/Claude request shapes.
