# Release Notes (Final) — Test Execution 1.0.0

## Version

`@apzhub/qep-test-execution` **1.0.0**  
Tag: `apzqep-test-execution-v1.0.0`  
Promoted from Freeze RC **1.0.0-rc.1** under **APZQEP-RELEASE-001**.

## Highlights

- Full Test Execution capability: Domain, Application, Infrastructure & API, Workbench
- Lifecycle through review finalisation, supersession, and external ingestion
- Permission-gated REST + Workbench with server-driven `availableActions`
- PostgreSQL persistence with RLS (migrations 0087/0088)
- Certified **PRODUCTION_READY_WITH_LIMITATIONS**

## Availability

**LIMITED_AVAILABILITY** — controlled production / pilot.  
Unrestricted GA requires L-02 remediation.

## Limitations

See [KNOWN-LIMITATIONS-REGISTER.md](./KNOWN-LIMITATIONS-REGISTER.md) (L-01…L-04).

## Compatibility

- Platform APZHUB QEP enable gate (`APZHUB_QEP_ENABLED`)
- Better Auth session + platform gateway authz
- Patch line **1.0.x** only via new Owner-authorised programmes after Freeze/Release acceptance
