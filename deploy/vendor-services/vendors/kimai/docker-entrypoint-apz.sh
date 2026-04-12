#!/bin/sh
set -e
# Named volume on /opt/kimai/var hides plugin files baked into the image; sync each start so upgrades apply.
SRC=/opt/kimai/.apz-bundled-plugins
DST=/opt/kimai/var/plugins
if [ -d "$SRC" ]; then
    mkdir -p "$DST"
    for d in ApprovalBundle LockdownPerUserBundle ArchiveTimesheetsCommandBundle; do
        if [ -d "$SRC/$d" ]; then
            rm -rf "$DST/$d"
            cp -a "$SRC/$d" "$DST/"
        fi
    done
    chown -R www-data:www-data "$DST" 2>/dev/null || true
fi
exec docker-php-entrypoint "$@"
