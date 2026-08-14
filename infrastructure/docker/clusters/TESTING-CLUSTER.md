# Quality tools cluster (APZQEP)

Isolated from the APZHUB portal and from the security / pen-test cluster.

**Host workspace:** `~/apztools/quality` → `/work` (alias: `~/apztools/testing`)

**Policy:** Community Edition / open-source / free only.

## Services (inventory)

| Service                | Profile     | Role                                     | Artefacts                |
| ---------------------- | ----------- | ---------------------------------------- | ------------------------ |
| `playwright-runner`    | `runners`   | Browser E2E                              | `quality/out/playwright` |
| `vitest-runner`        | `runners`   | Unit / component                         | `quality/out/vitest`     |
| `cypress-runner`       | `runners`   | E2E (optional)                           | `quality/out/cypress`    |
| `selenium-hub` + nodes | `selenium`  | Classic WebDriver                        | —                        |
| `axe-runner`           | `runners`   | Accessibility (Node host)                | `quality/out/axe`        |
| `k6-runner`            | `runners`   | Performance / load                       | `quality/out/k6`         |
| `lighthouse-runner`    | `runners`   | Web performance / a11y audits            | `quality/out/lighthouse` |
| `pa11y-runner`         | `runners`   | CLI a11y (Node + `npx pa11y`)            | `quality/out/pa11y`      |
| `jmeter-runner`        | `runners`   | Apache JMeter load                       | `quality/out/jmeter`     |
| `newman-runner`        | `runners`   | Postman collections (Newman)             | `quality/out/newman`     |
| `allure-runner`        | `reporting` | Allure report service (`127.0.0.1:5050`) | `quality/out/allure`     |
| `sonar-runner`         | `sonar`     | SonarQube **Community Build** (heavy)    | `quality/out/sonar`      |

## Bring up

```bash
export APZTOOLS_ROOT=/home/ubuntu/apztools
cd infrastructure/docker/clusters

docker compose -f docker-compose.testing-cluster.yml -p apzqep-testing \
  --profile runners --profile selenium --profile reporting up -d

# Optional heavy CE
# docker compose -f docker-compose.testing-cluster.yml -p apzqep-testing --profile sonar up -d
```

```bash
docker exec apzqep-testing-playwright-runner-1 npx playwright --version
docker exec apzqep-testing-vitest-runner-1 node -v
docker exec apzqep-testing-k6-runner-1 k6 version
docker exec apzqep-testing-newman-runner-1 newman --version
docker exec apzqep-testing-jmeter-runner-1 jmeter -v | head -5
```

## Dispatch

- Flag: `APZHUB_VERIFICATION_DISPATCH=true` (F10)
- Runner POSTs to `/api/v1/qep/automation/executions` with `target.metadata.changeEventId`

## Network rules

- No inbound from internet except CI orchestrator
- Do **not** share Docker network with security cluster
- Prefer binding report UIs to `127.0.0.1` only
