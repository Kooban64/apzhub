# LAW-CHANGE-GOVERNANCE

| Field               | Value                                                                                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Programme           | APZHUB-LAW-ADOPT-004                                                                                                                                         |
| Timestamp           | 20260803T135126Z                                                                                                                                             |
| Release model cited | [LAW-RELEASE-GOVERNANCE.md](../APZHUB-LAW-ADOPT-002/LAW-RELEASE-GOVERNANCE.md) · [APZHUB-RELEASE-GOVERNANCE](../APZHUB-ENG-003/APZHUB-RELEASE-GOVERNANCE.md) |

## Purpose

Control operational and configuration changes for Law without opening silent engineering.

## Change classes

| Class                         | Examples                                                           | Authority                                                         |
| ----------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------- |
| Standard ops change           | Config toggle already documented; restart; cert rotate per runbook | Product Operations Owner                                          |
| Emergency ops change          | Mitigate S1 using existing runbook                                 | Ops Owner + Owner notify                                          |
| Product / code change         | Any source, API, schema, security behaviour                        | **Separate Owner Auth + programme** — PROHIBITED in ops-only path |
| Enterprise governance change  | Standards / lifecycle                                              | **PROHIBITED** in product ops programmes                          |
| Documentation-only ops update | Register/handbook corrections                                      | Ops Owner; commit docs/evidence                                   |

## Change record (required)

| Field     | Description                                          |
| --------- | ---------------------------------------------------- |
| Change ID | `LAW-CHG-YYYYMMDD-NNN`                               |
| Class     | Standard / Emergency / Product / Docs                |
| Summary   | What changes                                         |
| Risk      | Impact assessment                                    |
| Rollback  | How to revert ops change                             |
| Evidence  | Timestamped note / evidence path                     |
| Approver  | Role                                                 |
| Status    | Proposed / Approved / Applied / Failed / Rolled back |

## Register

| Change ID | Class | Summary | Approver | Status                  |
| --------- | ----- | ------- | -------- | ----------------------- |
| —         | —     | —       | —        | Empty at programme open |

## Rules

1. Audit recommends; Board/Owner authorises product change; ops execute authorised ops changes.
2. No “while we’re here” engineering.
3. Packaging 1.0.0 remains ACCEPTED/CLOSED — version bumps require release governance path.
