# Release Candidate Package — APZQEP-FREEZE-001

## Identity

| Field                                               | Value                                                                |
| --------------------------------------------------- | -------------------------------------------------------------------- |
| RC ID                                               | **APZQEP-TEST-EXECUTION-1.0.0-rc.1**                                 |
| Package                                             | `@apzhub/qep-test-execution`                                         |
| Version                                             | **1.0.0-rc.1**                                                       |
| Module                                              | `modules/qep-test-execution` **1.0.0-rc.1**                          |
| Build identifier                                    | `FREEZE-001 / 20260729T153121Z`                                      |
| Git commit reference (workspace HEAD at validation) | `9fff73c01f5b785b0e4362463830ea86b64a8a3a`                           |
| Certification reference                             | APZQEP-CERT-001 · `20260729T152900Z-APZQEP-CERT-001-ACCEPTANCE.json` |
| Freeze reference                                    | APZQEP-FREEZE-001 · `20260729T153121Z-APZQEP-FREEZE-001.json`        |
| Classification                                      | **PRODUCTION_READY_WITH_LIMITATIONS**                                |

## Evidence bundle

| Artefact      | Path                                                      |
| ------------- | --------------------------------------------------------- |
| Freeze pack   | `docs/products/apzqep/test-execution/FREEZE-001/`         |
| Release pack  | `docs/releases/apzqep/test-execution/1.0.0-rc.1/`         |
| Certification | `docs/products/apzqep/test-execution/CERT-001/`           |
| ECR           | `docs/products/apzqep/test-execution/ECR-001/`            |
| Waves         | `docs/products/apzqep/test-execution/ENG-100A`…`ENG-100E` |

## Integrity hashes (selected artefacts)

| File                                                          | SHA-256                                                            |
| ------------------------------------------------------------- | ------------------------------------------------------------------ |
| `packages/qep-test-execution/package.json`                    | `14aeb6e98b2ab3fc09b01f6adf8b378b4d954a7f50f51845554a306f7b6bd220` |
| `packages/qep-test-execution/src/index.ts`                    | `259edd07e1d62403be4a4d3ae9d5dab9d2d2976dd2c72f4042fe29c320fb5b07` |
| `modules/qep-test-execution/module.yaml`                      | `a59fce457f6669e5b15e0406f1a6e1a57295cf3fa146bafcd4f1c48a81c635c3` |
| `packages/config/drizzle/0087_apz_qep_test_execution.sql`     | `6e13f57004bfb2a8c1bfd43c98bf4a3a809a0618d8aec09143114138682d286b` |
| `packages/config/drizzle/0088_apz_qep_test_execution_rls.sql` | `72cd78e4eee9f52d0951afd9f086adc22a5eb1c43e2cdf439b5f16951245ecdf` |

## Reproducibility note

At freeze validation time, the capability implementation and programme packs exist in the workspace but are **not fully committed** to `origin/main` at HEAD above. Production deploy **shall** use a commit that contains this RC tree. Recommended post-acceptance action: Owner-authorised commit establishing RC (or `1.0.0` on Freeze acceptance) as the deployable baseline.

## Recommended frozen baseline after Owner Freeze Decision

Promote RC → **`1.0.0`** as the authoritative frozen production baseline (patch line `1.0.x` thereafter under new Owner programmes only), preserving class **PRODUCTION_READY_WITH_LIMITATIONS**.
