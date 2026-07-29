# Version Integrity Report — APZQEP-FREEZE-002

## Candidate identity

| Location                                   | Expected                 | Actual       | Result |
| ------------------------------------------ | ------------------------ | ------------ | ------ |
| `packages/qep-test-execution/package.json` | `1.0.1-rc.1`             | `1.0.1-rc.1` | ✅     |
| `QEP_TEST_EXECUTION_VERSION`               | `1.0.1-rc.1`             | `1.0.1-rc.1` | ✅     |
| `QEP_TEST_EXECUTION_PROGRAMME`             | REM-001 candidate marker | Present      | ✅     |
| `modules/qep-test-execution/module.yaml`   | `1.0.1-rc.1`             | `1.0.1-rc.1` | ✅     |
| CERT-002 / REM-001 evidence                | `1.0.1-rc.1`             | Consistent   | ✅     |
| Changelog entry                            | Present                  | Present      | ✅     |

## Stale identities

| Identity                                   | Status        |
| ------------------------------------------ | ------------- |
| `1.0.0-rc.1` as current package version    | Absent        |
| Silent overwrite of production `1.0.0` tag | Not performed |
| Premature final `1.0.1`                    | Not declared  |

## Consistency verdict

```text
VERSION IDENTITY CONSISTENT — 1.0.1-rc.1
```
