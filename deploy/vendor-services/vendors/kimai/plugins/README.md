# Kimai plugins (baked into `docker/kimai/Dockerfile`)

These directories are **not** committed by default (see repo `.gitignore`). Populate them **before** building the Kimai image:

```bash
./docker/scripts/fetch-kimai-plugins.sh
cd docker
docker compose -f compose.yml --env-file .env --env-file image-pins.env build kimai
docker compose -f compose.yml --env-file .env --env-file image-pins.env up -d kimai
```

Then run the **database installers once** (or again after upgrading those plugins):

```bash
cd docker
docker compose -f compose.yml -f compose/kimai.yml --env-file .env --env-file image-pins.env exec -u www-data kimai \
  /opt/kimai/bin/console kimai:bundle:approval:install --env=prod
docker compose -f compose.yml -f compose/kimai.yml --env-file .env --env-file image-pins.env exec -u www-data kimai \
  /opt/kimai/bin/console kimai:bundle:lockdownperuser:install --env=prod
docker compose -f compose.yml -f compose/kimai.yml --env-file .env --env-file image-pins.env exec -u www-data kimai \
  /opt/kimai/bin/console kimai:reload --env=prod
```

**Archive timesheets** removes old rows permanently; always read `--help` and keep backups:

`kimai:archive:timesheets` with `-p` (PHP `DateInterval`, default `P1Y`).

To **vendor plugins in git** for fully offline deploys, remove the `docker/kimai/plugins/*/` lines from `.gitignore`, run the fetch script, and commit the three bundle folders.

## Evaluating more plugins

For guidance on optional marketplace-style bundles (rounding, period insert, calendar prefs, deduction time, easy backup) versus the wider APZ product stack, see [docs/kimai-plugins.md](../../docs/kimai-plugins.md).
