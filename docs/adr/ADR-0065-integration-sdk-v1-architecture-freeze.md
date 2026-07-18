# ADR-0065: Integration SDK v1.0.0 Promotion & Architecture Freeze

## Status

Accepted — OSS-100-11

## Context

OSS-100-10 certified `@apzhub/integration-sdk` as **`PRODUCTION_READY_WITH_LIMITATIONS`** while retaining package version **0.9.0** pending owner approval to promote and freeze the public API ([ADR-0058](./ADR-0058-integration-sdk-v1-readiness-limitations.md)).

Owner-approved **OSS-100-11 = Integration SDK v1.0.0 Wave Certification & Architecture Freeze** (supersedes older backlog labelling of 100-11 as “provisioning”). Provisioning, Event Bus, and webhook ingress remain deferred outside this milestone.

## Decision

1. Promote `@apzhub/integration-sdk` and `INTEGRATION_SDK_VERSION` to **1.0.0** with **no breaking public API changes** relative to 0.9.0.
2. Declare the Integration SDK architecture **Architecture Frozen**.
3. Publish the official Integration SDK Reference Standard and Freeze Notice.
4. Retain classification **PRODUCTION_READY_WITH_LIMITATIONS** (accepted limitations from ADR-0058 remain).
5. Semver policy after 1.0.0: PATCH for compatible fixes; MINOR for backward-compatible additions; MAJOR only with ADR + owner approval for breaking changes.
6. Provisioning / Event Bus / HTTP ingress are **not** required for 1.0.0 and remain out of scope.

## Consequences

- Consumers may treat **1.0.0** as the first stable API commitment within documented limitations.
- ADR-0058’s “remain at 0.9.0” clause is superseded for version pinning; its limitations catalogue remains authoritative.
- Further Integration SDK evolution requires ADR + owner approval + architecture review against the Freeze Notice.
- Certified provider packages are not force-bumped; they continue via `workspace:*`.

## Related

- [ADR-0058](./ADR-0058-integration-sdk-v1-readiness-limitations.md)
- [Architecture Freeze Notice](../architecture/APZHUB-Integration-SDK-Architecture-Freeze-Notice.md)
- [Reference Standard](../architecture/APZHUB-Integration-SDK-Reference-Standard.md)
- [OSS-100-11 Completion Report](../sprint/OSS-100-11-completion-report.md)
- [v1.0.0 Release Notes](../releases/APZHUB-Integration-SDK-v1.0.0-Release-Notes.md)
