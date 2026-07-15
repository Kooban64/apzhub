# Search Provider Management Guide

> **Milestone:** APZSEARCH-003

## Operations

list · get · register · update · enable · disable · set active · clear active · unregister · capabilities · status · validate configuration · lifecycle (initialise, validate, health, capabilities, diagnostics, dispose)

## Ownership

Providers declare ownership: `platform` | `tenant` | `organisation`. Tenant-owned providers must not become globally active. Visibility is tenant- and organisation-scoped.

## Trusted bootstrap only

Managed provider instances are supplied through trusted platform bootstrap / registry. Callers cannot supply executable implementations via API inputs. No filesystem/URL plugin loading.

## Explicitly not done

Provider search execution · dynamic code loading · engine client construction
