# Notification Templates — APZQEP-120-S12

| Field   | Value                                |
| ------- | ------------------------------------ |
| Package | `@apzhub/qep-notification` **0.1.0** |

## Purpose

Reusable template registry with variable resolution and localisation hooks. No HTML editor. No WYSIWYG.

## Template fields

| Field           | Purpose                                |
| --------------- | -------------------------------------- |
| templateId      | Stable id                              |
| category        | Classification category                |
| defaultSeverity | Default severity                       |
| defaultPriority | Default priority                       |
| titleTemplate   | `{{var}}` substitution                 |
| bodyTemplate    | `{{var}}` substitution                 |
| defaultLocale   | Locale hook                            |
| localisation    | Optional locale → title/body overrides |

## Evidence catalogue (built-in)

| Template ID                                       | Event family      |
| ------------------------------------------------- | ----------------- |
| `qep.notification.template.evidence.created`      | created           |
| `qep.notification.template.evidence.updated`      | updated           |
| `qep.notification.template.evidence.lifecycle`    | lifecycle_changed |
| `qep.notification.template.evidence.integrity`    | integrity_*       |
| `qep.notification.template.evidence.archive`      | archived          |
| `qep.notification.template.evidence.supersession` | superseded        |
| `qep.notification.template.evidence.delete`       | deleted           |

Templates are registry entries — products may register more without engine changes.
