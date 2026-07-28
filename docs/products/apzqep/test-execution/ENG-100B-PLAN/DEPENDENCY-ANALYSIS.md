# ENG-100B Dependency Analysis (planning only)

## Inbound (required)

| Dependency           | Type            | Notes     |
| -------------------- | --------------- | --------- |
| ENG-100A scaffolding | Package layout  | Present   |
| ARCH-015             | Architecture    | Baselined |
| OES-ENG-090A PART-02 | Domain contract | Baselined |
| Build Contract       | Execution rules | IN FORCE  |

## Outbound (must not take)

| Dependency                       | Why forbidden in Domain Wave                             |
| -------------------------------- | -------------------------------------------------------- |
| `@apzhub/qep-test-plans` runtime | Resolution is Application/Infra via SourceResolutionPort |
| drizzle / postgres               | Infrastructure                                           |
| next / react                     | Presentation                                             |
| PermissionService adapters       | Application                                              |

## Estimated engineering sequence after authorisation

Scaffolding (done) → **Domain (100B)** → Application (100C) → Infrastructure & API (100D) → Workbench (100E) → ECR…
