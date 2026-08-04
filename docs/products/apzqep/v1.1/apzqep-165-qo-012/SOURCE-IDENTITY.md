# Source Identity

Provider-neutral logical identity kinds:

| Kind                      | Meaning                  |
| ------------------------- | ------------------------ |
| repository                | Repository identity      |
| branch                    | Branch identity          |
| commit                    | Commit identity          |
| pull_request              | Pull request identity    |
| merge_request             | Merge request identity   |
| tag                       | Tag identity             |
| release                   | Release identity         |
| configuration_change      | Configuration change     |
| manual_change_declaration | Manual declaration       |
| external_change_reference | External opaque change   |
| future_registered_source  | Future registered source |

References are opaque strings. No provider product behaviour is encoded.
