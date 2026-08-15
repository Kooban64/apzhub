# Faraday CE (optional — APZPEN ENT-001)

**Status:** optional Community Edition aggregator. **Authorised ENT-001 path** is export JSON → `~/apztools/security/out/faraday/` → APZPEN artefact list/ingest. Live Faraday UI/API sync is not required for ingest.

| Item    | Value                                                                            |
| ------- | -------------------------------------------------------------------------------- |
| Compose | `docker-compose.yml` (profile-gated scaffold — **not** claimed production-ready) |
| Project | `apzqep-faraday` (suggested)                                                     |
| Role    | Optional findings aggregator; primary value = export → APZPEN                    |
| Kali    | Remains **runner-only** — not a Faraday UI / QEP module                          |

## Authorised APZHUB path (primary)

1. Export Faraday findings as JSON (`faraday-findings.json`, `*-findings.json`, or `vulns.json`).
2. Place under `~/apztools/security/out/faraday/` (or `$APZTOOLS_ROOT/security/out/faraday/`).
3. List via `GET /api/v1/apzpen/providers/faraday/artefacts` (APZPEN read).
4. Ingest: paste/upload in APZPEN Provider ingest (`toolId: faraday`), or when `APZPEN_FARADAY_ARTEFACT_INGEST=true` POST `/api/v1/apzpen/engagements/:id/ingest` with `{ "fromArtefactPath": "…" }` / `artefactPath` (path must stay under the Faraday out dir). Explicit `toolId: "faraday"` is optional when the path is under that root.

Catalogue status: **ingest_ready** · not dispatchable.

Health probe: set `FARADAY_URL` when an instance is reachable; otherwise `@apzhub/integration-faraday` reports compose not deployed / ingest via artefact.

## Recommended official Faraday CE bring-up (Owner-enabled)

Prefer upstream docs over this scaffold:

- [Docker Compose installation](https://docs.faradaysec.com/Install-guide-Docker/)
- Upstream file: `https://raw.githubusercontent.com/infobyte/faraday/master/docker-compose.yaml`
- Typical CE images: `faradaysec/faraday` (+ Postgres + Redis + worker); UI often on `http://127.0.0.1:5985`

Example (Owner-only; pin versions for any real deploy):

```bash
curl -O https://raw.githubusercontent.com/infobyte/faraday/master/docker-compose.yaml
docker compose up -d
# export workspace vulns / report JSON → ~/apztools/security/out/faraday/
```

Do **not** expose Faraday on the public internet without Owner approval + ACL/SSO.

## Optional local scaffold (profile-gated)

The `docker-compose.yml` in this directory is a **minimal pointer** for Owner-enabled experiments. Services use `profiles: ["faraday"]` so default `docker compose up` does **nothing**.

```bash
cd infrastructure/docker/clusters/faraday
# Does nothing without profile:
docker compose -p apzqep-faraday up -d
# Owner-enabled only — fetch/pin upstream images yourself; not production-certified here:
docker compose -p apzqep-faraday --profile faraday up -d
```

This scaffold is **optional**, **not** a production Faraday stack. Prefer the official upstream compose + `FARADAY_URL` probe + artefact ingest as the ENT-001 path.

## Coexistence

- Separate from `apzqep-pentest` and `apzqep-greenbone`.
- Never auto-certify from Faraday severity.
- Engine branding masked in APZPEN UI (catalogue / ingest surfaces).
