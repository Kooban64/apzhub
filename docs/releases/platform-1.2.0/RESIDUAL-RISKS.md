# Residual Risks — Platform 1.2.0 Freeze

> **Programme:** APZHUB-RELEASE-001  
> **Date:** 2026-07-22

| Risk                                   | Likelihood | Impact | Mitigation / freeze posture                                                |
| -------------------------------------- | ---------- | ------ | -------------------------------------------------------------------------- |
| Flaky Playwright under load            | Medium     | Medium | Documented; retry PASS; no silent harness changes under freeze             |
| Visual baseline drift after UI work    | Medium     | Medium | Baselines frozen; future UI changes need named programme + snapshot policy |
| Workflow Execute accidentally enabled  | Low        | High   | Execute remains gated (PL12-KL-09)                                         |
| Email / FIN gaps mis-marketed          | Medium     | High   | KL register + marketing constraint                                         |
| Host coexistence port conflict         | Low        | High   | ENVIRONMENT.md / ops controls (R12-OPS-03 closed)                          |
| Contract pin drift in docs vs packages | Low        | Medium | PACKAGE-VERSIONS inventory is freeze SoT; ENG-0017 closed prior drift      |
| Beginning 1.3 without Acceptance       | Medium     | High   | STOP condition in CURRENT-MILESTONE / AI-MANIFEST                          |

No risk remediation engineering is authorised under this programme.
