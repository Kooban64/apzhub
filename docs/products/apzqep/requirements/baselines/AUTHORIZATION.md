# Authorization

Baseline permissions: `qep.requirements.baselines.view`, `.create`, `.modify`
(draft edit/add-item/remove-item), `.lock`, `.archive`, `.compare`, and (Part 3)
`.verify`. Every application-service command asserts its required permission via
`assertAnyPermission`/`assertPermission` before touching state; the platform
service's `operation-authorization-map.ts` mirrors the same mapping for the
gateway layer, so authorization is enforced at both the service boundary and the
platform operation boundary. The Workbench UI additionally hides actions the
caller lacks permission for by consuming the DTO's `availableActions`, but the
server checks remain authoritative — the UI is a rendering convenience only.
