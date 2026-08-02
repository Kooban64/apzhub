# Test Suite Workspace — APZQEP-140-A

## Routes

| Route                        | Purpose                                |
| ---------------------------- | -------------------------------------- |
| `/workspace/qep/suites`      | Home — list / tree / card              |
| `/workspace/qep/suites/new`  | Create                                 |
| `/workspace/qep/suites/{id}` | Detail — metadata, lifecycle, activity |

## Regions

- Filter bar (search, status, sort, view mode)
- Primary content (list / tree / card)
- Detail: details panel · lifecycle actions · activity timeline · metadata panel · version history

## Module registration

`modules/qep-suites/module.yaml` — sidebar **Suites**, order 20.

## Reference UX

This workspace is the interaction pattern reference for Runs, Execution, Defects, Traceability, and Reporting.
