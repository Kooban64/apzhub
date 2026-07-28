# Policies — APZQEP-ENG-050A

Pure assertion policies (no I/O):

| Policy               | Responsibility                                                   |
| -------------------- | ---------------------------------------------------------------- |
| LifecyclePolicy      | Editability; authoritative only when Approved; rejected≠approved |
| ApprovalPolicy       | Approve/reject only from UnderReview                             |
| ReviewPolicy         | Review starts from Draft; reviewer required                      |
| OwnershipPolicy      | Owner required; transfer actor required                          |
| RelationshipPolicy   | No self-reference; reference required                            |
| PriorityPolicy       | Known priority catalogue                                         |
| VersionPolicy        | Unique labels; bump rules; authoritative guard                   |
| ClassificationPolicy | Classification required                                          |
| RiskPolicy           | Risk id + summary                                                |
| DependencyPolicy     | Dependency id + summary                                          |
| ImmutabilityPolicy   | Terminal / approved content immutability                         |
| SupersessionPolicy   | Only Approved may supersede; no self-supersession                |
| ValidationPolicy     | Required identity (id, title, objective, owner, classification)  |

Orchestrated via `SpecificationPolicyService`.
