# Operational Feedback Register — APZQEP-161-OE

| Field     | Value                                                                |
| --------- | -------------------------------------------------------------------- |
| Programme | APZQEP-161-OE                                                        |
| Timestamp | 20260803T164801Z                                                     |
| Rule      | Classify; implement only Documentation / Minor bug / Config under OE |

## Register

| ID     | Finding                                                                                                                                  | Classification                    | Metric     | Disposition                                                           |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ---------- | --------------------------------------------------------------------- |
| OE-001 | Public host auth returned `Invalid origin` when `BETTER_AUTH_URL` / trusted origins did not include `https://apzhub.apzportal.apzor.com` | **Minor bug** / Config            | Observed   | **Fixed** in OE — `trustedOrigins` + `BETTER_AUTH_TRUSTED_ORIGINS`    |
| OE-002 | Process-local execution history lost on restart                                                                                          | Operational process / Future Wave | Observed   | Deferred — durable store programme                                    |
| OE-003 | Artifact media viewers / live console absent                                                                                             | Usability / Future Wave           | Observed   | Deferred — execution experience polish                                |
| OE-004 | Dry-run can be mistaken for live browser                                                                                                 | Documentation / Usability         | Observed   | Mitigated — onboarding + Quick Start wording                          |
| OE-005 | Evidence export not available                                                                                                            | Future Wave                       | Observed   | Deferred                                                              |
| OE-006 | Executive dashboards not available for automation                                                                                        | Future Wave (164)                 | Observed   | Deferred                                                              |
| OE-007 | QKI / notifications attach via hooks; UI projection thin                                                                                 | Future Wave                       | Observed   | Deferred — deepen consumers later                                     |
| OE-008 | Production `next build` fails on unrelated `qep-defects` Zod type                                                                        | Minor bug                         | Observed   | Deferred — separate micro-fix Owner Auth (not Wave 2)                 |
| OE-009 | Wildcard LE cert for `*.apzportal.apzor.com` is expired; dedicated `apzhub` cert required                                                | Operational process               | Observed   | Documented — renew wildcard via DNS-01 separately                     |
| OE-010 | Placeholder providers correctly refuse execute                                                                                           | Operational process (positive)    | Observed   | Keep — training point                                                 |
| OE-011 | Provider-neutral API surface usable for internal automation                                                                              | Operational process (positive)    | Observed   | Keep                                                                  |
| OE-012 | GitHub / SCM platform gap (push→APZQEP path)                                                                                             | Wave 2                            | **CLOSED** | Delivered under [APZQEP-162](../apzqep-162/) (`@apzhub/platform-scm`) |

## Classification key

| Class                    | OE may implement?     |
| ------------------------ | --------------------- |
| Documentation            | Yes                   |
| Usability (copy/docs)    | Yes                   |
| Minor bug                | Yes (low risk)        |
| Operational process      | Docs / runbooks only  |
| Future Wave              | No — catalogue only   |
| Architecture enhancement | No — STOP if required |
