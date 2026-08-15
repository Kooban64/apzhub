# APZ tools clusters (host runners)

Three host workspaces under `~/apztools` map to commercial pillars:

| Host path                                               | Pillar     | Compose project                       |
| ------------------------------------------------------- | ---------- | ------------------------------------- |
| [`~/apztools/security`](../../../../apztools/README.md) | **APZPEN** | `apzqep-pentest` + `apzqep-greenbone` |
| `~/apztools/quality`                                    | **APZQEP** | `apzqep-testing`                      |
| `~/apztools/workbench`                                  | **APZPRD** | (scratch / future job I/O)            |
| `~/apztools/shared`                                     | shared     | mounted read-only into runners        |

Aliases (compat): `pentest` → `security`, `testing` → `quality`.

| Cluster          | Purpose                          | Compose                                                                                            |
| ---------------- | -------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Security**     | DAST / VA / scanner runners      | [PENTEST-CLUSTER.md](./PENTEST-CLUSTER.md) · `docker-compose.pentest-cluster.yml`                  |
| **Quality**      | Functional / a11y / perf runners | [TESTING-CLUSTER.md](./TESTING-CLUSTER.md) · `docker-compose.testing-cluster.yml`                  |
| **Greenbone CE** | Network/host VA                  | [greenbone/README.md](./greenbone/README.md) · project `apzqep-greenbone` · `:9392` localhost      |
| **Faraday CE**   | Optional findings aggregator     | [faraday/README.md](./faraday/README.md) · profile-gated scaffold · primary path = artefact ingest |

**Policy:** Community Edition / open-source / free only — no mandatory commercial scanners.

**Kali** / **MobSF** are optional runner profiles — not APZHUB product UIs.  
**SonarQube Community Build** is an optional quality profile (heavy).  
**Faraday** is optional (ENT-001): export JSON → `security/out/faraday` → APZPEN ingest; compose profile-gated / Owner-enabled — not required for ingest.
APZHUB dispatches jobs and ingests reports — never auto-certifies. See Flagship F11: `docs/products/apzqep/engineering/evidence/F11-SECURITY-DISPATCH.md`.
