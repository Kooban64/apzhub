# Decision Profiles

Immutable profiles declare **decision thresholds only**.

Built-ins:

| Profile ID         | Typical use              |
| ------------------ | ------------------------ |
| developer_commit   | Local / developer commit |
| pull_request       | Pull request             |
| nightly            | Nightly runs             |
| regression         | Focused regression       |
| release_candidate  | Release candidate        |
| production_release | Production release       |
| emergency_fix      | Emergency fix            |
| compliance_audit   | Compliance audit         |
| custom             | Custom baseline          |

Threshold fields:

- `minOverallConfidence`
- `maxResidualRisk`
- `requireGovernanceSatisfied`
- `requireApprovalComplete`
- `deferWhenApprovalsOutstanding`
- `allowConditionalGo`

Profiles never encode workflow steps or deployment actions.
