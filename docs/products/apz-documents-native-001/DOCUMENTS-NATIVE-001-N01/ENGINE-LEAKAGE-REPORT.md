# Engine Leakage Report — APZ-DOCUMENTS-NATIVE-001-N01

| Field     | Value               |
| --------- | ------------------- |
| Slice     | N-01                |
| Status    | **COMPLETE**        |
| Timestamp | 20260805T141500Z    |
| Result    | **GAPS IDENTIFIED** |

## Rule

Users must never know which implementation engine exists. Check UI, URLs, navigation, labels, help, settings, error messages, and user-exposed diagnostics.

## Findings

| Check                           | Result                                                     | Evidence                                                                                          |
| ------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Paperless / Paperless-ngx in UI | **NONE**                                                   | No matches in `apps/web` Documents components/lib                                                 |
| Engine name in URLs             | **NONE**                                                   | Routes under `/workspace/documents`, `/api/v1/documents`                                          |
| Engine name in nav / labels     | **NONE**                                                   | Activity Bar / sidebar: Documents, Overview, …                                                    |
| Engine name in help/settings    | **N/A**                                                    | Help/settings absent                                                                              |
| Engine name in user errors      | **NONE** observed for Paperless; generic document messages |
| Storage provider identity       | **LEAK**                                                   | Diagnostics renders `providerId`, `providerKind`, `providerReady` (`platform-documents-view.tsx`) |
| Storage ops metadata            | **RISK**                                                   | Checksum / storage key presence shown in product panels — repository mental model                 |
| Legacy ops inventory            | **OUT OF PRODUCT UI**                                      | `ENVIRONMENT.md` mentions legacy `apz-paperless` host — not shell UX                              |

## Verdict

| Class                             | Status                           |
| --------------------------------- | -------------------------------- |
| Named document engine (Paperless) | **NONE**                         |
| Implementation / provider leakage | **GAPS IDENTIFIED** (G-04, G-05) |

No solutions implemented in this slice.
