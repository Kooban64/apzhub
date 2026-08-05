# Role Enablement

| Field     | Value              |
| --------- | ------------------ |
| Programme | APZHUB-OPERATE-001 |
| Status    | **IN FORCE**       |

## Principle

Enable **products and permissions** for the job—not every Activity Bar item for every person.

My Work remains the primary entry for all enabled users who have `platform.nav.home.view` (or successor).

## Role → product map

| Role                | My Work |             APZ Projects              |          APZ Support          |           APZ Time           |      APZQEP / Engineering       |
| ------------------- | :-----: | :-----------------------------------: | :---------------------------: | :--------------------------: | :-----------------------------: |
| **Executive**       |    ✓    |      Read / oversight as granted      | Read / escalations as granted |     Reporting as granted     |        No (unless Owner)        |
| **Manager**         |    ✓    |    View + approve delivery context    |    View team service load     |        View team time        |               No                |
| **Project Manager** |    ✓    |    Full delivery ops (per grants)     |       Related requests        |       Time on projects       |  As change owner if authorised  |
| **Support**         |    ✓    |         Related delivery refs         | Full service ops (per grants) |           Own time           |               No                |
| **QA**              |    ✓    |    View / verify delivery context     |  Defects / related as needed  |           Own time           |   Quality Flows / checklists    |
| **Developer**       |    ✓    |        Assigned delivery work         |   Related tickets as needed   |           Own time           |    Quality Flows for changes    |
| **Finance**         |    ✓    | Read cost/delivery context as granted |          As granted           | Time / effort accountability |               No                |
| **Administrator**   |    ✓    |       Admin surfaces as granted       |   Admin surfaces as granted   |  Admin surfaces as granted   | Platform ops (permission-gated) |

✓ = expected daily entry. Exact permission keys remain platform-authoritative (PermissionService). This table is enablement intent, not a bypass of server grants.

## Enablement steps (per role)

1. Confirm job function with manager.
2. Assign platform roles / permissions (least privilege).
3. Enable only needed products on the Activity Bar (permission-driven).
4. Walk Day-0 onboarding ([INTERNAL-USER-ONBOARDING.md](./INTERNAL-USER-ONBOARDING.md)).
5. Record enablement date for adoption metrics.

## Anti-patterns

| Do not                                     | Why                                             |
| ------------------------------------------ | ----------------------------------------------- |
| Grant all products “to be safe”            | Noise in My Work and shell; weakens composition |
| Train on engines                           | Breaks native product contract                  |
| Use Administrator as a normal user persona | Superadmin / admin is a special tier            |
