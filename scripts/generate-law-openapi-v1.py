#!/usr/bin/env python3
"""Merge OpenAPI components and paths into docs/specs/LAW-OpenAPI-v1.yaml (LAW-014-03)."""

from __future__ import annotations

import copy
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
COMPONENTS = ROOT / "docs/specs/openapi/LAW-OpenAPI-v1-components.yaml"
OUTPUT = ROOT / "docs/specs/LAW-OpenAPI-v1.yaml"


def crud_paths(
    collection: str,
    tag: str,
    id_param: str,
    summary_schema: str,
    detail_schema: str,
    create_schema: str,
    update_schema: str,
    permissions: dict[str, str],
    *,
    put_supported: bool = False,
    delete_description: str = "Archive or delete resource.",
) -> dict:
    item_path = f"/{collection}/{{{id_param}}}"
    collection_path = f"/{collection}"

    def op(
        operation_id: str,
        summary: str,
        permission: str,
        responses: dict,
        method_extra: dict | None = None,
    ) -> dict:
        base = {
            "operationId": operation_id,
            "summary": summary,
            "tags": [tag],
            "security": [{"SessionCookie": []}, {"BearerAuth": []}],
            "parameters": [
                {"$ref": "#/components/parameters/CorrelationId"},
            ],
            "x-required-permission": permission,
            "x-implementation-status": "planned",
            "responses": responses,
        }
        if method_extra:
            base.update(method_extra)
        return base

    detail_success = {
        "200": {
            "description": "Success",
            "headers": {
                "x-request-id": {"$ref": "#/components/headers/XRequestId"},
                "x-correlation-id": {"$ref": "#/components/headers/XCorrelationId"},
                "etag": {"$ref": "#/components/headers/ETag"},
            },
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "required": ["ok", "data", "meta"],
                        "properties": {
                            "ok": {"type": "boolean", "const": True},
                            "data": {"$ref": f"#/components/schemas/{detail_schema}"},
                            "meta": {"$ref": "#/components/schemas/ResponseMeta"},
                        },
                    }
                }
            },
        },
        "401": {"$ref": "#/components/responses/Unauthorized"},
        "403": {"$ref": "#/components/responses/Forbidden"},
        "404": {"$ref": "#/components/responses/NotFound"},
        "429": {"$ref": "#/components/responses/RateLimited"},
        "500": {"$ref": "#/components/responses/InternalError"},
    }

    list_success = {
        "200": {
            "description": "Success",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "required": ["ok", "data", "pagination", "meta"],
                        "properties": {
                            "ok": {"type": "boolean", "const": True},
                            "data": {
                                "type": "array",
                                "items": {"$ref": f"#/components/schemas/{summary_schema}"},
                            },
                            "pagination": {"$ref": "#/components/schemas/PaginationMeta"},
                            "meta": {"$ref": "#/components/schemas/ResponseMeta"},
                        },
                    }
                }
            },
        },
        "401": {"$ref": "#/components/responses/Unauthorized"},
        "403": {"$ref": "#/components/responses/Forbidden"},
        "429": {"$ref": "#/components/responses/RateLimited"},
        "500": {"$ref": "#/components/responses/InternalError"},
    }

    create_success = copy.deepcopy(detail_success)
    create_success["201"] = create_success.pop("200")
    create_success["201"]["headers"] = {
        **create_success["201"].get("headers", {}),
        "Location": {"$ref": "#/components/headers/Location"},
    }
    create_success["400"] = {"$ref": "#/components/responses/ValidationError"}
    create_success["409"] = {"$ref": "#/components/responses/Conflict"}
    create_success["422"] = {"$ref": "#/components/responses/UnprocessableEntity"}

    patch_success = copy.deepcopy(detail_success)
    patch_success["400"] = {"$ref": "#/components/responses/ValidationError"}
    patch_success["409"] = {"$ref": "#/components/responses/Conflict"}
    patch_success["412"] = {"$ref": "#/components/responses/PreconditionFailed"}
    patch_success["422"] = {"$ref": "#/components/responses/UnprocessableEntity"}

    delete_success = {
        "204": {"description": "Deleted or archived"},
        "401": {"$ref": "#/components/responses/Unauthorized"},
        "403": {"$ref": "#/components/responses/Forbidden"},
        "404": {"$ref": "#/components/responses/NotFound"},
        "409": {"$ref": "#/components/responses/Conflict"},
        "412": {"$ref": "#/components/responses/PreconditionFailed"},
        "500": {"$ref": "#/components/responses/InternalError"},
    }

    paths: dict = {
        collection_path: {
            "get": op(
                f"list{tag}",
                f"List {tag.lower()}",
                permissions["list"],
                list_success,
                {
                    "parameters": [
                        {"$ref": "#/components/parameters/CorrelationId"},
                        {"$ref": "#/components/parameters/Limit"},
                        {"$ref": "#/components/parameters/Cursor"},
                        {"$ref": "#/components/parameters/Sort"},
                        {"$ref": "#/components/parameters/Fields"},
                        {"$ref": "#/components/parameters/Include"},
                    ],
                },
            ),
            "post": op(
                f"create{tag}",
                f"Create {tag.lower()}",
                permissions["create"],
                create_success,
                {
                    "parameters": [
                        {"$ref": "#/components/parameters/CorrelationId"},
                        {"$ref": "#/components/parameters/IdempotencyKey"},
                    ],
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {"$ref": f"#/components/schemas/{create_schema}"},
                            }
                        },
                    },
                },
            ),
            "put": {
                "operationId": f"put{tag}CollectionUnsupported",
                "summary": f"PUT not supported on {collection_path}",
                "tags": [tag],
                "x-implementation-status": "unsupported",
                "x-http-status": 405,
                "responses": {
                    "405": {"$ref": "#/components/responses/MethodNotAllowed"},
                },
            },
        },
        item_path: {
            "get": op(
                f"get{tag}",
                f"Get {tag.lower()} by ID",
                permissions["get"],
                detail_success,
                {
                    "parameters": [
                        {"$ref": "#/components/parameters/CorrelationId"},
                        {"$ref": "#/components/parameters/Fields"},
                        {"$ref": "#/components/parameters/Include"},
                        {
                            "name": id_param,
                            "in": "path",
                            "required": True,
                            "schema": {"type": "string"},
                        },
                    ],
                },
            ),
            "patch": op(
                f"update{tag}",
                f"Update {tag.lower()}",
                permissions["update"],
                patch_success,
                {
                    "parameters": [
                        {"$ref": "#/components/parameters/CorrelationId"},
                        {"$ref": "#/components/parameters/IfMatch"},
                        {
                            "name": id_param,
                            "in": "path",
                            "required": True,
                            "schema": {"type": "string"},
                        },
                    ],
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {"$ref": f"#/components/schemas/{update_schema}"},
                            }
                        },
                    },
                },
            ),
            "delete": op(
                f"delete{tag}",
                delete_description,
                permissions["delete"],
                delete_success,
                {
                    "parameters": [
                        {"$ref": "#/components/parameters/CorrelationId"},
                        {"$ref": "#/components/parameters/IfMatch"},
                        {
                            "name": id_param,
                            "in": "path",
                            "required": True,
                            "schema": {"type": "string"},
                        },
                    ],
                },
            ),
        },
    }

    if not put_supported:
        paths[item_path]["put"] = {
            "operationId": f"put{tag}Unsupported",
            "summary": f"PUT not supported in v1 — use PATCH",
            "description": "Full replacement via PUT is not supported in Law API v1. Use PATCH for partial updates.",
            "tags": [tag],
            "x-implementation-status": "unsupported",
            "x-http-status": 405,
            "responses": {"405": {"$ref": "#/components/responses/MethodNotAllowed"}},
        }

    return paths


def build_paths() -> dict:
    paths: dict = {}

    paths.update(
        crud_paths(
            "clients",
            "Clients",
            "clientId",
            "ClientSummaryV1",
            "ClientDetailV1",
            "CreateClientV1Request",
            "UpdateClientV1Request",
            {
                "list": "legal.client.view",
                "create": "legal.client.create",
                "get": "legal.client.view",
                "update": "legal.client.edit",
                "delete": "legal.client.delete",
            },
            delete_description="Archive client (soft delete).",
        )
    )
    paths.update(
        crud_paths(
            "matters",
            "Matters",
            "matterId",
            "MatterSummaryV1",
            "MatterDetailV1",
            "CreateMatterV1Request",
            "UpdateMatterV1Request",
            {
                "list": "legal.matter.view",
                "create": "legal.matter.create",
                "get": "legal.matter.view",
                "update": "legal.matter.edit",
                "delete": "legal.matter.archive",
            },
            delete_description="Archive matter.",
        )
    )
    paths.update(
        crud_paths(
            "documents",
            "Documents",
            "documentId",
            "DocumentSummaryV1",
            "DocumentDetailV1",
            "CreateDocumentV1Request",
            "UpdateDocumentV1Request",
            {
                "list": "legal.document.view",
                "create": "legal.document.create",
                "get": "legal.document.view",
                "update": "legal.document.edit",
                "delete": "legal.document.archive",
            },
            delete_description="Archive document metadata.",
        )
    )
    paths.update(
        crud_paths(
            "tasks",
            "Tasks",
            "taskId",
            "TaskSummaryV1",
            "TaskDetailV1",
            "CreateTaskV1Request",
            "UpdateTaskV1Request",
            {
                "list": "legal.task.view",
                "create": "legal.task.create",
                "get": "legal.task.view",
                "update": "legal.task.edit",
                "delete": "legal.task.archive",
            },
            delete_description="Archive task.",
        )
    )
    paths.update(
        crud_paths(
            "calendar-events",
            "Calendar",
            "calendarEventId",
            "CalendarEventSummaryV1",
            "CalendarEventDetailV1",
            "CreateCalendarEventV1Request",
            "UpdateCalendarEventV1Request",
            {
                "list": "legal.calendar.view",
                "create": "legal.calendar.create",
                "get": "legal.calendar.view",
                "update": "legal.calendar.edit",
                "delete": "legal.calendar.cancel",
            },
            delete_description="Cancel calendar event.",
        )
    )
    paths.update(
        crud_paths(
            "time-entries",
            "Time",
            "timeEntryId",
            "TimeEntrySummaryV1",
            "TimeEntryDetailV1",
            "CreateTimeEntryV1Request",
            "UpdateTimeEntryV1Request",
            {
                "list": "legal.time.view",
                "create": "legal.time.create",
                "get": "legal.time.view",
                "update": "legal.time.edit",
                "delete": "legal.time.delete",
            },
            delete_description="Delete time entry (hard delete when unbilled).",
        )
    )
    paths.update(
        crud_paths(
            "invoices",
            "Billing",
            "invoiceId",
            "InvoiceSummaryV1",
            "InvoiceDetailV1",
            "CreateInvoiceV1Request",
            "UpdateInvoiceV1Request",
            {
                "list": "legal.invoice.view",
                "create": "legal.invoice.create",
                "get": "legal.invoice.view",
                "update": "legal.invoice.edit",
                "delete": "legal.invoice.cancel",
            },
            delete_description="Void invoice when in draft; cancel otherwise.",
        )
    )

    paths["/search"] = {
        "get": {
            "operationId": "searchLegalEntities",
            "summary": "Quick search across legal entities",
            "tags": ["Search"],
            "x-implementation-status": "planned",
            "x-required-permission": "legal.search.execute",
            "security": [{"SessionCookie": []}, {"BearerAuth": []}],
            "parameters": [
                {"$ref": "#/components/parameters/CorrelationId"},
                {"$ref": "#/components/parameters/Limit"},
                {
                    "name": "query",
                    "in": "query",
                    "required": True,
                    "schema": {"type": "string", "minLength": 1},
                },
                {
                    "name": "entityTypes",
                    "in": "query",
                    "required": False,
                    "schema": {"type": "string"},
                    "description": "Comma-separated entity types to search.",
                },
            ],
            "responses": {
                "200": {
                    "description": "Search results",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "required": ["ok", "data", "meta"],
                                "properties": {
                                    "ok": {"type": "boolean", "const": True},
                                    "data": {"$ref": "#/components/schemas/SearchResultV1"},
                                    "meta": {"$ref": "#/components/schemas/ResponseMeta"},
                                },
                            }
                        }
                    },
                },
                "401": {"$ref": "#/components/responses/Unauthorized"},
                "403": {"$ref": "#/components/responses/Forbidden"},
                "400": {"$ref": "#/components/responses/ValidationError"},
                "429": {"$ref": "#/components/responses/RateLimited"},
                "500": {"$ref": "#/components/responses/InternalError"},
            },
        },
        "post": {
            "operationId": "searchLegalEntitiesAdvanced",
            "summary": "Advanced search with structured query body",
            "tags": ["Search"],
            "x-implementation-status": "planned",
            "x-required-permission": "legal.search.execute",
            "security": [{"SessionCookie": []}, {"BearerAuth": []}],
            "parameters": [{"$ref": "#/components/parameters/CorrelationId"}],
            "requestBody": {
                "required": True,
                "content": {
                    "application/json": {
                        "schema": {"$ref": "#/components/schemas/SearchQueryV1"},
                    }
                },
            },
            "responses": {
                "200": {
                    "description": "Search results",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "required": ["ok", "data", "meta"],
                                "properties": {
                                    "ok": {"type": "boolean", "const": True},
                                    "data": {"$ref": "#/components/schemas/SearchResultV1"},
                                    "meta": {"$ref": "#/components/schemas/ResponseMeta"},
                                },
                            }
                        }
                    },
                },
                "401": {"$ref": "#/components/responses/Unauthorized"},
                "403": {"$ref": "#/components/responses/Forbidden"},
                "400": {"$ref": "#/components/responses/ValidationError"},
                "422": {"$ref": "#/components/responses/UnprocessableEntity"},
                "429": {"$ref": "#/components/responses/RateLimited"},
                "500": {"$ref": "#/components/responses/InternalError"},
            },
        },
    }

    paths["/dashboard/executive"] = {
        "get": {
            "operationId": "getExecutiveDashboard",
            "summary": "Executive firm overview dashboard",
            "tags": ["Dashboard"],
            "x-implementation-status": "planned",
            "x-required-permission": "legal.nav.dashboard.view",
            "security": [{"SessionCookie": []}, {"BearerAuth": []}],
            "parameters": [{"$ref": "#/components/parameters/CorrelationId"}],
            "responses": {
                "200": {
                    "description": "Dashboard snapshot",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "required": ["ok", "data", "meta"],
                                "properties": {
                                    "ok": {"type": "boolean", "const": True},
                                    "data": {"$ref": "#/components/schemas/ExecutiveDashboardV1"},
                                    "meta": {"$ref": "#/components/schemas/ResponseMeta"},
                                },
                            }
                        }
                    },
                },
                "401": {"$ref": "#/components/responses/Unauthorized"},
                "403": {"$ref": "#/components/responses/Forbidden"},
                "500": {"$ref": "#/components/responses/InternalError"},
            },
        }
    }

    paths["/activities"] = {
        "get": {
            "operationId": "listActivities",
            "summary": "List activity timeline entries",
            "tags": ["Activities"],
            "x-implementation-status": "planned",
            "x-required-permission": "legal.activity.view",
            "security": [{"SessionCookie": []}, {"BearerAuth": []}],
            "parameters": [
                {"$ref": "#/components/parameters/CorrelationId"},
                {"$ref": "#/components/parameters/Limit"},
                {"$ref": "#/components/parameters/Cursor"},
                {
                    "name": "matterId",
                    "in": "query",
                    "schema": {"type": "string"},
                },
                {
                    "name": "clientId",
                    "in": "query",
                    "schema": {"type": "string"},
                },
            ],
            "responses": {
                "200": {
                    "description": "Activity list",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "required": ["ok", "data", "pagination", "meta"],
                                "properties": {
                                    "ok": {"type": "boolean", "const": True},
                                    "data": {
                                        "type": "array",
                                        "items": {"$ref": "#/components/schemas/ActivityV1"},
                                    },
                                    "pagination": {"$ref": "#/components/schemas/PaginationMeta"},
                                    "meta": {"$ref": "#/components/schemas/ResponseMeta"},
                                },
                            }
                        }
                    },
                },
                "401": {"$ref": "#/components/responses/Unauthorized"},
                "403": {"$ref": "#/components/responses/Forbidden"},
                "429": {"$ref": "#/components/responses/RateLimited"},
                "500": {"$ref": "#/components/responses/InternalError"},
            },
        }
    }

    paths["/activities/{activityId}"] = {
        "get": {
            "operationId": "getActivity",
            "summary": "Get activity by ID",
            "tags": ["Activities"],
            "x-implementation-status": "planned",
            "x-required-permission": "legal.activity.view",
            "security": [{"SessionCookie": []}, {"BearerAuth": []}],
            "parameters": [
                {"$ref": "#/components/parameters/CorrelationId"},
                {
                    "name": "activityId",
                    "in": "path",
                    "required": True,
                    "schema": {"type": "string"},
                },
            ],
            "responses": {
                "200": {
                    "description": "Activity detail",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "required": ["ok", "data", "meta"],
                                "properties": {
                                    "ok": {"type": "boolean", "const": True},
                                    "data": {"$ref": "#/components/schemas/ActivityV1"},
                                    "meta": {"$ref": "#/components/schemas/ResponseMeta"},
                                },
                            }
                        }
                    },
                },
                "401": {"$ref": "#/components/responses/Unauthorized"},
                "403": {"$ref": "#/components/responses/Forbidden"},
                "404": {"$ref": "#/components/responses/NotFound"},
                "500": {"$ref": "#/components/responses/InternalError"},
            },
        },
        "post": {
            "operationId": "createActivityUnsupported",
            "summary": "POST not supported — activities are system-generated",
            "tags": ["Activities"],
            "x-implementation-status": "unsupported",
            "responses": {"405": {"$ref": "#/components/responses/MethodNotAllowed"}},
        },
    }

    paths["/notifications"] = {
        "get": {
            "operationId": "listNotifications",
            "summary": "List user notifications",
            "tags": ["Notifications"],
            "x-implementation-status": "planned",
            "x-required-permission": "legal.notification.view",
            "security": [{"SessionCookie": []}, {"BearerAuth": []}],
            "parameters": [
                {"$ref": "#/components/parameters/CorrelationId"},
                {"$ref": "#/components/parameters/Limit"},
                {"$ref": "#/components/parameters/Cursor"},
                {
                    "name": "read",
                    "in": "query",
                    "schema": {"type": "boolean"},
                },
            ],
            "responses": {
                "200": {
                    "description": "Notification list",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "required": ["ok", "data", "pagination", "meta"],
                                "properties": {
                                    "ok": {"type": "boolean", "const": True},
                                    "data": {
                                        "type": "array",
                                        "items": {"$ref": "#/components/schemas/NotificationV1"},
                                    },
                                    "pagination": {"$ref": "#/components/schemas/PaginationMeta"},
                                    "meta": {"$ref": "#/components/schemas/ResponseMeta"},
                                },
                            }
                        }
                    },
                },
                "401": {"$ref": "#/components/responses/Unauthorized"},
                "403": {"$ref": "#/components/responses/Forbidden"},
                "429": {"$ref": "#/components/responses/RateLimited"},
                "500": {"$ref": "#/components/responses/InternalError"},
            },
        }
    }

    paths["/notifications/{notificationId}"] = {
        "get": {
            "operationId": "getNotification",
            "summary": "Get notification by ID",
            "tags": ["Notifications"],
            "x-implementation-status": "planned",
            "x-required-permission": "legal.notification.view",
            "security": [{"SessionCookie": []}, {"BearerAuth": []}],
            "parameters": [
                {"$ref": "#/components/parameters/CorrelationId"},
                {
                    "name": "notificationId",
                    "in": "path",
                    "required": True,
                    "schema": {"type": "string"},
                },
            ],
            "responses": {
                "200": {
                    "description": "Notification detail",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "required": ["ok", "data", "meta"],
                                "properties": {
                                    "ok": {"type": "boolean", "const": True},
                                    "data": {"$ref": "#/components/schemas/NotificationV1"},
                                    "meta": {"$ref": "#/components/schemas/ResponseMeta"},
                                },
                            }
                        }
                    },
                },
                "401": {"$ref": "#/components/responses/Unauthorized"},
                "403": {"$ref": "#/components/responses/Forbidden"},
                "404": {"$ref": "#/components/responses/NotFound"},
                "500": {"$ref": "#/components/responses/InternalError"},
            },
        },
        "patch": {
            "operationId": "updateNotification",
            "summary": "Mark notification read/unread",
            "tags": ["Notifications"],
            "x-implementation-status": "planned",
            "x-required-permission": "legal.notification.edit",
            "security": [{"SessionCookie": []}, {"BearerAuth": []}],
            "parameters": [
                {"$ref": "#/components/parameters/CorrelationId"},
                {
                    "name": "notificationId",
                    "in": "path",
                    "required": True,
                    "schema": {"type": "string"},
                },
            ],
            "requestBody": {
                "required": True,
                "content": {
                    "application/json": {
                        "schema": {"$ref": "#/components/schemas/UpdateNotificationV1Request"},
                    }
                },
            },
            "responses": {
                "200": {
                    "description": "Updated notification",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "required": ["ok", "data", "meta"],
                                "properties": {
                                    "ok": {"type": "boolean", "const": True},
                                    "data": {"$ref": "#/components/schemas/NotificationV1"},
                                    "meta": {"$ref": "#/components/schemas/ResponseMeta"},
                                },
                            }
                        }
                    },
                },
                "401": {"$ref": "#/components/responses/Unauthorized"},
                "403": {"$ref": "#/components/responses/Forbidden"},
                "404": {"$ref": "#/components/responses/NotFound"},
                "400": {"$ref": "#/components/responses/ValidationError"},
                "500": {"$ref": "#/components/responses/InternalError"},
            },
        },
    }

    paths["/health"] = {
        "get": {
            "operationId": "getLegalApiHealth",
            "summary": "API liveness probe",
            "tags": ["Health"],
            "x-implementation-status": "implemented",
            "security": [],
            "parameters": [{"$ref": "#/components/parameters/CorrelationId"}],
            "responses": {
                "200": {
                    "description": "Healthy",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "required": ["ok", "data", "meta"],
                                "properties": {
                                    "ok": {"type": "boolean", "const": True},
                                    "data": {"$ref": "#/components/schemas/HealthV1"},
                                    "meta": {"$ref": "#/components/schemas/ResponseMeta"},
                                },
                            }
                        }
                    },
                },
                "500": {"$ref": "#/components/responses/InternalError"},
            },
        }
    }

    paths["/diagnostics"] = {
        "get": {
            "operationId": "getLegalApiDiagnostics",
            "summary": "Authenticated scaffold diagnostics",
            "tags": ["Health"],
            "x-implementation-status": "implemented",
            "x-required-permission": "legal.nav.dashboard.view",
            "security": [{"SessionCookie": []}, {"BearerAuth": []}],
            "parameters": [{"$ref": "#/components/parameters/CorrelationId"}],
            "responses": {
                "200": {
                    "description": "Diagnostics payload",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "required": ["ok", "data", "meta"],
                                "properties": {
                                    "ok": {"type": "boolean", "const": True},
                                    "data": {"$ref": "#/components/schemas/DiagnosticsV1"},
                                    "meta": {"$ref": "#/components/schemas/ResponseMeta"},
                                },
                            }
                        }
                    },
                },
                "401": {"$ref": "#/components/responses/Unauthorized"},
                "403": {"$ref": "#/components/responses/Forbidden"},
                "500": {"$ref": "#/components/responses/InternalError"},
            },
        }
    }

    return paths


def main() -> None:
    with COMPONENTS.open() as handle:
        components_doc = yaml.safe_load(handle)

    spec = {
        "openapi": "3.1.0",
        "jsonSchemaDialect": "https://spec.openapis.org/oas/3.1/dialect/base",
        "info": {
            "title": "APZHUB Law Platform API",
            "version": "1.0.0",
            "description": (
                "Canonical OpenAPI specification for the tenant-scoped Law Platform REST API. "
                "Base path `/api/law/v1/`. Entity endpoints are contract-only until LAW-014-04+."
            ),
            "contact": {"name": "APZHUB API Support"},
        },
        "servers": [
            {"url": "https://api.apzhub.com/api/law/v1", "description": "Production"},
            {"url": "https://staging.apzhub.com/api/law/v1", "description": "Staging"},
            {"url": "http://localhost:3300/api/law/v1", "description": "Local development"},
        ],
        "tags": [
            {"name": "Clients", "description": "Client directory and CRM"},
            {"name": "Matters", "description": "Matter lifecycle"},
            {"name": "Documents", "description": "Document metadata"},
            {"name": "Tasks", "description": "Task management"},
            {"name": "Calendar", "description": "Calendar events"},
            {"name": "Time", "description": "Time entries"},
            {"name": "Billing", "description": "Invoices and billing"},
            {"name": "Search", "description": "Unified search"},
            {"name": "Dashboard", "description": "Executive dashboards"},
            {"name": "Activities", "description": "Activity timeline (read-only)"},
            {"name": "Notifications", "description": "User notifications"},
            {"name": "Health", "description": "Health and diagnostics"},
        ],
        "paths": build_paths(),
        "components": components_doc["components"],
        "security": [{"SessionCookie": []}, {"BearerAuth": []}],
        "x-api-base-path": "/api/law/v1/",
        "x-versioning": {
            "urlVersion": "v1",
            "schemaSuffix": "V1",
            "acceptVersionHeader": "Accept-Version",
            "breakingChangePolicy": "New major path required for breaking changes.",
        },
    }

    OUTPUT.write_text(
        yaml.dump(spec, sort_keys=False, allow_unicode=True, width=120),
        encoding="utf-8",
    )
    print(f"Wrote {OUTPUT}")


if __name__ == "__main__":
    main()
