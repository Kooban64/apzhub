import os
import re

from django.utils.deprecation import MiddlewareMixin


def _parse_groups(raw_groups: str) -> set[str]:
    if not raw_groups:
        return set()
    values = [value.strip().lower() for value in re.split(r"[,;|]", raw_groups)]
    return {value for value in values if value}


def _admin_groups() -> set[str]:
    configured = _parse_groups(
        os.getenv(
            "KIWI_ADMIN_GROUPS",
            "platform-owner,portal-owner,platform-admin,portal-admin,kiwi-admin,admin,akadmin,authentik admins",
        )
    )
    # Always include platform aliases required by APZ portal, even if env overrides drift.
    required = {
        "platform-owner",
        "portal-owner",
        "platform-admin",
        "portal-admin",
        "kiwi-admin",
        "admin",
        "akadmin",
        "authentik admins",
    }
    return configured.union(required)


def _extract_remote_username(request, header: str) -> str:
    # Prefer configured remote-user header, then Authentik identity headers.
    for key in (header, "HTTP_X_AUTHENTIK_EMAIL", "HTTP_X_AUTHENTIK_USERNAME"):
        value = request.META.get(key, "").strip()
        if value:
            return value
    return ""


class KiwiRemoteUserHeaderMiddleware(MiddlewareMixin):
    # Authenticate users from gateway-injected identity headers.
    def process_request(self, request):
        header = os.getenv("KIWI_REMOTE_USER_HEADER", "HTTP_X_FORWARDED_USER").strip()
        username = _extract_remote_username(request, header)

        if not username:
            return None

        user = getattr(request, "user", None)
        if user and user.is_authenticated and user.get_username() == username:
            return None

        from django.contrib.auth import authenticate, login

        authenticated_user = authenticate(request, remote_user=username)

        if authenticated_user:
            login(request, authenticated_user)
            request.user = authenticated_user
        return None


class KiwiRoleSyncMiddleware(MiddlewareMixin):
    # Keep admin-level portal users admin in Kiwi.
    def process_request(self, request):
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return None

        # Only apply role sync when the request actually carries Authentik identity
        # headers. This prevents local/API sessions from being unintentionally
        # downgraded on non-forward-auth request paths.
        has_authentik_context = any(
            bool(request.META.get(key, "").strip())
            for key in (
                "HTTP_X_AUTHENTIK_GROUPS",
                "HTTP_X_AUTHENTIK_EMAIL",
                "HTTP_X_AUTHENTIK_NAME",
                "HTTP_X_AUTHENTIK_USERNAME",
            )
        )
        if not has_authentik_context:
            return None

        groups = _parse_groups(request.META.get("HTTP_X_AUTHENTIK_GROUPS", ""))
        should_be_admin = bool(groups.intersection(_admin_groups()))
        email = request.META.get("HTTP_X_AUTHENTIK_EMAIL", "").strip()
        name = request.META.get("HTTP_X_AUTHENTIK_NAME", "").strip()
        parts = [part for part in name.split(" ") if part]
        first_name = parts[0] if parts else ""
        last_name = " ".join(parts[1:]) if len(parts) > 1 else ""

        updates = {}
        if user.is_staff != should_be_admin:
            updates["is_staff"] = should_be_admin
            user.is_staff = should_be_admin
        if user.is_superuser != should_be_admin:
            updates["is_superuser"] = should_be_admin
            user.is_superuser = should_be_admin
        if email and user.email != email:
            updates["email"] = email
            user.email = email
        if first_name and user.first_name != first_name:
            updates["first_name"] = first_name
            user.first_name = first_name
        if last_name and user.last_name != last_name:
            updates["last_name"] = last_name
            user.last_name = last_name

        if updates:
            from django.contrib.auth import get_user_model

            user_model = get_user_model()
            user_model.objects.filter(pk=user.pk).update(**updates)
        return None
