# APZHUB Future Identity Platform Guide

**Status:** Roadmap documentation only (APZIDENTITY-006)  
**Do not implement** without a new approved programme and owner authorisation.

---

## Purpose

Informational roadmap for capabilities **outside** the frozen Identity Administration metadata SoR.

The frozen Identity Administration programme remains the canonical metadata System of Record. Future programmes must not silently expand the frozen path without ADR + owner approval.

## Possible future programmes

| Programme                          | Intent                                                                  |
| ---------------------------------- | ----------------------------------------------------------------------- |
| Authentication Administration      | Login, logout, session administration, password/MFA policy surfaces     |
| Provisioning Framework             | Controlled account creation in backend engines from service assignments |
| SCIM Integration                   | SCIM inbound/outbound identity exchange                                 |
| LDAP Integration                   | LDAP directory connectivity                                             |
| Microsoft Entra ID Connector       | Entra ID integration                                                    |
| Google Workspace Connector         | Google Workspace directory integration                                  |
| External Directory Synchronisation | Scheduled/directory sync pipelines                                      |
| Identity Federation                | Federation / trust relationships                                        |
| Identity Analytics                 | Analytics over identity metadata (derived indexes only)                 |

## Rules for future work

1. Do not modify the frozen Identity Administration architecture without ADR + owner approval
2. Do not store authentication credentials in `platform_iam_*`
3. Do not implement delivery, IdP probes, or provisioning inside the frozen Workbench/HTTP surface
4. Prefer new programmes (e.g. Authentication Administration) over extending APZIDENTITY SoR scope implicitly

## Recommended next platform programme (outside Identity)

**APZOBSERVE-001 — Platform Observability Foundation** — metrics, logs, traces, health aggregation, operational dashboards. Not an Identity feature. Do not implement until owner approval.

## See also

- [Identity Architecture Freeze Notice](../architecture/APZHUB-Identity-Architecture-Freeze-Notice.md)
- [Identity Reference Standard](../architecture/APZHUB-Identity-Reference-Standard.md)
