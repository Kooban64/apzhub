# Execution API

Base: `/api/v1/qep/execution-sessions`

| Method   | Path                     | Op                                              |
| -------- | ------------------------ | ----------------------------------------------- |
| GET/POST | `/`                      | list / create from handoffId                    |
| GET      | `/{sessionId}`           | aggregate                                       |
| POST     | `/{sessionId}/lifecycle` | open/pause/resume/block/complete/cancel/archive |
| POST     | `/{sessionId}/steps`     | record step result                              |
| POST     | `/{sessionId}/amend`     | governed correction                             |
| POST     | `/{sessionId}/evidence`  | attach evidence reference                       |
