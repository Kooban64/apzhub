# Requirements Domain

Aggregate: `RequirementAggregate` (requirement + history).

Categories: business, functional, non_functional, compliance, security, performance, operational, custom.

Lifecycle: draft → under_review → approved → active → deprecated → archived → retired.

Fields: priority, criticality, risk, owner, version, tags, release, component, application, suiteLinks (explicit).

Permissions: `qep.enterprise_requirements.{read,create,update,lifecycle,admin}`.
