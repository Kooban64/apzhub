# Execution Plan API

Base: `/api/v1/qep/execution-plans`

| Method    | Path                    | Op                       |
| --------- | ----------------------- | ------------------------ |
| GET/POST  | `/`                     | list / create            |
| GET/PATCH | `/{planId}`             | get / update             |
| POST      | `/{planId}/lifecycle`   | governed transition      |
| POST      | `/{planId}/readiness`   | evaluate                 |
| POST      | `/{planId}/schedule`    | schedule metadata        |
| POST      | `/{planId}/assignments` | assign                   |
| POST      | `/{planId}/clone`       | clone                    |
| POST      | `/{planId}/handoff`     | idempotent Cap C handoff |
