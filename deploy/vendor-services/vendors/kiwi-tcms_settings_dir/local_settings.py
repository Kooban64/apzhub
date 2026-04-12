import os

# Loaded by tcms.settings.product via tcms_settings_dir (Kiwi Docker).
# Disables Plausible snippet; reduces third-party calls behind strict proxies / ad blockers.
ANONYMOUS_ANALYTICS = False

# django-guardian uses settings.ANONYMOUS_USER_NAME ("AnonymousUser" in Kiwi). That user
# must exist in auth_user or anonymous hits to @permission_required views can 500 with
# User.DoesNotExist. After a fresh DB run: ./scripts/kiwi-ensure-guardian-anonymous-user.sh

# Enable transparent SSO from gateway-forwarded Authentik identity.
# This keeps local auth as fallback for breakglass while making portal launches seamless.
AUTHENTICATION_BACKENDS = (
    "django.contrib.auth.backends.RemoteUserBackend",
    "django.contrib.auth.backends.ModelBackend",
)

MIDDLEWARE = (
    *MIDDLEWARE,
    "tcms_settings_dir.remote_auth.KiwiRemoteUserHeaderMiddleware",
    "tcms_settings_dir.remote_auth.KiwiRoleSyncMiddleware",
)

# Allow operational tuning without image rebuilds.
KIWI_REMOTE_USER_HEADER = os.getenv("KIWI_REMOTE_USER_HEADER", "HTTP_X_FORWARDED_USER")
KIWI_ADMIN_GROUPS = os.getenv(
    "KIWI_ADMIN_GROUPS",
    "platform-owner,portal-owner,platform-admin,portal-admin,kiwi-admin,admin,akadmin,authentik admins",
)
