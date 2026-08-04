# Report Assembly

`generateReportView` applies a Report Profile to an Evidence Integration Package and returns
a **view-only** structure of included opaque references.

## Output guards

| Flag                   | Value   |
| ---------------------- | ------- |
| `viewOnly`             | `true`  |
| `isEvidence`           | `false` |
| `presentationExternal` | `true`  |

## Rules

- Assembly selects references by profile inclusion slots.
- Assembly never copies artefact content.
- Assembly never creates Evidence Platform records.
- Presentation / dashboard rendering remains external (QO-015+).
