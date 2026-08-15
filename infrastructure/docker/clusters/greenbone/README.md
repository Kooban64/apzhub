# Greenbone Community Edition (APZQEP pen-test breadth)

Official Greenbone CE containers — **separate** compose project from portal and from F10/F11 runners.

| Item    | Value                                                            |
| ------- | ---------------------------------------------------------------- |
| Compose | `docker-compose.yml` (upstream + port patch)                     |
| Project | `apzqep-greenbone`                                               |
| UI      | `http://127.0.0.1:9392` only (not public)                        |
| Role    | Network/host VA → export findings → APZQEP security ingest (F11) |

## APZHUB path

**GMP API deferred.** Operator flow:

1. Run `scan-*.sh` (gvm-tools) against Owner-approved targets.
2. Artefacts land under `~/apztools/security/out/greenbone/` (e.g. `…/lovebloom/greenbone-findings.json`).
3. List via `GET /api/v1/apzpen/providers/greenbone/artefacts` (APZPEN read).
4. Ingest into an engagement: paste/upload in APZPEN Provider ingest, or when `APZPEN_GREENBONE_ARTEFACT_INGEST=true` POST `/api/v1/apzpen/engagements/:id/ingest` with `{ "fromArtefactPath": "…" }` / `artefactPath` (path must stay under the greenbone out dir).

Catalogue status: **ingest_ready** · not dispatchable.

## Start / stop

```bash
cd infrastructure/docker/clusters/greenbone
docker compose -p apzqep-greenbone pull
docker compose -p apzqep-greenbone up -d
docker compose -p apzqep-greenbone ps
```

First boot syncs feeds (VT/SCAP/CERT) — can take **tens of minutes**. Do not scan until `gvmd` reports feeds available.

Set admin password (once):

```bash
docker compose -p apzqep-greenbone exec -u gvmd gvmd \
  gvmd --user=admin --new-password="$(cat /home/ubuntu/apz-portal/.secrets/greenbone-admin)"
```

## Authorized targets only

Create targets / tasks for **Owner-approved** hosts (e.g. `lovebloom.apztdg.com`). Export XML/JSON report → `~/apztools/security/out/greenbone/` → ingest into APZPEN (`/api/v1/apzpen/.../ingest`) or QEP security executions.

Automated helper (after feeds show scan configs — first boot can take **1–2+ hours** while SCAP/GVMD_DATA import):

```bash
./scan-lovebloom.sh lovebloom.apztdg.com 196.216.100.6
# writes ~/apztools/security/out/greenbone/lovebloom/greenbone-findings.json
```

Check readiness:

```bash
docker compose -p apzqep-greenbone run --rm --no-deps gvm-tools \
  gvm-cli --gmp-username admin --gmp-password "$(cat /home/ubuntu/apz-portal/.secrets/greenbone-admin)" \
  socket --socketpath /run/gvmd/gvmd.sock --xml '<get_configs/>' | grep -c '<config id='
# need >= 1 (e.g. Full and fast) before scanning
```

## Coexistence

- Host nginx keeps `:443` — Greenbone TLS bind disabled in this compose.
- Do not put Greenbone UI on the public internet without Owner approval + SSO/ACL.
