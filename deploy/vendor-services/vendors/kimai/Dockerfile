# Plugins baked in — rebuild after ./docker/scripts/fetch-kimai-plugins.sh or plugin tag bumps.
# Base digest must stay in sync with APZ_IMAGE_KIMAI_BASE in docker/image-pins.env (and PLATFORM_VERSIONS.md).
# Bundled under .apz-bundled-plugins: entrypoint copies into /opt/kimai/var/plugins because kimai_var hides image layers.
FROM docker.io/kimai/kimai2@sha256:8a151cb1ef07bcbbc15c30b3014d50ccf27547427c1968ce7c6dc9d9a749fc44

USER root
# Paths relative to build context (this directory) — apzhub vendor-services layout.
COPY docker-entrypoint-apz.sh /usr/local/bin/apz-kimai-entrypoint.sh
RUN chmod 755 /usr/local/bin/apz-kimai-entrypoint.sh
COPY plugins/ApprovalBundle /opt/kimai/.apz-bundled-plugins/ApprovalBundle
COPY plugins/LockdownPerUserBundle /opt/kimai/.apz-bundled-plugins/LockdownPerUserBundle
COPY plugins/ArchiveTimesheetsCommandBundle /opt/kimai/.apz-bundled-plugins/ArchiveTimesheetsCommandBundle
RUN chmod -R a+rX /opt/kimai/.apz-bundled-plugins

ENTRYPOINT ["/usr/local/bin/apz-kimai-entrypoint.sh"]
CMD ["/entrypoint.sh"]
