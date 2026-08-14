# APZ tools host layout

> **Status:** Canonical · 2026-08-13  
> **Host root:** `/home/ubuntu/apztools` (`APZTOOLS_ROOT`)  
> **Policy:** CE / OSS / free tools only

Tools do **not** run inside Next.js. They run in Docker clusters and write artefacts under pillar directories.

| Directory        | Pillar | Cluster                               | Tools (CE)                                                                                                                                           |
| ---------------- | ------ | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`security/`**  | APZPEN | `apzqep-pentest` + `apzqep-greenbone` | ZAP, Trivy, Semgrep, Nuclei, Gitleaks, Syft, Grype, OSV, Checkov, Nmap, testssl, Prowler, kube-bench, Schemathesis, Greenbone; Kali / MobSF optional |
| **`quality/`**   | APZQEP | `apzqep-testing`                      | Playwright, Vitest, Cypress, k6, axe, Selenium, Lighthouse, Pa11y, JMeter, Newman, Allure; SonarQube Community optional                              |
| **`workbench/`** | APZPRD | (scratch / future)                    | Plane, Zammad, Kimai, Metabase, n8n job I/O                                                                                                          |
| **`shared/`**    | all    | ro mount `/shared`                    | Shared repos / fixtures                                                                                                                              |

Compatibility aliases: `pentest` → `security`, `testing` → `quality`.

See also: [PENTEST-CLUSTER.md](../../infrastructure/docker/clusters/PENTEST-CLUSTER.md) · [TESTING-CLUSTER.md](../../infrastructure/docker/clusters/TESTING-CLUSTER.md) · host `~/apztools/README.md`.
