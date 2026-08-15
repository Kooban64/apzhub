# Faraday CE (optional — APZPEN · SPR-FULL-002-C)

**Status:** production **path** ready for Owner-enabled bring-up. Primary ENT-001 ingest remains export JSON → artefact dir → APZPEN. Live Faraday is optional.

| Item    | Value                                                                    |
| ------- | ------------------------------------------------------------------------ |
| Compose | `docker-compose.yml` — profile `faraday` (Owner-enabled only)            |
| Project | `apzqep-faraday`                                                         |
| REST    | `@apzhub/integration-faraday` `fetchFaradayVulns` when `FARADAY_URL` set |
| Kali    | Runner-only — not a Faraday UI / QEP module                              |

## Authorised APZHUB path (primary)

1. Export Faraday findings as JSON (`faraday-findings.json`, `*-findings.json`, or `vulns.json`).
2. Place under `~/apztools/security/out/faraday/` (or `$APZTOOLS_ROOT/security/out/faraday/`).
3. List via `GET /api/v1/apzpen/providers/faraday/artefacts`.
4. Ingest via APZPEN Provider ingest or `APZPEN_FARADAY_ARTEFACT_INGEST=true` path ingest.

## Live REST export (FULL-002-C)

```bash
export FARADAY_URL=http://127.0.0.1:5985
export FARADAY_API_TOKEN=…          # optional Token header
export FARADAY_WORKSPACE=default    # optional
# Use integration helper fetchFaradayVulns → toFaradayArtefact → write under out/faraday/
```

## Owner-enabled compose

```bash
cd infrastructure/docker/clusters/faraday
cp .env.example .env   # set passwords locally — never commit secrets
docker compose -p apzqep-faraday --profile faraday up -d
```

Default `docker compose up` without profile does **nothing**. Do not expose Faraday publicly without Owner ACL.

## Coexistence

- Separate from `apzqep-pentest` and `apzqep-greenbone`.
- Never auto-certify from Faraday severity.
