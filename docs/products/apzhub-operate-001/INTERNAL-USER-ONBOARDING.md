# Internal User Onboarding

| Field     | Value              |
| --------- | ------------------ |
| Programme | APZHUB-OPERATE-001 |
| Status    | **IN FORCE**       |

## Goal

A new APZOR staff member can sign in, understand My Work, and complete a first real task in the correct product within their first working day—without learning engine names.

## Prerequisites (administrator)

- [ ] Identity account created (or SSO mapped)
- [ ] Roles assigned per [ROLE-ENABLEMENT.md](./ROLE-ENABLEMENT.md)
- [ ] Products enabled for their department per [PRODUCT-ENABLEMENT-CHECKLIST.md](./PRODUCT-ENABLEMENT-CHECKLIST.md)
- [ ] User can reach `/workspace/home` after login

## Day-0 path (user)

### 1. Sign in

Open APZHUB → authenticate once. If login fails, stop and contact internal support ([SUPPORT-MODEL.md](./SUPPORT-MODEL.md)).

### 2. Land on My Work

Confirm greeting and queues:

- Needs My Attention
- Due Today
- Waiting For Others
- Recently Completed

Empty queues are normal on day one.

### 3. Learn the one sentence

> APZHUB answers what I need to do. Products answer how I do it.

### 4. First guided actions (role-dependent)

| Role                        | First action                                                   |
| --------------------------- | -------------------------------------------------------------- |
| Developer / Project Manager | Open Projects from My Work or Activity Bar; find assigned task |
| Support                     | Open Support inbox / assigned request                          |
| Anyone capturing time       | Open Time; start or submit today’s entry                       |
| QA / Engineer under change  | Follow APZQEP Quality Flow for authorised work only            |
| Executive / Manager         | Review My Work; open items that need approval or attention     |

### 5. Confirm success

User can answer:

1. Where do I see what needs me? → My Work
2. Where do I change a task / ticket / timesheet? → Owning product
3. Who do I ask when stuck? → Internal support path

## Administrator notes

- Do not provision engine-native accounts as the primary path.
- Do not create parallel training for Plane / Zammad / Kimai for end users.
- Prefer least privilege; expand products only when the role needs them.
